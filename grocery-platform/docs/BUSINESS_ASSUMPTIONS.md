# FreshCart Grocery Platform: Business Assumptions & Domain Model

## 1. Executive Overview
The **FreshCart** online grocery platform is engineered for high-frequency, time-critical retail operations. Unlike standard e-commerce (apparel, electronics) where fulfillment takes days and inventory is non-perishable, grocery commerce requires hyper-localized inventory management, perishable goods handling, precise delivery slotting, cold-chain considerations, and instant order state synchronization.

---

## 2. Core Business Assumptions

### 2.1 Catalog & Perishables Management
- **Unit Variations**: Items are sold either as discrete countable units (`PIECE`, `PACK`, `BOX`) or weighted units (`KG`, `G`, `LB`, `OZ`).
- **Inventory Precision**: Weighted items have an incremental unit step (e.g., step of 0.25 kg for apples, min 0.5 kg).
- **Price Transparency**: Base unit price (e.g., $3.99/kg) and promo/discount price ($2.99/kg) are explicitly displayed alongside calculateable savings.
- **Stock Depletion & Reservation**: When a customer advances to checkout, items in the cart are temporarily reserved with a 15-minute TTL (Time-To-Live). If payment is not completed within 15 minutes, reserved stock is released back into available inventory to avoid stock hoarding.

### 2.2 Geofencing & Delivery Zones
- **Hyperlocal Radius**: Deliveries are strictly restricted to defined geographic postal codes/zones.
- **Serviceability Check**: At the onset of the customer journey, the mobile app prompts for address or postal code selection to filter out-of-stock or non-serviceable catalog items.
- **Tiered Delivery Fees**: Each delivery zone defines a base delivery fee, a minimum order value (e.g., $15.00 min order), and a free-delivery subtotal threshold (e.g., orders over $60 qualify for free delivery).

### 2.3 Delivery Slots & Store Pickup
- **Scheduled Time Windows**: Deliveries are booked in predefined hourly or multi-hour windows (e.g., 08:00–10:00, 10:00–12:00, 14:00–16:00, 18:00–20:00).
- **Slot Capacity Constraints**: Each slot has a strict vehicle/courier capacity (e.g., maximum 25 orders per slot). Once a slot reaches capacity, it is marked full and disabled in the UI.
- **Same-Day & Next-Day Windows**: Cut-off times apply (e.g., same-day delivery slots close 1 hour prior to window start).
- **Store Pickup (Click & Collect)**: Customers can choose curbside/store pickup with zero delivery fee at designated pickup depots.

### 2.4 Order Lifecycle & Status Progression
The platform enforces a deterministic, strictly validated state machine:

```
[Customer Initiates Order]
          │
          ▼
   PENDING_PAYMENT ────────(Payment Failed / Expired)───────► CANCELLED
          │
          ▼ (Payment Verified via Webhook)
        PAID
          │
          ▼ (Store Manager / Dispatcher Accepts)
      CONFIRMED
          │
          ▼ (Store Clerk Picking & Packing)
      PREPARING
          │
          ├─────────────────────────────────────────┐
          ▼ (Delivery Mode)                         ▼ (Pickup Mode)
   OUT_FOR_DELIVERY                          READY_FOR_PICKUP
          │                                         │
          ▼ (Courier Hands Over / GPS Verified)     ▼ (Customer Picks Up)
      DELIVERED                                 DELIVERED
          │                                         │
          └────────────────────┬────────────────────┘
                               │
                               ▼ (Returns / Order Issue)
                            REFUNDED
```

- **Customer Cancellations**: Allowed strictly when the order is in `PENDING_PAYMENT`, `PAID`, or `CONFIRMED` states. Once status changes to `PREPARING`, packing has begun and cancellation requires admin intervention.
- **Status Notifications**: Push notifications are dispatched asynchronously via Firebase Cloud Messaging (FCM) at every milestone transition:
  - Order Paid & Confirmed
  - Order Being Packed (`PREPARING`)
  - Out for Delivery (with driver name and estimated arrival)
  - Successfully Delivered

### 2.5 Payments & Fraud Prevention
- **Primary Gateways**: Stripe (Credit/Debit Card, 3D Secure, Apple Pay, Google Pay) and PayPal Checkout.
- **Webhook Reconciliation**: Order state transitions to `PAID` exclusively upon receipt and cryptographic validation of official payment gateway webhooks (e.g. `payment_intent.succeeded`). Client-side claims of payment are never trusted.
- **Idempotency**: All payment intent creations and capture requests enforce unique idempotency keys keyed by order ID and payment attempt timestamp.

### 2.6 Taxation & Discount Policies
- **Tax Model**: Standard destination-based sales tax percentage configured globally or per administrative region (default: 8.5%).
- **Coupons**: Supported as Percentage-off (e.g., 10% off) or Fixed amount (e.g., $10 off). Governed by minimum order thresholds, expiration dates, total usage caps, and 1-per-customer usage limits.
