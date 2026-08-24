const http = require('http');
const mongoose = require('mongoose');

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', (e) => reject(e));
    if (postData) req.write(JSON.stringify(postData));
    req.end();
  });
}

async function runLiveVerification() {
  console.log('===============================================================');
  console.log('  QUICKBITE — LIVE MONGODB PERSISTENCE & API VERIFICATION REPORT');
  console.log('===============================================================\n');

  // Step 1: Connect to MongoDB directly to verify instance status
  const mongoUri = 'mongodb://127.0.0.1:27017/quickbite';
  await mongoose.connect(mongoUri);
  console.log(`[1. MongoDB Engine Status]`);
  console.log(`    Connection State: CONNECTED (readyState = ${mongoose.connection.readyState})`);
  console.log(`    Host: ${mongoose.connection.host}`);
  console.log(`    Port: ${mongoose.connection.port}`);
  console.log(`    Database Name: ${mongoose.connection.name}`);
  console.log(`    Collections: ${Object.keys(mongoose.connection.collections).join(', ')}\n`);

  // Step 2: GET /api/v1/restaurants
  const res1 = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/v1/restaurants', method: 'GET'
  });
  console.log(`[2. GET /api/v1/restaurants]`);
  console.log(`    HTTP Status: ${res1.status}`);
  console.log(`    Count: ${res1.data.count}`);
  console.log(`    Fetched Restaurants from MongoDB:`);
  res1.data.data.forEach((r, idx) => {
    console.log(`      [${idx + 1}] ID: ${r._id} | Name: ${r.name} | Cuisine: ${r.cuisine} | Open: ${r.isOpen}`);
  });
  console.log('');

  const targetRestaurant = res1.data.data[1]; // Pizza Bistro

  // Step 3: POST /api/v1/auth/login
  const res2 = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/v1/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'john@example.com', name: 'John Doe' });
  console.log(`[3. POST /api/v1/auth/login]`);
  console.log(`    HTTP Status: ${res2.status}`);
  console.log(`    Issued Token: ${res2.data.token}`);
  console.log(`    Customer ObjectId: ${res2.data.customer.id}\n`);

  const token = res2.data.token;
  const customerId = res2.data.customer.id;

  // Step 4: POST /api/v1/orders -> HTTP 201 Created
  const orderPayload = {
    customerId: customerId,
    restaurantId: targetRestaurant._id,
    items: [
      { name: 'Margherita Pizza', quantity: 2, price: 350 },
      { name: 'Garlic Bread', quantity: 1, price: 150 }
    ],
    totalAmount: 850,
    status: 'pending'
  };

  const res4 = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/v1/orders', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  }, orderPayload);

  console.log(`[4. POST /api/v1/orders -> REAL ORDER CREATION]`);
  console.log(`    HTTP Status: ${res4.status} (EXPECTED: 201)`);
  console.log(`    Response Body:`, JSON.stringify(res4.data, null, 2));

  const postOrderId = res4.data.order._id || res4.data.data._id;
  console.log(`    --> CREATED ORDER MONGO_ID: ${postOrderId}\n`);

  // Step 5: Direct Mongoose Database Document Inspection
  const Order = require('./backend/models/Order');
  const directDoc = await Order.findById(postOrderId).lean();

  console.log(`[5. DIRECT MONGODB DATABASE INSPECTION]`);
  console.log(`    Target Collection: orders`);
  console.log(`    Queried _id: ${postOrderId}`);
  console.log(`    Directly Found in MongoDB: ${directDoc ? 'YES (PERSISTED)' : 'NO'}`);
  console.log(`    Document Contents:`, JSON.stringify(directDoc, null, 2));
  console.log('');

  // Step 6: GET /api/v1/orders (Populated REST API call)
  const res6 = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/v1/orders', method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const getMatchedOrder = res6.data.data.find(o => o._id.toString() === postOrderId);

  console.log(`[6. GET /api/v1/orders -> POPULATED PERSISTENCE PROOF]`);
  console.log(`    HTTP Status: ${res6.status}`);
  console.log(`    Total Customer Orders: ${res6.data.count}`);
  console.log(`    Order Found in GET API List: ${getMatchedOrder ? 'YES' : 'NO'}`);
  if (getMatchedOrder) {
    console.log(`    Populated Customer: ${getMatchedOrder.customerId?.name} (${getMatchedOrder.customerId?.email})`);
    console.log(`    Populated Restaurant: ${getMatchedOrder.restaurantId?.name} (${getMatchedOrder.restaurantId?.cuisine})`);
  }
  console.log('');

  // Step 7: Triple-ID Equality Assertion
  console.log(`[7. THREE-WAY OBJECTID MATCHING EQUALITY ASSERTION]`);
  console.log(`    POST Response ID:     ${postOrderId}`);
  console.log(`    MongoDB Document ID:   ${directDoc._id.toString()}`);
  console.log(`    GET Response ID:      ${getMatchedOrder._id.toString()}`);
  const allMatch = (postOrderId === directDoc._id.toString()) && (postOrderId === getMatchedOrder._id.toString());
  console.log(`    MATCH VERIFIED:       ${allMatch ? 'YES ✅ (100% IDENTICAL)' : 'NO ❌'}\n`);

  // Step 8: Validation Error Test
  const res8 = await makeRequest({
    hostname: 'localhost', port: 5000, path: `/api/v1/orders/${postOrderId}/status`, method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  }, { status: 'invalid-status-value' });

  console.log(`[8. VALIDATION FAILURE TEST -> PATCH /api/v1/orders/:id/status]`);
  console.log(`    HTTP Status: ${res8.status} (EXPECTED: 400)`);
  console.log(`    Error Response:`, JSON.stringify(res8.data, null, 2));

  await mongoose.disconnect();
  console.log('\n===============================================================');
  console.log('  LIVE MONGODB PERSISTENCE VERIFICATION COMPLETE!');
  console.log('===============================================================');
}

runLiveVerification().catch(console.error);
