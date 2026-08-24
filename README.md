# QuickBite Food Ordering System 🍔

> **ITUE301: Advanced Web Development Frameworks**  
> Open-Book Practical Examination (Set A) — B.Tech. Semester 5 (AY 2026–27)  
> Department of Information Technology / Computer Engineering, CSPIT, CHARUSAT  
> **Student Roll No**: D25CE168 | **Batch**: D2  
> **Repository Name**: `itue301-Exam-D25CE168_D2`

---

## 📌 Project Overview
**QuickBite** is a full-stack MERN (MongoDB, Express.js, React, Node.js) web application designed to transition food ordering from phone-based chaos to a structured web platform. 

---

## 🔬 Live Verification Summary (Live MongoDB Instance)

```text
===============================================================
  QUICKBITE — LIVE MONGODB PERSISTENCE & API VERIFICATION REPORT
===============================================================

[1. MongoDB Engine Status]
    Connection State: CONNECTED (readyState = 1)
    Host: 127.0.0.1
    Port: 27017
    Database Name: quickbite
    Collections: customers, restaurants, orders

[2. GET /api/v1/restaurants]
    HTTP Status: 200 OK
    Count: 5
    Fetched Restaurants from MongoDB:
      - ID: 6a8bfc3d8dd299d453c102f3 | Name: Spice Villa | Cuisine: Indian | Open: true
      - ID: 6a8bfc3d8dd299d453c102f6 | Name: Burger Hub | Cuisine: Fast Food | Open: true
      - ID: 6a8bfc3d8dd299d453c102f4 | Name: Pizza Bistro | Cuisine: Italian | Open: true
      - ID: 6a8bfc3d8dd299d453c102f5 | Name: Wok & Roll | Cuisine: Chinese | Open: false
      - ID: 6a8bfc3d8dd299d453c102f7 | Name: Taco Town | Cuisine: Mexican | Open: false

[3. POST /api/v1/auth/login]
    HTTP Status: 200 OK
    Issued Token: qb_token_6a8bfc3d8dd299d453c102f1
    Customer ObjectId: 6a8bfc3d8dd299d453c102f1

[4. POST /api/v1/orders -> REAL ORDER CREATION]
    HTTP Status: 201 Created
    Created Order ID: 6a8bfc7a72e5531ec4b1463a

[5. DIRECT MONGODB DATABASE INSPECTION]
    Target Collection: orders
    Queried _id: 6a8bfc7a72e5531ec4b1463a
    Directly Found in MongoDB: YES (PERSISTED)

[6. GET /api/v1/orders -> POPULATED PERSISTENCE PROOF]
    HTTP Status: 200 OK
    Populated Customer: John Doe (john@example.com)
    Populated Restaurant: Burger Hub (Fast Food)

[7. THREE-WAY OBJECTID MATCHING EQUALITY ASSERTION]
    POST Response ID:     6a8bfc7a72e5531ec4b1463a
    MongoDB Document ID:   6a8bfc7a72e5531ec4b1463a
    GET Response ID:      6a8bfc7a72e5531ec4b1463a
    MATCH VERIFIED:       YES ✅ (100% IDENTICAL)

[8. VALIDATION FAILURE TEST -> PATCH /api/v1/orders/:id/status]
    HTTP Status: 400 Bad Request
    Message: Order validation failed (Status must be one of: pending, preparing, out-for-delivery, delivered, cancelled)
```

---

## 🛠️ Tech Stack & Technologies Used

- **Frontend**: React (v18), React Router (v6), Vite, HTML5, Vanilla CSS Design System.
- **Backend**: Node.js, Express.js REST API (`/api/v1/`).
- **Database**: MongoDB with Mongoose ODM (`mongodb://127.0.0.1:27017/quickbite`).
- **State & Routing**: React Context API (`AuthContext`), `useState`, `useEffect`, `React.lazy()` + `Suspense`, `ProtectedRoute`.

---

## 📂 Project Structure

```
quickbite/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB Mongoose connection handler
│   ├── controllers/
│   │   ├── authController.js     # POST /api/v1/auth/login handler
│   │   ├── restaurantController.js# GET /api/v1/restaurants handler
│   │   └── orderController.js    # POST, GET, PATCH /api/v1/orders handlers
│   ├── middleware/
│   │   ├── requestLogger.js      # Global logger: [METHOD] [PATH] [TIMESTAMP]
│   │   ├── authGuard.js          # Bearer token validation middleware
│   │   └── errorHandler.js       # Structured JSON error response handler
│   ├── models/
│   │   ├── Customer.js           # Mongoose Schema for Customer
│   │   ├── Restaurant.js         # Mongoose Schema for Restaurant
│   │   └── Order.js              # Mongoose Schema for Order
│   ├── routes/
│   │   ├── authRoutes.js         # Auth routing
│   │   ├── restaurantRoutes.js   # Restaurant routing
│   │   └── orderRoutes.js        # Order routing
│   ├── seed-live.js              # Live database seeder script
│   ├── verify-live-mongodb.js    # Live MongoDB persistence verification test
│   ├── mongo-server.js           # Standalone MongoDB engine runner
│   ├── server.js                 # Express server application entry point
│   └── package.json              # Backend dependencies & scripts
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navigation.jsx    # React Router navigation navbar
│   │   │   └── RestaurantCard.jsx# Reusable restaurant display card
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global auth state { customer, token }
│   │   ├── pages/
│   │   │   ├── HomePage.jsx      # Landing page
│   │   │   ├── RestaurantsPage.jsx# Restaurants listing & client-side search
│   │   │   ├── OrderPage.jsx     # Protected order form & live preview
│   │   │   └── AdminPanel.jsx    # Lazy-loaded admin oversight dashboard
│   │   ├── routes/
│   │   │   └── ProtectedRoute.jsx# Auth route wrapper with <Navigate to="/" />
│   │   ├── App.jsx               # Routes setup & Suspense fallback
│   │   ├── main.jsx              # App entry point
│   │   └── index.css             # Glassmorphic dark design system
│   ├── index.html
│   ├── vite.config.js            # Vite configuration & API proxy
│   └── package.json              # Frontend dependencies & scripts
│
├── .env.example                  # Environment variables template
├── .gitignore                    # Ignored files (node_modules, .env)
└── README.md                     # Documentation & Viva Reference
```

---

## 🔑 Environment Variables Setup

Create a `.env` file in the root directory (or inside `backend/`):

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/quickbite
```

> ⚠️ Never commit `.env` to source control. `.env.example` is committed as reference.

---

## 🚀 Installation & Run Instructions

### 1. Start MongoDB & Backend Server
```bash
cd backend
npm install
npm start
```
*The Express server connects to live MongoDB on `mongodb://127.0.0.1:27017/quickbite` and runs on `http://localhost:5000`.*

### 2. Start Frontend Server
```bash
cd frontend
npm install
npm run dev
```
*The Vite React development server runs on `http://localhost:3000`.*

---

## 🌐 API Endpoints Reference

| Method | Endpoint | Protection | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Public | Authenticate customer & issue token |
| `GET` | `/api/v1/restaurants` | Public | Return all restaurants |
| `POST` | `/api/v1/orders` | Protected | Create a new food order |
| `GET` | `/api/v1/orders` | Protected | Return customer orders (with Mongoose `.populate()`) |
| `PATCH`| `/api/v1/orders/:id/status` | Protected | Update order status (`pending`, `preparing`, `out-for-delivery`, `delivered`, `cancelled`) |

---

## 🏛️ Richardson Maturity Model Evaluation

### Current Maturity Level: **Level 2**

#### Evidence from Implementation:
1. **Resource URIs (Level 1)**: `/api/v1/auth/login`, `/api/v1/restaurants`, `/api/v1/orders`, `/api/v1/orders/:id/status`.
2. **HTTP Verbs (Level 2)**: `GET` (reading), `POST` (creation), `PATCH` (updating).
3. **HTTP Status Codes (Level 2)**: `200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `500 Internal Server Error`.

#### Requirements to reach Level 3 (HATEOAS):
Requires embedding hypermedia links (`_links`) in response bodies to dynamically direct clients to state transition endpoints.
