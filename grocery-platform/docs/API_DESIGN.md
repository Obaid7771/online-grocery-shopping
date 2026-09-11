# FreshCart REST & Real-Time WebSocket API Specification

## 1. Protocol & Architectural Standards

- **Base URL**: `https://api.freshcart.io/api/v1` (Local dev: `http://localhost:4000/api/v1`)
- **Transport**: HTTPS, TLS 1.3, JSON body payloads (`Content-Type: application/json`)
- **Authentication**: HTTP Bearer Token (`Authorization: Bearer <JWT>`)
- **Standard Success Response Format**:
```json
{
  "success": true,
  "statusCode": 200,
  "data": {},
  "message": "Operation completed successfully",
  "meta": {
    "page": 1,
    "limit": 20,
    "totalItems": 150,
    "totalPages": 8
  }
}
```
- **Standard Error Response Format**:
```json
{
  "success": false,
  "statusCode": 400,
  "error": "BAD_REQUEST",
  "message": "Validation failed on fields",
  "validationErrors": [
    {
      "field": "email",
      "constraints": ["email must be an email address"]
    }
  ],
  "timestamp": "2026-09-04T01:56:46.000Z",
  "path": "/api/v1/auth/login"
}
```

---

## 2. Comprehensive Endpoint Index

### 2.1 Authentication & User Access (`/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register new customer with email/phone |
| `POST` | `/auth/login` | Public | Authenticate user; returns Access & Refresh tokens |
| `POST` | `/auth/refresh-token` | Public | Issue new Access Token via valid Refresh Token |
| `POST` | `/auth/logout` | Authenticated | Revoke refresh token and invalidate session |
| `POST` | `/auth/forgot-password`| Public | Generate OTP / reset link for password recovery |
| `POST` | `/auth/reset-password` | Public | Reset password using valid verification token/OTP |
| `POST` | `/auth/verify-otp` | Authenticated | Verify email or phone number with 6-digit OTP |

### 2.2 Customer Profile & Addresses (`/users`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/users/me` | Authenticated | Fetch authenticated user profile & preferences |
| `PATCH`| `/users/profile` | Authenticated | Update user first/last name, phone, or avatar |
| `GET` | `/users/addresses` | Authenticated | List all saved delivery addresses |
| `POST` | `/users/addresses` | Authenticated | Add new address with geocoordinates & delivery note |
| `PUT` | `/users/addresses/:id` | Authenticated | Update existing delivery address |
| `DELETE`| `/users/addresses/:id`| Authenticated | Delete address (or mark inactive) |
| `PATCH`| `/users/addresses/:id/default` | Authenticated | Set address as default delivery location |
| `PUT` | `/users/password` | Authenticated | Change user account password |
| `DELETE`| `/users/account` | Authenticated | Request account deletion (GDPR compliance) |

### 2.3 Catalog & Search (`/categories`, `/products`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/categories` | Public | List hierarchical categories with sort order |
| `GET` | `/categories/:slug` | Public | Get single category details & subcategories |
| `GET` | `/products` | Public | Paginated products list (filters: category, price, inStock, sort) |
| `GET` | `/products/search` | Public | Full-text autocomplete & fuzzy search with highlights |
| `GET` | `/products/featured` | Public | Curated promotional & featured products |
| `GET` | `/products/popular` | Public | High-velocity popular products |
| `GET` | `/products/recommended`| Authenticated | Personalized recommendations based on order history |
| `GET` | `/products/:slug` | Public | Get complete product detail with images, units & reviews |

### 2.4 Shopping Cart (`/cart`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/cart` | Authenticated / Session | Retrieve active cart with subtotal & item calculations |
| `POST` | `/cart/items` | Authenticated / Session | Add item or increment quantity in cart |
| `PATCH`| `/cart/items/:id` | Authenticated / Session | Update quantity for specific cart item |
| `DELETE`| `/cart/items/:id` | Authenticated / Session | Remove line item from cart |
| `DELETE`| `/cart/clear` | Authenticated / Session | Clear all items from cart |

### 2.5 Checkout, Delivery & Coupons (`/checkout`, `/delivery`, `/coupons`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/checkout/validate` | Authenticated | Validate items, stock availability, and compute bill |
| `GET` | `/delivery/zones` | Public | List serviceable postal codes & delivery thresholds |
| `GET` | `/delivery/slots` | Public | Query available delivery windows by date & capacity |
| `POST` | `/coupons/validate` | Authenticated | Test coupon code against current subtotal and user limit |

### 2.6 Orders & Lifecycle (`/orders`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/orders` | Authenticated | Create order from cart, address, slot & payment intent |
| `GET` | `/orders` | Authenticated | List paginated customer order history |
| `GET` | `/orders/:id` | Authenticated | Get detailed order summary, line items, and delivery status |
| `POST` | `/orders/:id/cancel` | Authenticated | Cancel order (allowed before `PREPARING` status) |
| `POST` | `/orders/:id/reorder`| Authenticated | Duplicate past order items into current cart |
| `GET` | `/orders/:id/track` | Authenticated | Live tracking metadata & driver location stream |

### 2.7 Payments & Gateways (`/payments`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/payments/create-intent` | Authenticated | Initialize Stripe/PayPal payment intent with amount |
| `POST` | `/payments/confirm` | Authenticated | Client confirmation handshake following 3D Secure |
| `POST` | `/payments/webhook/stripe`| Public / Signed | Stripe webhook for `payment_intent.succeeded/failed` |
| `POST` | `/payments/webhook/paypal`| Public / Signed | PayPal webhook for checkout capture events |

### 2.8 Push Notifications & Preferences (`/notifications`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/notifications` | Authenticated | List in-app notifications with read status |
| `PATCH`| `/notifications/:id/read`| Authenticated | Mark individual notification as read |
| `POST` | `/notifications/fcm-token`| Authenticated | Register/update device FCM push token |
| `GET` | `/notifications/preferences`| Authenticated| Get notification push/SMS toggles |
| `PATCH`| `/notifications/preferences`| Authenticated| Update notification preferences |

### 2.9 Product Reviews & Wishlist (`/reviews`, `/wishlist`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/reviews/product/:id` | Public | Paginated reviews & star rating summary |
| `POST` | `/reviews` | Authenticated | Submit review for purchased product |
| `GET` | `/wishlist` | Authenticated | List saved wishlist products |
| `POST` | `/wishlist/:productId`| Authenticated | Toggle product in/out of wishlist |

### 2.10 Admin Operations (`/admin/*`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/admin/metrics` | Admin, Store Manager | Total revenue, orders, active customers, low stock items |
| `GET` | `/admin/products` | Admin, Store Manager | Paginated product management with SKU & stock counts |
| `POST` | `/admin/products` | Admin | Create product with units, pricing, category & initial stock |
| `PUT` | `/admin/products/:id`| Admin | Update product details & status |
| `DELETE`| `/admin/products/:id`| Admin | Soft delete product |
| `POST` | `/admin/products/:id/image`| Admin | Upload product media to S3 |
| `GET` | `/admin/inventory` | Admin, Store Manager | Stock levels & low-stock warning table |
| `POST` | `/admin/inventory/adjust`| Admin, Store Manager | Manual stock adjustment with reason log |
| `GET` | `/admin/orders` | Admin, Dispatcher | Filterable order queue by status, date, payment |
| `PATCH`| `/admin/orders/:id/status`| Admin, Dispatcher | Transition order status (`CONFIRMED`, `PREPARING`, etc.) |
| `POST` | `/admin/orders/:id/refund`| Admin | Issue refund via Stripe/PayPal & update order |
| `GET` | `/admin/customers` | Admin | Customer directory with spend totals & status |
| `PATCH`| `/admin/customers/:id/status`| Admin | Enable or suspend customer account |
| `GET` | `/admin/coupons` | Admin | Manage coupon campaigns |
| `POST` | `/admin/coupons` | Admin | Create promotional discount coupon |
| `GET` | `/admin/delivery-zones`| Admin | List & configure delivery geofences & fees |
| `POST` | `/admin/delivery-zones`| Admin | Create/update delivery zone |
| `GET` | `/admin/audit-logs` | Super Admin | Audit trail of all administrative updates |

---

## 3. Real-Time WebSocket Gateway (`/orders-ws`)

- **Namespace**: `/orders-ws`
- **Handshake Authentication**: `query: { token: "<JWT_ACCESS_TOKEN>" }`
- **Room Subscriptions**:
  - `join_order_room`: `{ "orderId": "uuid" }` (Allows customer to receive events for their specific order)
  - `join_admin_dispatch`: Subscribes authorized staff to global order lifecycle stream

### WebSocket Events
| Direction | Event Name | Payload Sample |
|---|---|---|
| Server ➔ Client | `order:status_updated` | `{"orderId": "...", "status": "OUT_FOR_DELIVERY", "updatedAt": "..."}` |
| Server ➔ Client | `order:delivery_location` | `{"orderId": "...", "latitude": 37.7749, "longitude": -122.4194}` |
| Server ➔ Client | `inventory:low_stock` | `{"productId": "...", "sku": "APL-001", "stockQuantity": 3}` (Admin only) |
| Client ➔ Server | `courier:update_location`| `{"orderId": "...", "latitude": 37.7749, "longitude": -122.4194}` |
