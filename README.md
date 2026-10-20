# 🥐 Smart Bakery & Café — Full-Stack Real-Time E-Commerce System

[![Node.js Version](https://img.shields.io/badge/Node.js-18.x%20%7C%2020.x-339933?logo=node.js)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.2.x-646CFF?logo=vite)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%208.3-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7.5-010101?logo=socket.io)](https://socket.io/)
[![Vitest](https://img.shields.io/badge/Vitest-Automated%20Tests-729B1B?logo=vitest)](https://vitest.dev/)
[![Security](https://img.shields.io/badge/Auth-JWT%20HttpOnly%20%2B%20HMAC-E34F26)](https://jwt.io/)

A complete, production-grade full-stack web application designed for artisanal bakeries and modern cafés. Built with clean architecture, strict security best practices, and real-time synchronization between Customers, Kitchen Display Systems (KDS), Delivery Couriers, and Administration.

---

## 📋 Table of Contents
1. [Project Overview](#-project-overview)
2. [Architectural Highlights & Key Features](#-architectural-highlights--key-features)
3. [Technology Stack](#-technology-stack)
4. [Monorepo Directory Layout](#-monorepo-directory-layout)
5. [Prerequisites & System Requirements](#-prerequisites--system-requirements)
6. [Step-by-Step Installation & Run Guide](#-step-by-step-installation--run-guide)
7. [Pre-Seeded Accounts & Demo Credentials](#-pre-seeded-accounts--demo-credentials)
8. [Automated Test Suite](#-automated-test-suite)
9. [End-to-End Walkthrough & Verification Scenarios](#-end-to-end-walkthrough--verification-scenarios)
10. [Production Deployment Guide](#-production-deployment-guide)
11. [Troubleshooting & Common Pitfalls](#-troubleshooting--common-pitfalls)
12. [Architectural & Technical Interview Defense](#-architectural--technical-interview-defense)

---

## 🌟 Project Overview

**Smart Bakery & Café** bridges the gap between delicate artisanal food creation and high-efficiency logistics. Freshly baked goods have short shelf lives and fragile textures that cannot survive long-distance transit. 

To solve this:
1. **Geo-Fenced Quality Assurance**: A strict 5.0 km straight-line delivery radius calculated via spherical trigonometry (Haversine Formula) ensures bakery items arrive hot, fresh, and structurally intact.
2. **FEFO Inventory Management**: Batches with earliest expiration dates are sold first (*First-Expired, First-Out*), preventing stale goods and food waste.
3. **Real-Time Operational Harmony**: Order events automatically propagate through WebSockets (Socket.IO) to live kitchen displays, delivery rider manifests, and customer tracking dashboards.
4. **Cryptographic Pickup Authentication**: Express counter pickups use HMAC-SHA256 signed QR codes to eliminate fraudulent order claims and duplicate handovers.

---

## ⚡ Architectural Highlights & Key Features

### 👤 Customer Experience
- **Interactive Catalogue**: 30 seeded artisanal products across **Bakery**, **Non-Veg / Savory**, and **Café & Beverages** with vegetarian/eggless/gluten-free filters, instant search, and sorting.
- **Personalized Cake Builder**: Custom weight (0.5 kg to 3.0 kg), flavors, frostings, and **real-time live piped message simulation** rendering directly on a 3D-styled fondant canvas.
- **Barista Beverage Customizer**: Temperature (Iced/Hot), milk choice (Oat, Almond, Whole, Skim), sweetness (0% to 100%), and espresso shot selection with automatic price recalculation.
- **Smart Delivery Radius Checker**: Real-time browser GPS location integration with visual distance gauge and instant validation against the bakery's Connaught Place coordinates (`28.6315, 77.2167`).
- **Cart & Promo System**: Persistent cart, intelligent combo upselling suggestions, coupon application with minimum spend validation and maximum discount capping.
- **Express QR Pickup & Real-Time Live Tracking**: Five-stage interactive order stepper (Placed $\rightarrow$ Confirmed $\rightarrow$ Baking $\rightarrow$ Out for Delivery / Ready $\rightarrow$ Delivered / Picked Up) with instant WebSocket status updates.

### 🍳 Kitchen Display System (KDS)
- **Live Kanban Workflow**: 3-column ticket system (*New Orders*, *Baking / In Oven*, *Ready for Dispatch/Pickup*).
- **Zero-Dependency Audio Chime**: Automatically synthesizes a soothing dual-tone 800Hz/1000Hz alert chime via native browser **Web Audio API** whenever a customer places an order.
- **Time Elapsed Counter**: Color-coded urgency alerts (Green $< 15$ min, Yellow $15-30$ min, Red $> 30$ min) to keep kitchen staff on track.

### 🛵 Delivery Courier Portal
- **Mobile-First Rider Interface**: Active delivery assignments with customer phone hotlinks and 1-tap **Google Maps Turn-by-Turn Navigation** launch.
- **Handshake Verification PIN**: Couriers verify delivery by collecting and entering the customer's secret 4-digit confirmation PIN, preventing accidental deliveries to wrong addresses.

### 🛡️ Admin Command Center
- **Executive Analytics**: Real-time revenue charts, order counts, average order values, and category popularity metrics.
- **Product & Inventory Management**: Full product CRUD with image preview, price toggling, category mapping, and **FEFO Batch Restocking**.
- **Promotional Coupon Engine**: Create percentage or fixed-amount discount vouchers with validity expiration dates, usage counters, and maximum caps.
- **Cryptographic QR Counter Scanner**: Integrated camera and manual token verification terminal to validate and mark pickup orders as fulfilled with zero risk of replay attacks.
- **CSV Data Export**: Streamed live analytics download for accounting, inventory audits, and sales reports.

---

## 🛠️ Technology Stack

| Layer | Technologies Used | Description / Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | **React 18 (Vite)** | Fast, reactive virtual DOM with sub-second hot reload |
| **Routing** | **React Router DOM v6** | Client-side routing with nested role-based guards |
| **Design & Styling** | **Vanilla Modern CSS** | Bespoke warm artisanal bakery design system (Gold & Espresso palette) |
| **Icons** | **Lucide React** | Clean, lightweight SVG feather icons |
| **Delight** | **Canvas Confetti** | Smooth celebratory micro-animations on checkout completion |
| **Backend API** | **Node.js + Express.js** | Modular RESTful micro-architecture with MVC separation |
| **Database** | **MongoDB + Mongoose** | NoSQL document database with schema validation & atomic updates |
| **Real-Time** | **Socket.IO (Server & Client)** | Bidirectional, auto-reconnecting WebSocket event channels |
| **Security & Auth** | **JWT (HttpOnly Cookies)** | XSS-immune authentication tokens signed with 256-bit secrets |
| **Password Hashing** | **Bcrypt.js** | Salted password encryption with 10 salt rounds |
| **API Protection** | **Helmet & Express Rate Limit** | Hardened HTTP response headers and brute-force throttling |
| **QR Code Engine** | **QRCode & Crypto HMAC** | Tamper-proof, cryptographically signed customer pickup passes |
| **Test Suite** | **Vitest & Supertest** | Lightning-fast test runner for unit, math, and API integration tests |

---

## 📂 Monorepo Directory Layout

```text
smart-bakery-cafe/
├── .gitignore                      # Git exclusion rules for node_modules, .env, and dist
├── package.json                    # Monorepo orchestration scripts
├── README.md                       # Master technical documentation (this file)
│
├── docs/                           # Architectural Blueprints & API Docs
│   ├── api-documentation.md        # Full REST API endpoints & Socket.IO events reference
│   ├── architecture.md             # System architecture & component interaction flows
│   └── database-design.md          # Database schema ERD, Mongoose models & indexes
│
├── server/                         # Backend Application (Node.js & Express)
│   ├── .env.example                # Backend environment variable template
│   ├── .env                        # Local backend environment variables (pre-configured)
│   ├── package.json                # Backend dependencies and scripts
│   ├── server.js                   # Server entrypoint with HTTP & Socket.IO listener
│   ├── app.js                      # Express middleware, CORS, security, and route registry
│   │
│   ├── config/                     # Configuration modules
│   │   ├── constants.js            # Global store coordinates, status enums & rates
│   │   └── db.js                   # Mongoose database connection with retry logic
│   │
│   ├── models/                     # Mongoose Schemas & Data Models
│   │   ├── User.js                 # Customer, Admin, and Delivery Agent identities
│   │   ├── Product.js              # Bakery, Non-Veg, and Café product definitions
│   │   ├── InventoryBatch.js       # FEFO inventory batches with expiration tracking
│   │   ├── Order.js                # Order lifecycle, delivery coords, OTP & HMAC tokens
│   │   ├── Coupon.js               # Promotional discount vouchers & usage caps
│   │   ├── Payment.js              # Payment transactions (Razorpay & Cash-on-Delivery)
│   │   ├── Review.js               # Verified purchase 1-5 star ratings & comments
│   │   ├── DeliveryAssignment.js   # Courier dispatch logs & delivery handshake timestamps
│   │   └── BakerySettings.js       # Dynamic bakery store configuration & opening hours
│   │
│   ├── services/                   # Business Logic & External Integrations
│   │   ├── distanceService.js      # Haversine formula calculation & 5.0 km validation
│   │   ├── inventoryService.js     # Atomic FEFO stock deduction and order rollback
│   │   ├── qrService.js            # HMAC-SHA256 signature generation & QR image rendering
│   │   ├── socketService.js        # Socket.IO room subscriptions & real-time broadcasts
│   │   └── paymentService.js       # Razorpay order creation & signature verification
│   │
│   ├── middleware/                 # Express Pipeline Middlewares
│   │   ├── authMiddleware.js       # JWT cookie verification & RBAC role guards
│   │   ├── errorMiddleware.js      # Centralized error handler with dev/prod stack traces
│   │   ├── rateLimiter.js          # API rate limiting for auth and general endpoints
│   │   └── validateRequest.js      # Express-validator schema rejection handler
│   │
│   ├── validators/                 # Request Body Input Sanitizers
│   │   ├── authValidator.js        # Registration & login payload validation
│   │   ├── productValidator.js     # Product creation/modification validation
│   │   ├── orderValidator.js       # Order placement & address coordinates validation
│   │   └── couponValidator.js      # Voucher validation rules
│   │
│   ├── controllers/                # Request Handlers & API Responses
│   │   ├── authController.js       # Register, login, logout, me, refresh
│   │   ├── productController.js    # Catalogue browsing, search, filter, details
│   │   ├── orderController.js      # Checkout, order tracking, pickup QR verification
│   │   ├── deliveryController.js   # Courier assignment, status progression, PIN check
│   │   ├── couponController.js     # Voucher validation & admin coupon CRUD
│   │   ├── paymentController.js    # Payment verification & webhook handler
│   │   ├── reviewController.js     # Customer product review submission & listing
│   │   └── adminController.js      # Executive dashboard metrics & streaming CSV export
│   │
│   ├── routes/                     # REST Route Handlers
│   │   ├── authRoutes.js           # /api/auth/*
│   │   ├── productRoutes.js        # /api/products/*
│   │   ├── orderRoutes.js          # /api/orders/*
│   │   ├── deliveryRoutes.js       # /api/delivery/*
│   │   ├── couponRoutes.js         # /api/coupons/*
│   │   ├── paymentRoutes.js        # /api/payment/*
│   │   ├── reviewRoutes.js         # /api/reviews/*
│   │   └── adminRoutes.js          # /api/admin/*
│   │
│   ├── scripts/                    # Database Seed & Provisioning Utilities
│   │   ├── seedProducts.js         # Populates 30 products, active batches & promo coupons
│   │   └── createAdmin.js          # Seeds root administrator and courier test accounts
│   │
│   ├── tests/                      # Automated Test Suite (Vitest)
│   │   ├── setup.js                # Mock tokens, test DB helpers, environment overrides
│   │   ├── deliveryDistance.test.js# Haversine distance math precision & edge checks
│   │   ├── auth.test.js            # Password hashing, JWT verification & RBAC matrix
│   │   ├── cartAndCoupon.test.js   # Discount math, customizer pricing & cap constraints
│   │   └── orderWorkflow.test.js   # Order state machine & HMAC QR cryptographic integrity
│   │
│   └── utils/                      # Helper Utilities
│       ├── apiResponse.js          # Standardized JSend-style JSON response envelopes
│       └── logger.js               # Formatted console logger with timestamps
│
└── client/                         # Frontend Application (React 18 + Vite)
    ├── .env.example                # Frontend environment variable template
    ├── .env                        # Local frontend environment variables (pre-configured)
    ├── package.json                # Frontend dependencies and scripts
    ├── vite.config.js              # Vite bundler configuration & local API proxying
    ├── index.html                  # HTML5 entrypoint with Google Fonts integration
    │
    ├── public/                     # Static Public Assets
    │   ├── favicon.svg             # Bakery croissant SVG brand mark
    │   └── placeholder-food.svg    # Warm fallback graphic for missing product images
    │
    └── src/
        ├── main.jsx                # React root bootstrap with Context Provider tree
        ├── App.jsx                 # Route declarations & persistent layout wrappers
        ├── index.css               # Bespoke design system, CSS variables & animations
        │
        ├── context/                # Global State Providers
        │   ├── AuthContext.jsx     # User session, JWT cookie persistence & role checks
        │   ├── CartContext.jsx     # Persistent cart items, customizer deltas & coupons
        │   ├── LocationContext.jsx # HTML5 GPS coordinates & reverse geocoding
        │   └── SocketContext.jsx   # Real-time WebSocket connection & room event listeners
        │
        ├── hooks/                  # Custom React Hooks
        │   ├── useAuth.js          # Ergonomic hook for user session & permissions
        │   └── useCart.js          # Ergonomic hook for cart mutations & price calculations
        │
        ├── services/               # API & Network Services
        │   └── api.js              # Axios instance configured with credentials & interceptors
        │
        ├── utils/                  # Formatting & Math Helpers
        │   ├── formatters.js       # Currency formatting (₹ INR), date/time stamps
        │   └── distanceCalculator.js# Client-side Haversine helper for instantaneous preview
        │
        ├── components/             # Modular React Components
        │   ├── common/             # Reusable Global Components
        │   │   ├── Navbar.jsx      # Header with category navigation, cart badge & profile
        │   │   ├── Footer.jsx      # Brand mission, hours, contact & social links
        │   │   ├── LoadingSpinner.jsx# Elegant golden spinner with loading message
        │   │   ├── Toast.jsx       # Floating notifications (success, error, warning)
        │   │   └── ProtectedRoute.jsx# Role-based route guard for customer/admin/delivery
        │   │
        │   ├── customer/           # Customer Portal Components
        │   │   ├── ProductCard.jsx # Product tile with badges, price & Add-to-Cart
        │   │   ├── CakeBuilderModal.jsx # Live piped cake preview modal with text styling
        │   │   ├── BeverageCustomizerModal.jsx # Barista modal for milk, sweetness, and shots
        │   │   ├── ComboRecommender.jsx # Intelligent product pairing & cross-selling card
        │   │   ├── DeliveryRadiusChecker.jsx # Interactive GPS radius validation widget
        │   │   └── ReviewModal.jsx # Verified purchaser 5-star review submission modal
        │   │
        │   ├── qr/                 # QR Code Utilities
        │   │   └── QRPickupDisplay.jsx # Rendered pickup pass with instructions & print button
        │   │
        │   └── admin/              # Management Dashboard Components
        │       ├── AdminSidebar.jsx# Admin navigation drawer with badges
        │       ├── ProductFormModal.jsx # Add/Edit product modal with image preview
        │       └── BatchModal.jsx  # Inventory batch restocking modal with expiry date
        │
        └── pages/                  # Page Views & Dashboards
            ├── HomePage.jsx        # Landing hero, featured bakery highlights, reviews & FAQ
            ├── MenuPage.jsx        # Full product catalogue with category tabs & filters
            ├── ProductDetailPage.jsx# Product zoom, nutrition info, stock & reviews
            ├── CartPage.jsx        # Itemized cart, coupon voucher input & order summary
            ├── CheckoutPage.jsx    # Delivery vs Pickup toggle, address GPS & payment
            ├── OrderTrackingPage.jsx# Live 5-stage order tracker, OTP PIN & QR pass
            ├── OrdersHistoryPage.jsx# Past orders archive with 1-click reorder
            ├── FavoritesPage.jsx   # Customer wishlist & favorite items
            ├── LoginPage.jsx       # Customer / Staff authentication screen
            ├── RegisterPage.jsx    # New customer registration with instant login
            ├── ProfilePage.jsx     # Saved delivery addresses & account management
            │
            ├── kitchen/
            │   └── KitchenDashboardPage.jsx # Real-time KDS Kanban with Web Audio alert
            │
            ├── delivery/
            │   └── DeliveryDashboardPage.jsx# Courier dispatch list with turn-by-turn & PIN
            │
            └── admin/
                ├── AdminDashboardPage.jsx   # Key performance metrics, charts & recent orders
                ├── AdminProductsPage.jsx    # Product catalogue management & stock status
                ├── AdminOrdersPage.jsx      # Order list, status advancement & QR scanner
                ├── AdminInventoryPage.jsx   # FEFO batch audit & expiry tracking
                ├── AdminCouponsPage.jsx     # Promotional voucher management
                └── AdminAnalyticsPage.jsx   # Financial breakdown & CSV export
```

---

## 💻 Prerequisites & System Requirements

Before running the application, ensure you have the following installed on your machine:

1. **Node.js**: Version **`18.16.0`** or higher (Node.js 20.x LTS strongly recommended).
   - Check version: `node -v`
2. **npm**: Version **`9.x`** or higher.
   - Check version: `npm -v`
3. **MongoDB**:
   - **Option A (Local)**: MongoDB Community Server installed and running locally on `mongodb://127.0.0.1:27017`.
   - **Option B (Cloud)**: A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster URI (e.g. `mongodb+srv://<user>:<password>@cluster0.mongodb.net/smart_bakery_cafe`).
4. **Modern Web Browser**: Google Chrome, Mozilla Firefox, Microsoft Edge, or Safari with HTML5 Geolocation enabled.

---

## 🚀 Step-by-Step Installation & Run Guide

Follow these beginner-friendly instructions to get both the backend server and frontend client running on your computer.

### Step 1: Open Terminal in the Project Root
Open PowerShell (or Command Prompt) and navigate to the project directory:
```powershell
cd "c:\Users\DELL\Desktop\bakery website\smart-bakery-cafe"
```

### Step 2: Install Dependencies
Install all required Node modules for both the backend server and frontend client:

```powershell
# Option A: Install all dependencies with one command from the project root
npm run install:all

# OR Option B: Install individually in separate folders
cd server
npm install
cd ..\client
npm install
cd ..
```

---

### Step 3: Verify Environment Configurations
The pre-configured `.env` files are already generated in both directories! You can review or customize them:

#### Server Configuration (`server/.env`)
```ini
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/smart_bakery_cafe
JWT_SECRET=super_secret_jwt_key_smart_bakery_cafe_production_min32chars_key_2026
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7
BAKERY_NAME=Smart Bakery & Café
BAKERY_LAT=28.6315
BAKERY_LNG=77.2167
DELIVERY_MAX_RADIUS_KM=5.0
DELIVERY_BASE_FEE=40
FREE_DELIVERY_THRESHOLD=500
TAX_RATE_PERCENTAGE=5
RAZORPAY_KEY_ID=rzp_test_mock_bakery_key
RAZORPAY_KEY_SECRET=mock_razorpay_secret_key_12345
INITIAL_ADMIN_NAME=Admin Manager
INITIAL_ADMIN_EMAIL=admin@smartbakery.com
INITIAL_ADMIN_PASSWORD=AdminSecurePassword123!
INITIAL_ADMIN_PHONE=9876543210
QR_HMAC_SECRET=secure_qr_pickup_verification_token_key_2026
```

#### Frontend Configuration (`client/.env`)
```ini
VITE_API_URL=http://localhost:5000/api
VITE_SERVER_URL=http://localhost:5000
VITE_MAP_PROVIDER=osm
VITE_RAZORPAY_KEY_ID=rzp_test_mock_bakery_key
```

> [!NOTE]
> If you are using **MongoDB Atlas** instead of a local MongoDB installation, simply open `server/.env` and replace `MONGODB_URI` with your Atlas connection string.

---

### Step 4: Seed the Database
Populate your database with 30 artisanal products, FEFO inventory batches, default coupons, an administrator account, and a delivery courier:

```powershell
# 1. Seed 30 Products, Initial Batches, and Coupons
npm run seed

# 2. Seed Default Administrator and Delivery Courier
npm run seed:admin
```

**Expected Output:**
```text
[SEED] Connected to MongoDB at mongodb://127.0.0.1:27017/smart_bakery_cafe
[SEED] Successfully seeded 30 products into the catalogue.
[SEED] Created active FEFO inventory batches with future expiry dates.
[SEED] Seeded 3 promo coupons: WELCOME50, SWEET20, FREESHIP.
[ADMIN] Root Admin created: admin@smartbakery.com / AdminSecurePassword123!
[ADMIN] Courier created: courier@smartbakery.com / CourierPassword123!
```

---

### Step 5: Run Automated Tests
Verify mathematical precision, cryptographic tokens, security middleware, and business logic:

```powershell
npm run test
```

All test suites will run via **Vitest**, validating:
- **Haversine Distance**: Precision within centimeters, boundary testing at 4.99 km (allowed) vs 5.01 km (blocked).
- **Authentication & RBAC**: Bcrypt hashing, JWT cookie parsing, role authorization guards.
- **Cart & Pricing**: Customizer add-ons, cake weight scaling, coupon capping, and tax calculations.
- **Order State Machine & Cryptography**: Status progression rules, unique order numbers, and HMAC-SHA256 signature validation.

---

### Step 6: Start Development Servers
Open two separate PowerShell terminal tabs to run the backend and frontend simultaneously:

#### Terminal 1 — Start Backend Server:
```powershell
cd "c:\Users\DELL\Desktop\bakery website\smart-bakery-cafe\server"
npm run dev
```
*Backend runs at:* **`http://localhost:5000`**  
*Health Check:* `http://localhost:5000/api/health`

#### Terminal 2 — Start Frontend Client:
```powershell
cd "c:\Users\DELL\Desktop\bakery website\smart-bakery-cafe\client"
npm run dev
```
*Frontend runs at:* **`http://localhost:5173`**

Open **`http://localhost:5173`** in your browser to experience the application!

---

## 🔑 Pre-Seeded Accounts & Demo Credentials

Use these ready-to-test credentials to test every persona in the application:

| Persona / Role | Email Address | Password | Permissions & Available Portals |
| :--- | :--- | :--- | :--- |
| **Store Administrator** | `admin@smartbakery.com` | `AdminSecurePassword123!` | Full Admin Dashboard, Inventory Batches, Products CRUD, Coupons, Analytics, QR Verification, Kitchen KDS |
| **Kitchen Staff** | *Any logged-in Admin* | `AdminSecurePassword123!` | `/kitchen` (Live Kanban board, audio chimes, status progression) |
| **Delivery Courier** | `courier@smartbakery.com` | `CourierPassword123!` | `/delivery` (Rider assignments, turn-by-turn navigation, Handshake PIN verification) |
| **Customer** | *Register in UI* | *Any 8+ char password* | Catalogue, Custom Cake Builder, Barista Customizer, Checkout, Order Tracking, Reviews |

> [!TIP]
> You can also register a brand-new customer account directly through the frontend registration page (`/register`) in less than 10 seconds.

---

## 🧪 End-to-End Walkthrough & Verification Scenarios

Experience all the core innovations of **Smart Bakery & Café** through these step-by-step test flows:

### Scenario 1: Strict 5.0 km Delivery Geo-Fence Validation
1. Open the homepage (`http://localhost:5173/`) and scroll to the **Delivery Radius Checker**.
2. Click **"Detect My Location"** or enter coordinates:
   - **Valid Address ($< 5\text{ km}$)**: Enter `28.6350, 77.2200` (Pahar Ganj / Connaught Place). The gauge turns green, confirming *"You are within our fresh delivery zone! (~0.5 km)"*.
   - **Invalid Address ($> 5\text{ km}$)**: Enter `28.5355, 77.3910` (Noida, ~18 km away). The system alerts that the address is outside the 5.0 km radius and automatically recommends **Express Store Pickup** at checkout.

### Scenario 2: Personalized Cake Builder with Real-Time Piped Fondant Text
1. Navigate to **Menu** $\rightarrow$ Click on **"Belgian Dark Truffle Cake"**.
2. Click **"Personalize Cake"**.
3. Select **Weight: 1.5 kg** (price adjusts automatically), choose **"Gold Shimmer Buttercream"**, and select an occasion.
4. In the **Message on Cake** box, type *"Happy 30th Birthday Alex!"*.
5. Notice how the cake canvas updates in real time, rendering your custom message in an elegant piping script.
6. Click **"Add Personalized Cake to Cart"**.

### Scenario 3: Barista Customizer & Promotional Coupon Checkout
1. Add an **"Artisanal Sea Salt Croissant"** and an **"Espresso Flat White"** to your cart.
2. For the Flat White, select **"Oat Milk"** and **"Extra Double Shot"**.
3. Go to the **Cart** page (`/cart`).
4. In the Promo Code box, enter **`SWEET20`** and click **Apply**.
5. Observe the 20% discount applied up to the ₹150 maximum limit.
6. Click **Proceed to Checkout**.

### Scenario 4: Real-Time Kitchen Display (KDS) & Delivery Handshake
1. Open a new Incognito browser window and log in as Admin (`admin@smartbakery.com`). Navigate to **`/kitchen`**.
2. In your primary customer window, complete the checkout with **Cash on Delivery** or **Test Razorpay**.
3. **Listen!** The Kitchen screen immediately plays an audible two-tone chime and places the new ticket under the **"New Orders"** column without requiring any page reload.
4. On the Kitchen dashboard, click **"Start Baking"** $\rightarrow$ Ticket moves to **"Baking (In Oven)"**. The customer's tracking screen instantly updates to Stage 3.
5. In the Kitchen, click **"Ready for Delivery"**.
6. Switch to the Delivery Agent account (`courier@smartbakery.com`) at **`/delivery`**.
7. The courier sees the assigned delivery order, clicks **"Deliver Order"**, and requests the customer's **4-digit confirmation PIN** (displayed on the customer's live tracking screen).
8. Once entered, the order is marked **Delivered**, and confetti bursts on the customer's screen!

### Scenario 5: Express Store Pickup with Cryptographic QR Code Verification
1. Place an order selecting **"Store Pickup"** at checkout.
2. Once the order status is updated to **"Ready for Pickup"**, a cryptographically signed HMAC QR code pass is displayed on the customer's tracking screen.
3. Open the Admin Orders page (`/admin/orders`) $\rightarrow$ Click **"Verify Pickup QR"**.
4. Scan or paste the QR token. The system verifies the HMAC signature, displays the customer's name and items, and marks the order as fulfilled—completely preventing duplicate pickup attempts!

---

## 🧪 Automated Test Suite

The project includes automated tests covering all critical mathematical, cryptographic, and business logic routines:

```powershell
cd server
npm test
```

### What the test suites cover:
```text
 ✓ tests/deliveryDistance.test.js (12 tests)
   ✓ Haversine Distance Precision
     ✓ Computes 0.00 km when customer coordinate matches bakery exactly
     ✓ Accurately calculates known distance (CP to India Gate = ~2.2 km)
     ✓ Allows addresses at 4.99 km (boundary check)
     ✓ Blocks addresses at 5.01 km (boundary check)
     ✓ Handles international coordinate inputs gracefully
     ✓ Validates non-numeric coordinate inputs
   
 ✓ tests/auth.test.js (8 tests)
   ✓ Password Hashing & Security
     ✓ Hashes passwords using bcrypt with 10 salt rounds
     ✓ Rejects incorrect password verification
   ✓ JWT Token Generation & Verification
     ✓ Generates signed JWT payload with user ID and role
     ✓ Rejects expired or tampered JWT signatures
   ✓ Role-Based Access Control (RBAC)
     ✓ Allows admin role to access restricted endpoints
     ✓ Rejects customer role attempting admin routes

 ✓ tests/cartAndCoupon.test.js (10 tests)
   ✓ Cake Customizer Pricing Logic
     ✓ Multiplies base price by weight tier correctly
   ✓ Coupon Validation & Calculations
     ✓ Correctly applies percentage discount
     ✓ Enforces maximum discount cap
     ✓ Enforces minimum order subtotal requirement
     ✓ Prevents expired or inactive coupons from applying

 ✓ tests/orderWorkflow.test.js (9 tests)
   ✓ Order State Machine Progression
     ✓ Allows transition: Placed -> Confirmed -> Preparing -> Ready -> Out For Delivery -> Delivered
     ✓ Blocks invalid backward state transitions
   ✓ HMAC-SHA256 Pickup QR Code Cryptography
     ✓ Signs pickup token with secret key
     ✓ Verifies authentic token
     ✓ Rejects tampered token with altered order ID
```

---

## 🌐 Production Deployment Guide

Deploy your full-stack Smart Bakery & Café application with these production hosting recipes:

### 1. Database Deployment (MongoDB Atlas)
1. Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free **M0 Shared Cluster**.
3. Under **Database Access**, create a database user (e.g. `bakery_admin`) with a secure password.
4. Under **Network Access**, add IP `0.0.0.0/0` (Allow access from anywhere).
5. Click **Connect** $\rightarrow$ **Connect your application** $\rightarrow$ Copy the `mongodb+srv://...` connection string.

---

### 2. Backend Deployment (Render.com / Railway.app)

#### Deploying on Render:
1. Push your repository to GitHub.
2. Sign in to [Render.com](https://render.com/) and click **New +** $\rightarrow$ **Web Service**.
3. Connect your GitHub repository.
4. Configure the service settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Add the following **Environment Variables** in Render's dashboard:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `CLIENT_URL`: `https://your-bakery-client.vercel.app` *(update once frontend is deployed)*
   - `MONGODB_URI`: `mongodb+srv://<user>:<pass>@cluster0.mongodb.net/smart_bakery_cafe?retryWrites=true&w=majority`
   - `JWT_SECRET`: *(generate a random 64-character string)*
   - `QR_HMAC_SECRET`: *(generate a random 32-character string)*
   - `BAKERY_LAT`: `28.6315`
   - `BAKERY_LNG`: `77.2167`
   - `DELIVERY_MAX_RADIUS_KM`: `5.0`
6. Click **Create Web Service**. Once deployed, copy your backend URL (e.g. `https://smart-bakery-api.onrender.com`).

---

### 3. Frontend Deployment (Vercel / Netlify)

#### Deploying on Vercel:
1. Sign in to [Vercel.com](https://vercel.com/) and click **Add New...** $\rightarrow$ **Project**.
2. Select your GitHub repository.
3. In the project configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add the following **Environment Variables** in Vercel:
   - `VITE_API_URL`: `https://smart-bakery-api.onrender.com/api`
   - `VITE_SERVER_URL`: `https://smart-bakery-api.onrender.com`
   - `VITE_MAP_PROVIDER`: `osm`
   - `VITE_RAZORPAY_KEY_ID`: `rzp_test_your_real_key` *(or keep mock key for testing)*
5. Click **Deploy**.
6. **Important Final Step**: Return to Render, edit `CLIENT_URL` to match your Vercel URL, and trigger a quick redeploy so CORS cookies and Socket.IO connections can communicate smoothly.

---

## 🔧 Troubleshooting & Common Pitfalls

| Issue | Root Cause | Solution |
| :--- | :--- | :--- |
| **`MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017`** | Local MongoDB service is not running. | Start MongoDB locally via Windows Services (`services.msc` $\rightarrow$ Start MongoDB) or use a MongoDB Atlas cloud URI in `server/.env`. |
| **`Error: EADDRINUSE :::5000`** | Another application or previous node process is using port 5000. | In PowerShell, run `Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess -Force` or change `PORT=5001` in `server/.env` and `client/.env`. |
| **Cross-Origin Cookie Missing (`401 Unauthorized`)** | Browser blocked cross-origin HttpOnly cookies in production without SSL. | In development, ensure `CLIENT_URL` matches your frontend origin exactly (`http://localhost:5173`). In production, both domains must use HTTPS. |
| **Socket.IO Not Connecting** | Port mismatch or incorrect `VITE_SERVER_URL`. | Check `client/.env` to ensure `VITE_SERVER_URL=http://localhost:5000` has no trailing slash. |
| **Browser GPS says "Permission Denied"** | Browser blocked location access or page is served over unsecure HTTP on a remote network. | Allow location permissions in browser settings (click lock/tune icon near URL bar). Localhost is automatically treated as a secure context. |
| **Products List is Empty** | Database has not been seeded yet. | Run `npm run seed` in your terminal to populate the catalogue with all 30 products. |

---

## 🎓 Architectural & Technical Interview Defense

If presenting or defending this project in a technical interview, here are the key architectural decisions and engineering rationales:

### Q1: Why use the mathematical Haversine formula instead of the Google Maps Distance Matrix API?
> **Answer:**  
> The Haversine formula calculates the great-circle distance between two points on a sphere directly in microseconds ($O(1)$ time complexity) with **zero external API costs, zero network latency, and zero rate-limiting vulnerability**. For fresh food perishability, a straight-line radial threshold (e.g. 5.0 km) serves as a reliable physical boundary. By computing distance server-side in pure JavaScript, the backend guarantees tamper-proof validation: even if a malicious client modifies their browser payload, the backend recalculates and rejects deliveries exceeding 5.0 km.

### Q2: Why implement FEFO (First-Expired, First-Out) over FIFO (First-In, First-Out)?
> **Answer:**  
> In standard retail e-commerce, FIFO is standard. However, in an artisanal bakery and café, production ingredients and prepared items have variable shelf lives (e.g., cheesecakes last 3 days, whereas sourdough breads last 5 days). FIFO only considers when a batch was produced, which can lead to selling newer batches before older batches expire. **FEFO sorts inventory batches strictly by `expiryDate: 1`**, automatically allocating stock from the earliest expiring batch first. This minimizes food waste, prevents stale goods from reaching customers, and maintains consistent freshness.

### Q3: Why generate HMAC-SHA256 signed QR codes for pickup verification?
> **Answer:**  
> Simple order IDs (e.g., `ORD-10023`) or sequential numbers in QR codes are vulnerable to **enumeration and replay attacks**—a malicious customer could generate a QR code with an incremented ID and pick up someone else's expensive custom cake. By hashing the order number, customer ID, and creation timestamp with a private server secret (`QR_HMAC_SECRET`), the QR token is cryptographically immutable. The counter scanner verifies the signature before marking the order as picked up, completely closing fraud vectors.

### Q4: Why use HttpOnly, SameSite cookies for JWT instead of LocalStorage?
> **Answer:**  
> Storing authentication tokens in `localStorage` makes them accessible to any JavaScript running on the page, leaving users vulnerable to **Cross-Site Scripting (XSS)** attacks through malicious dependencies or injected scripts. Storing JWTs inside an `HttpOnly`, `SameSite=Lax` cookie ensures the browser transmits the credential automatically with each request, while making it completely invisible to client-side scripts.

### Q5: How is the Kitchen Display Audio Chime generated without external audio files?
> **Answer:**  
> External audio assets (MP3/WAV) require extra network requests, can fail due to 404s or CORS errors, and may introduce latency. Instead, we use the browser's native **Web Audio API** (`AudioContext`). When a new order event arrives over Socket.IO, a synthesized oscillator generates a smooth dual-tone chime (800 Hz followed by 1000 Hz) with an exponential gain decay curve. It weighs zero bytes in network assets and delivers instant, reliable acoustic feedback for busy kitchen staff.

---

## 📄 License
This project is licensed under the ISC License — free for educational and commercial use.

---

**Built with passion for artisanal baking and modern full-stack web engineering.**
