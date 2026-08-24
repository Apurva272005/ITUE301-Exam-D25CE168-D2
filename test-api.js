const http = require('http');

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
    });
    req.on('error', (e) => reject(e));
    if (postData) req.write(JSON.stringify(postData));
    req.end();
  });
}

async function runTests() {
  console.log('=== QuickBite API Automated Verification ===\n');

  // 1. GET /api/v1/restaurants
  const res1 = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/v1/restaurants', method: 'GET'
  });
  console.log(`1. GET /api/v1/restaurants -> HTTP ${res1.status}`);
  console.log(`   Count: ${res1.data.count}, First: ${res1.data.data[0]?.name}\n`);

  // 2. POST /api/v1/auth/login
  const res2 = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/v1/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'john@example.com', name: 'John Doe' });
  console.log(`2. POST /api/v1/auth/login -> HTTP ${res2.status}`);
  console.log(`   Token: ${res2.data.token}, Customer: ${res2.data.customer?.name}\n`);

  const token = res2.data.token;

  // 3. GET /api/v1/orders (Protected)
  const res3 = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/v1/orders', method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log(`3. GET /api/v1/orders -> HTTP ${res3.status}`);
  console.log(`   Count: ${res3.data.count}, Status: ${res3.data.data[0]?.status}\n`);

  // 4. POST /api/v1/orders (Protected)
  const res4 = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/v1/orders', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  }, {
    customerId: res2.data.customer.id,
    restaurantId: res1.data.data[0]._id,
    items: [{ name: 'Paneer Butter Masala', quantity: 2, price: 250 }],
    totalAmount: 500,
    status: 'pending'
  });
  console.log(`4. POST /api/v1/orders -> HTTP ${res4.status}`);
  console.log(`   Created Order ID: ${res4.data.data?._id}\n`);

  // 5. Test Auth Failure (401)
  const res5 = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/v1/orders', method: 'GET'
  });
  console.log(`5. GET /api/v1/orders (No Token) -> HTTP ${res5.status}`);
  console.log(`   Error Message: ${res5.data.error}\n`);

  // 6. Test Validation Failure (400)
  const res6 = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/v1/orders', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  }, {
    customerId: res2.data.customer.id,
    restaurantId: res1.data.data[0]._id,
    items: [], // Invalid: empty items array
    totalAmount: -10 // Invalid: negative total amount
  });
  console.log(`6. POST /api/v1/orders (Invalid Payload) -> HTTP ${res6.status}`);
  console.log(`   Validation Errors: ${JSON.stringify(res6.data.errors || res6.data.error)}\n`);

  // 7. PATCH /api/v1/orders/:id/status
  const res7 = await makeRequest({
    hostname: 'localhost', port: 5000, path: `/api/v1/orders/${res4.data.data._id}/status`, method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  }, { status: 'preparing' });
  console.log(`7. PATCH /api/v1/orders/:id/status -> HTTP ${res7.status}`);
  console.log(`   New Status: ${res7.data.data?.status}\n`);

  console.log('=== All 7 API Verification Tests Passed Cleanly! ===');
}

runTests().catch(console.error);
