# Smart Bakery & Café — REST API Documentation

This document provides a reference for all REST API endpoints and real-time WebSocket channels in **Smart Bakery & Café**.

---

## 1. General Conventions

- **Base URL**: `http://localhost:5000/api`
- **Content Type**: `application/json`
- **Authentication**: JWT HttpOnly Cookie (`token`) or HTTP Header (`Authorization: Bearer <token>`)
- **Standard Response Envelope**:
  ```json
  {
    "success": true,
    "message": "Operation completed successfully",
    "data": { ... }
  }
  ```
- **Standard Error Envelope**:
  ```json
  {
    "success": false,
    "message": "Error description message",
    "errors": [ ... ]
  }
  ```

---

## 2. Authentication & User Profile (`/api/auth`)

### 2.1 Register New Account
- **Route**: `POST /api/auth/register`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "name": "Rhea Sharma",
    "email": "rhea@example.com",
    "password": "Password@123",
    "phone": "9876543210"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "message": "Account registered successfully",
    "data": {
      "user": {
        "_id": "6620a1...",
        "name": "Rhea Sharma",
        "email": "rhea@example.com",
        "role": "customer"
      }
    }
  }
  ```

### 2.2 User Login
- **Route**: `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "rhea@example.com",
    "password": "Password@123"
  }
  ```
- **Response `200 OK`**: Sets secure `token` HttpOnly cookie.

### 2.3 User Logout
- **Route**: `POST /api/auth/logout`
- **Access**: Public
- **Response `200 OK`**: Clears authentication cookie.

### 2.4 Get Current Profile
- **Route**: `GET /api/auth/me`
- **Access**: Private (Authenticated)

### 2.5 Add Delivery Address
- **Route**: `POST /api/auth/addresses`
- **Access**: Private (Customer)
- **Request Body**:
  ```json
  {
    "label": "Home",
    "street": "Flat 302, Green Avenue, Barakhamba Road",
    "city": "New Delhi",
    "state": "Delhi",
    "pincode": "110001",
    "landmark": "Near Metro Gate 2",
    "coordinates": {
      "lat": 28.6315,
      "lng": 77.2167
    }
  }
  ```

---

## 3. Products & Menu Catalogue (`/api/products`)

### 3.1 Get All Products with Live Filtering
- **Route**: `GET /api/products`
- **Access**: Public
- **Query Parameters**:
  - `category`: `Bakery`, `Non-Vegetarian`, `Cafe`
  - `isVegetarian`: `true`, `false`
  - `search`: text query matching product name or ingredients
  - `minPrice`, `maxPrice`: numeric bounds
  - `sort`: `price_asc`, `price_desc`, `rating`, `newest`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "count": 30,
      "products": [ ... ]
    }
  }
  ```

### 3.2 Get Single Product by ID or Slug
- **Route**: `GET /api/products/:identifier`
- **Access**: Public
- **Example**: `GET /api/products/belgian-chocolate-truffle-cake`

### 3.3 Create New Product
- **Route**: `POST /api/products`
- **Access**: Private / Admin
- **Request Body**:
  ```json
  {
    "name": "Artisanal Sourdough Baguette",
    "category": "Bakery",
    "subcategory": "Breads",
    "description": "Slow fermented French baguette with crusty exterior.",
    "price": 180,
    "stockQuantity": 40,
    "preparationTime": 15,
    "imageUrl": "/placeholder-food.svg",
    "isVegetarian": true,
    "isAvailable": true,
    "allergens": ["Gluten"]
  }
  ```

### 3.4 Update Product
- **Route**: `PUT /api/products/:id`
- **Access**: Private / Admin

### 3.5 Delete Product
- **Route**: `DELETE /api/products/:id`
- **Access**: Private / Admin

---

## 4. Orders & Fulfillment (`/api/orders`)

### 4.1 Create Checkout Order (With 5.0 KM Radius Enforcement)
- **Route**: `POST /api/orders`
- **Access**: Private (Customer)
- **Request Body**:
  ```json
  {
    "orderType": "delivery",
    "items": [
      {
        "productId": "6620b1...",
        "quantity": 1,
        "customizations": {
          "cakeEggless": true,
          "cakeMessage": "Happy Birthday!"
        }
      }
    ],
    "deliveryAddress": {
      "street": "Barakhamba Road",
      "city": "New Delhi",
      "pincode": "110001",
      "coordinates": {
        "lat": 28.6315,
        "lng": 77.2167
      }
    },
    "paymentMethod": "cash_on_delivery",
    "couponCode": "WELCOME10"
  }
  ```
- **Error Response if $> 5.0\text{ km}$ `400 Bad Request`**:
  ```json
  {
    "success": false,
    "message": "Delivery unavailable: Your address is 7.2 km away, which exceeds our maximum fresh delivery limit of 5.0 km."
  }
  ```

### 4.2 Get Customer Order History
- **Route**: `GET /api/orders/my-orders`
- **Access**: Private (Customer)

### 4.3 Get Order by ID
- **Route**: `GET /api/orders/:id`
- **Access**: Private (Owner Customer or Staff)

### 4.4 Cancel Pending Order
- **Route**: `PUT /api/orders/:id/cancel`
- **Access**: Private (Customer / Admin)
- **Note**: Only permitted when status is `pending` or `confirmed`. Restores batch inventory automatically.

### 4.5 Verify Counter Pickup QR Token
- **Route**: `POST /api/orders/verify-pickup`
- **Access**: Private (Admin / Staff)
- **Request Body**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

---

## 5. Delivery Geo-Validation (`/api/delivery`)

### 5.1 Check Geo-Eligibility
- **Route**: `GET /api/delivery/check`
- **Access**: Public
- **Query Params**: `lat`, `lng`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "isEligible": true,
      "distanceKm": 2.42,
      "maxRadiusKm": 5.0,
      "bakeryCoordinates": { "lat": 28.6315, "lng": 77.2167 },
      "message": "Great news! Your address is 2.42 km away, comfortably within our 5.0 km fresh delivery radius."
    }
  }
  ```

### 5.2 Get Courier Assignments
- **Route**: `GET /api/delivery/my-assignments`
- **Access**: Private (Delivery Agent)

### 5.3 Update Delivery Assignment Status
- **Route**: `PUT /api/delivery/assignments/:id/status`
- **Access**: Private (Delivery Agent)
- **Request Body for Delivery Completion**:
  ```json
  {
    "status": "delivered",
    "confirmationPin": "4821"
  }
  ```

---

## 6. Coupons & Promotions (`/api/coupons`)

### 6.1 Apply Coupon Code
- **Route**: `POST /api/coupons/apply`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "code": "WELCOME10",
    "subtotal": 600
  }
  ```

### 6.2 Get All Coupons
- **Route**: `GET /api/coupons`
- **Access**: Private / Admin

### 6.3 Create Coupon
- **Route**: `POST /api/coupons`
- **Access**: Private / Admin

---

## 7. Payments (`/api/payments`)

### 7.1 Verify Payment Signature
- **Route**: `POST /api/payments/verify`
- **Access**: Private (Customer)
- **Request Body**:
  ```json
  {
    "orderId": "6620c1...",
    "razorpayOrderId": "order_mock_123",
    "razorpayPaymentId": "pay_mock_456",
    "razorpaySignature": "mock_signature_verified"
  }
  ```

---

## 8. Customer Reviews (`/api/reviews`)

### 8.1 Submit Verified Review
- **Route**: `POST /api/reviews`
- **Access**: Private (Customer)
- **Request Body**:
  ```json
  {
    "productId": "6620b1...",
    "orderId": "6620c1...",
    "rating": 5,
    "comment": "Flaky, rich butter aroma and perfectly baked crust!"
  }
  ```

---

## 9. Admin Operations (`/api/admin`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/orders` | Query all platform orders with search, date range & status filters |
| `PUT` | `/api/admin/orders/:id/status` | Advance order state (`pending` → `confirmed` → `preparing` → ...) |
| `POST` | `/api/admin/orders/:id/assign-delivery` | Assign courier agent to an order |
| `GET` | `/api/admin/delivery-agents` | List active courier agents for assignment dropdowns |
| `GET` | `/api/admin/inventory` | Overview of low-stock products & active FEFO batches |
| `POST` | `/api/admin/inventory/batches` | Create fresh inventory batch and increment product stock |
| `GET` | `/api/admin/analytics` | Aggregated gross revenue, category percentages, and bestsellers |
| `GET` | `/api/admin/analytics/export-csv` | Stream full sales spreadsheet (.CSV format) |

---

## 10. Real-Time Socket.IO Channels

| Channel / Event | Direction | Payload | Description |
|---|---|---|---|
| `join_room` | Client → Server | `roomName` | Join `order_{id}`, `kitchen_channel`, or `delivery_couriers` |
| `leave_room` | Client → Server | `roomName` | Leave specific broadcast room |
| `new_order_placed` | Server → Kitchen | Order Object | Emitted to `kitchen_channel` when checkout completes |
| `order_status_updated`| Server → Client | Order Object | Broadcast to `order_{id}` when order transitions state |
| `delivery_assigned` | Server → Courier | Assignment Object | Notifies courier of a newly dispatched delivery task |
| `update_courier_location`| Courier → Server | `{ orderId, coords }` | Relays live courier GPS coordinates to customer tracking room |
| `courier_location_updated`| Server → Customer | `{ coordinates }` | Dispatched to customer tracking screen |
