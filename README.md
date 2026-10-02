# SmartCommerce - Full-Stack E-Commerce Platform

SmartCommerce is a modern, full-stack e-commerce web application featuring user authentication, MongoDB-backed user data persistence, dynamic product reviews and ratings, server-side order calculations, Gemini AI shopping assistance, and strict security isolation.

---

## 🌟 Architecture & Data Flow

```
+------------------------------------+        REST API / HTTP        +------------------------------------+
|         React + Vite (Frontend)    |  <=========================>  |       Express + Node.js (Backend)  |
| - AiAssistant UI Component         |   POST /api/ai/chat           | - GEMINI_API_KEY stored securely   |
| - Dynamic UI & Toast Notifications |   Header: Authorization       | - Fetches MongoDB Product Context  |
| - Login / Logout State Sync        |           Bearer <token>      | - Grounded Gemini API Invocation   |
+------------------------------------+                               +------------------------------------+
                                                                                       |
                                                                                       | Mongoose ODM
                                                                                       v
                                                                     +------------------------------------+
                                                                     |          MongoDB Database          |
                                                                     | - Users (Cart & Wishlist refs)     |
                                                                     | - Products (Grounding Context)     |
                                                                     | - Reviews & Orders                 |
                                                                     +------------------------------------+
```

### Key Security & Data Flow Principles
1. **Gemini AI Integration**: All AI interactions pass through the backend endpoint `POST /api/ai/chat`. The `GEMINI_API_KEY` is loaded exclusively from `backend/.env` and is **never** exposed to client browsers.
2. **Catalog-Grounded Product Context**: For product queries, the backend loads live product data (names, categories, prices, ratings, stock, and descriptions) from MongoDB and injects it into Gemini's system instructions. Gemini is strictly instructed to avoid inventing non-existent items or pricing.
3. **User-Specific Persistence**: Cart items (`product` reference + `quantity`) and Wishlist items (`product` references) are stored in MongoDB under the authenticated user document.
4. **Server-Side Truth**: All order subtotal, shipping, tax, and grand total calculations are computed on the backend using active database product prices. Client-supplied price totals are strictly ignored.
5. **User Isolation**: Users can only read or mutate their own cart, wishlist, and order data. All protected endpoints use `req.user._id` extracted from verified JWT tokens.
6. **Auth Guards**: Unauthenticated users (guests) are restricted from adding items to cart or wishlist, accessing checkout, placing orders, or submitting product reviews.

---

## 🚀 Features

- **Gemini AI Shopping Assistant**: E-commerce-aware conversational assistant (`gemini-3.8-flash`) connected via backend. Provides product recommendations, price comparisons, stock checks, and feature highlights grounded in the MongoDB store catalog.
- **JWT Authentication & Security**: Secure sign-up and login with `bcryptjs` password hashing and stateless JSON Web Tokens.
- **MongoDB-Backed Cart**: Persistent cart per user stored in MongoDB. Quantitative adjustments (increment, decrement, set, remove) and stock validation.
- **MongoDB-Backed Wishlist**: Persistent wishlist per user stored in MongoDB. Toggle item favorites seamlessly across devices.
- **Login Synchronization**: Automatically fetches and restores user's MongoDB cart and wishlist state immediately upon successful authentication.
- **Logout State Cleanup**: Completely clears frontend cart/wishlist memory state and token storage upon logout.
- **Server-Side Order Calculation**: Recalculates prices directly from MongoDB to prevent client price tampering.
- **Stock Validation**: Verifies requested quantities against real-time product stock before updating cart or placing orders.
- **Product Reviews & Rating System**: Authenticated single-review policy per user per product, average rating recalculation, and chronological ordering.

---

## 📡 API Endpoints

### AI Shopping Assistant (`/api/ai`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/ai/chat` | Public | Send user message & chat history to Gemini AI with catalog context |

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register a new user account |
| POST | `/api/auth/login` | Public | Authenticate user & return JWT token |
| GET | `/api/auth/me` | Protected | Fetch current logged-in user profile |

### Products & Reviews (`/api/products`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/products` | Public | Fetch list of all products |
| GET | `/api/products/:id` | Public | Fetch single product by ID |
| GET | `/api/products/:id/reviews` | Public | Fetch reviews for a specific product |
| POST | `/api/products/:id/reviews` | Protected | Submit a review (1-5 stars & comment) |
| DELETE | `/api/products/:id/reviews/:reviewId` | Protected | Delete review (owner or admin only) |

### User Cart & Wishlist (`/api/users`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/users/cart` | Protected | Fetch authenticated user's cart from MongoDB |
| PUT | `/api/users/cart` | Protected | Add or update cart item / sync cart array |
| DELETE | `/api/users/cart/:productId` | Protected | Remove item from authenticated user's cart |
| GET | `/api/users/wishlist` | Protected | Fetch authenticated user's wishlist |
| POST | `/api/users/wishlist/:productId` | Protected | Add product to user wishlist |
| DELETE | `/api/users/wishlist/:productId` | Protected | Remove product from user wishlist |

### Orders (`/api/orders`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/orders` | Protected | Create order with server-side price & stock verification |
| GET | `/api/orders/myorders` | Protected | Fetch order history for authenticated user |
| GET | `/api/orders/:id` | Protected | Fetch single order (owner only) |

---

## 📁 Folder Structure

```
SmartCommerce/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database connection setup
│   ├── controllers/
│   │   ├── aiController.js       # Gemini AI assistant & product context logic
│   │   ├── authController.js     # Login / Register logic
│   │   ├── orderController.js    # Order processing & price calculations
│   │   ├── productController.js  # Products & Reviews logic
│   │   └── userController.js     # User Cart & Wishlist MongoDB logic
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT protection middleware
│   ├── models/
│   │   ├── Order.js              # Order schema
│   │   ├── Product.js            # Product schema (rating & numReviews)
│   │   ├── Review.js             # Product Review schema
│   │   └── User.js               # User schema (cart & wishlist refs)
│   ├── routes/
│   │   ├── aiRoutes.js           # Gemini AI endpoint router
│   │   ├── authRoutes.js         # Auth routes
│   │   ├── orderRoutes.js        # Order routes
│   │   ├── productRoutes.js      # Product & Review routes
│   │   └── userRoutes.js         # User Cart & Wishlist routes
│   ├── server.js                 # Express app initialization
│   ├── test_ai.js                # Gemini AI test suite
│   ├── test_phase2.js            # Phase 2 test suite
│   ├── test_phase3.js            # Phase 3 test suite
│   └── test_phase4.js            # Phase 4 test suite
├── frontend/
│   ├── src/
│   │   ├── components/           # AiAssistant, Navbar, ProductCard, etc.
│   │   ├── pages/                # Home, Products, Cart, Wishlist, Checkout, Login, etc.
│   │   ├── styles/               # AiAssistant.css, etc.
│   │   ├── utils/
│   │   │   └── api.js            # Centralized API fetch helper (VITE_API_URL)
│   │   ├── App.jsx               # Main React component & State management
│   │   └── main.jsx              # Application entry point
│   ├── index.html                # HTML Template
│   └── vite.config.js            # Vite configuration
└── README.md                     # Project documentation
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
Create a `.env` file inside the `backend/` directory with the following variables:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/smartcommerce?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key_here
```

### Frontend (`frontend/.env`)
Create a `.env` file inside the `frontend/` directory with the following variable:

```env
VITE_API_URL=http://localhost:5000
```

> **Security Note**: Never commit `.env` files or real API keys to version control. The `GEMINI_API_KEY` is strictly kept on the backend.

---

## 🛠️ Setup & Installation Instructions

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn
- MongoDB Atlas cluster URI
- Google Gemini API Key

### 2. Backend Setup
```bash
cd backend
npm install
npm start
```
The server will run at `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The application will run at `http://localhost:5173`.

---

## 🧪 Testing Commands

Run the following commands from their respective directories to verify application health, code quality, and security bounds:

### Frontend Checks
```bash
cd frontend
npm run lint       # Run ESLint validation
npm run build      # Verify production build
```

### Backend Integration Test Suites
```bash
cd backend

# Gemini AI Assistant & Catalog Context Tests
node test_ai.js

# Phase 2: Order Server Calculation & Isolation Tests
node test_phase2.js

# Phase 3: Product Reviews & Rating Recalculation Tests
node test_phase3.js

# Phase 4: User Cart & Wishlist Persistence & Security Tests
node test_phase4.js
```

---

## 📌 Project Status

| Feature | Status | Notes |
|---------|--------|-------|
| User Authentication & JWT | ✅ Complete | bcryptjs password hashing & JWT tokens |
| MongoDB Cart Persistence | ✅ Complete | User-specific cart stored in MongoDB |
| MongoDB Wishlist Persistence | ✅ Complete | User-specific wishlist stored in MongoDB |
| Server-side Order Calculation | ✅ Complete | Recalculated directly from database prices |
| Stock Validation | ✅ Complete | Stock limits enforced before cart/order update |
| Product Reviews & Ratings | ✅ Complete | 1 per user per product, average rating update |
| Gemini AI Shopping Assistant | ✅ Complete | Backend API (`POST /api/ai/chat`) grounded in MongoDB context |
| Real Payment Gateway | 🚧 Planned | Future phase |
| Admin Dashboard | 🚧 Planned | Future phase |
