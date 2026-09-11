import 'address_model.dart';
import 'delivery_slot_model.dart';

enum OrderStatus {
  pendingPayment,
  paid,
  confirmed,
  preparing,
  readyForPickup,
  outForDelivery,
  delivered,
  cancelled,
  refunded;

  static OrderStatus fromString(String value) {
    switch (value.toUpperCase()) {
      case 'PENDING_PAYMENT':
        return OrderStatus.pendingPayment;
      case 'PAID':
        return OrderStatus.paid;
      case 'CONFIRMED':
        return OrderStatus.confirmed;
      case 'PREPARING':
        return OrderStatus.preparing;
      case 'READY_FOR_PICKUP':
        return OrderStatus.readyForPickup;
      case 'OUT_FOR_DELIVERY':
        return OrderStatus.outForDelivery;
      case 'DELIVERED':
        return OrderStatus.delivered;
      case 'CANCELLED':
        return OrderStatus.cancelled;
      case 'REFUNDED':
        return OrderStatus.refunded;
      default:
        return OrderStatus.pendingPayment;
    }
  }

  String get displayName {
    switch (this) {
      case OrderStatus.pendingPayment:
        return 'Pending Payment';
      case OrderStatus.paid:
        return 'Paid';
      case OrderStatus.confirmed:
        return 'Order Confirmed';
      case OrderStatus.preparing:
        return 'Packing Groceries';
      case OrderStatus.readyForPickup:
        return 'Ready for Pickup';
      case OrderStatus.outForDelivery:
        return 'Out for Delivery';
      case OrderStatus.delivered:
        return 'Delivered';
      case OrderStatus.cancelled:
        return 'Cancelled';
      case OrderStatus.refunded:
        return 'Refunded';
    }
  }

  int get stepIndex {
    switch (this) {
      case OrderStatus.pendingPayment:
        return 0;
      case OrderStatus.paid:
      case OrderStatus.confirmed:
        return 1;
      case OrderStatus.preparing:
        return 2;
      case OrderStatus.readyForPickup:
      case OrderStatus.outForDelivery:
        return 3;
      case OrderStatus.delivered:
        return 4;
      case OrderStatus.cancelled:
      case OrderStatus.refunded:
        return -1;
    }
  }

  bool get isCancellable {
    return this == OrderStatus.pendingPayment ||
        this == OrderStatus.paid ||
        this == OrderStatus.confirmed;
  }
}

enum PaymentMethodType {
  stripe,
  applePay,
  googlePay,
  paypal,
  cashOnDelivery;

  static PaymentMethodType fromString(String value) {
    switch (value.toUpperCase()) {
      case 'STRIPE':
        return PaymentMethodType.stripe;
      case 'APPLE_PAY':
        return PaymentMethodType.applePay;
      case 'GOOGLE_PAY':
        return PaymentMethodType.googlePay;
      case 'PAYPAL':
        return PaymentMethodType.paypal;
      case 'CASH_ON_DELIVERY':
        return PaymentMethodType.cashOnDelivery;
      default:
        return PaymentMethodType.stripe;
    }
  }

  String get displayName {
    switch (this) {
      case PaymentMethodType.stripe:
        return 'Credit / Debit Card';
      case PaymentMethodType.applePay:
        return 'Apple Pay';
      case PaymentMethodType.googlePay:
        return 'Google Pay';
      case PaymentMethodType.paypal:
        return 'PayPal';
      case PaymentMethodType.cashOnDelivery:
        return 'Cash on Delivery';
    }
  }
}

class OrderItemModel {
  final String id;
  final String productId;
  final String productName;
  final String productSku;
  final double unitPrice;
  final int quantity;
  final double totalPrice;
  final String? imageUrl;

  OrderItemModel({
    required this.id,
    required this.productId,
    required this.productName,
    required this.productSku,
    required this.unitPrice,
    required this.quantity,
    required this.totalPrice,
    this.imageUrl,
  });

  factory OrderItemModel.fromJson(Map<String, dynamic> json) {
    String? img;
    if (json['product'] != null && json['product']['images'] != null) {
      final images = json['product']['images'] as List;
      if (images.isNotEmpty) {
        img = images.first['url'] as String?;
      }
    }

    return OrderItemModel(
      id: json['id'] as String? ?? '',
      productId: json['productId'] as String? ?? '',
      productName: json['productName'] as String? ?? 'Grocery Item',
      productSku: json['productSku'] as String? ?? '',
      unitPrice: double.tryParse(json['unitPrice'].toString()) ?? 0.0,
      quantity: json['quantity'] as int? ?? 1,
      totalPrice: double.tryParse(json['totalPrice'].toString()) ?? 0.0,
      imageUrl: img,
    );
  }
}

class PaymentModel {
  final String id;
  final PaymentMethodType method;
  final String status;
  final double amount;
  final String? paymentIntentId;

  PaymentModel({
    required this.id,
    required this.method,
    required this.status,
    required this.amount,
    this.paymentIntentId,
  });

  factory PaymentModel.fromJson(Map<String, dynamic> json) {
    return PaymentModel(
      id: json['id'] as String? ?? '',
      method: PaymentMethodType.fromString(json['paymentMethod'] as String? ?? 'STRIPE'),
      status: json['status'] as String? ?? 'PENDING',
      amount: double.tryParse(json['amount'].toString()) ?? 0.0,
      paymentIntentId: json['paymentIntentId'] as String?,
    );
  }
}

class OrderModel {
  final String id;
  final String orderNumber;
  final OrderStatus status;
  final String deliveryType;
  final double subtotal;
  final double deliveryFee;
  final double discountAmount;
  final double taxAmount;
  final double totalAmount;
  final String? notes;
  final DateTime createdAt;
  final List<OrderItemModel> items;
  final AddressModel? address;
  final DeliverySlotModel? deliverySlot;
  final List<PaymentModel> payments;

  OrderModel({
    required this.id,
    required this.orderNumber,
    required this.status,
    required this.deliveryType,
    required this.subtotal,
    required this.deliveryFee,
    required this.discountAmount,
    required this.taxAmount,
    required this.totalAmount,
    this.notes,
    required this.createdAt,
    required this.items,
    this.address,
    this.deliverySlot,
    required this.payments,
  });

  int get totalItemCount => items.fold(0, (sum, item) => sum + item.quantity);

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    return OrderModel(
      id: json['id'] as String? ?? '',
      orderNumber: json['orderNumber'] as String? ?? '',
      status: OrderStatus.fromString(json['status'] as String? ?? 'PENDING_PAYMENT'),
      deliveryType: json['deliveryType'] as String? ?? 'DELIVERY',
      subtotal: double.tryParse(json['subtotal'].toString()) ?? 0.0,
      deliveryFee: double.tryParse(json['deliveryFee'].toString()) ?? 0.0,
      discountAmount: double.tryParse(json['discountAmount'].toString()) ?? 0.0,
      taxAmount: double.tryParse(json['taxAmount'].toString()) ?? 0.0,
      totalAmount: double.tryParse(json['totalAmount'].toString()) ?? 0.0,
      notes: json['notes'] as String?,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
      items: json['items'] != null
          ? (json['items'] as List).map((i) => OrderItemModel.fromJson(i as Map<String, dynamic>)).toList()
          : [],
      address: json['address'] != null
          ? AddressModel.fromJson(json['address'] as Map<String, dynamic>)
          : null,
      deliverySlot: json['deliverySlot'] != null
          ? DeliverySlotModel.fromJson(json['deliverySlot'] as Map<String, dynamic>)
          : null,
      payments: json['payments'] != null
          ? (json['payments'] as List).map((p) => PaymentModel.fromJson(p as Map<String, dynamic>)).toList()
          : [],
    );
  }
}
