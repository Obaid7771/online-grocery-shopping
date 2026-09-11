import 'product_model.dart';

class CartItemModel {
  final String id;
  final ProductModel product;
  final int quantity;
  final double unitPrice;

  CartItemModel({
    required this.id,
    required this.product,
    required this.quantity,
    required this.unitPrice,
  });

  double get totalPrice => unitPrice * quantity;

  CartItemModel copyWith({
    int? quantity,
    double? unitPrice,
  }) {
    return CartItemModel(
      id: id,
      product: product,
      quantity: quantity ?? this.quantity,
      unitPrice: unitPrice ?? this.unitPrice,
    );
  }
}

class CartModel {
  final List<CartItemModel> items;
  final String? couponCode;
  final double couponDiscount;
  final double deliveryFee;
  final double taxRate; // e.g. 0.085 for 8.5%

  CartModel({
    this.items = const [],
    this.couponCode,
    this.couponDiscount = 0.0,
    this.deliveryFee = 3.99,
    this.taxRate = 0.085,
  });

  int get totalItemCount => items.fold(0, (sum, item) => sum + item.quantity);

  double get subtotal => items.fold(0.0, (sum, item) => sum + item.totalPrice);

  double get calculatedDeliveryFee {
    if (subtotal >= 50.0 || items.isEmpty) return 0.0;
    return deliveryFee;
  }

  double get discountAmount => couponDiscount;

  double get taxAmount => (subtotal - discountAmount) > 0
      ? (subtotal - discountAmount) * taxRate
      : 0.0;

  double get total {
    if (items.isEmpty) return 0.0;
    final discountedSubtotal = (subtotal - discountAmount).clamp(0.0, double.infinity);
    return discountedSubtotal + calculatedDeliveryFee + taxAmount;
  }

  CartModel copyWith({
    List<CartItemModel>? items,
    String? couponCode,
    double? couponDiscount,
    double? deliveryFee,
  }) {
    return CartModel(
      items: items ?? this.items,
      couponCode: couponCode ?? this.couponCode,
      couponDiscount: couponDiscount ?? this.couponDiscount,
      deliveryFee: deliveryFee ?? this.deliveryFee,
      taxRate: taxRate,
    );
  }
}
