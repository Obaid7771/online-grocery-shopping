import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:freshcart_mobile/shared/models/product_model.dart';
import 'package:freshcart_mobile/shared/models/cart_model.dart';
import 'package:freshcart_mobile/shared/models/user_model.dart';

// Test data factories
class TestData {
  static ProductModel createProduct({
    String? id,
    String? name,
    String? slug,
    String? sku,
    double? price,
    double? discountPrice,
    int? stockQuantity,
    bool? isFeatured,
    String? unit,
    double? unitStep,
    List<ProductImageModel>? images,
  }) {
    return ProductModel(
      id: id ?? 'test-product-id',
      name: name ?? 'Test Product',
      slug: slug ?? 'test-product',
      sku: sku ?? 'TEST-001',
      price: price ?? 9.99,
      discountPrice: discountPrice,
      unit: unit ?? 'PIECE',
      unitStep: unitStep ?? 1.0,
      stockQuantity: stockQuantity ?? 100,
      minStockThreshold: 10,
      isFeatured: isFeatured ?? false,
      images: images ?? [],
    );
  }

  static CartItemModel createCartItem({
    String? id,
    ProductModel? product,
    int? quantity,
    double? unitPrice,
  }) {
    final prod = product ?? createProduct();
    return CartItemModel(
      id: id ?? 'cart-item-id',
      product: prod,
      quantity: quantity ?? 1,
      unitPrice: unitPrice ?? prod.effectivePrice,
    );
  }

  static CartModel createCart({
    List<CartItemModel>? items,
    String? couponCode,
    double? couponDiscount,
    double? deliveryFee,
    double? taxRate,
  }) {
    return CartModel(
      items: items ?? [],
      couponCode: couponCode,
      couponDiscount: couponDiscount ?? 0.0,
      deliveryFee: deliveryFee ?? 3.99,
      taxRate: taxRate ?? 0.085,
    );
  }

  static UserModel createUser({
    String? id,
    String? email,
    String? firstName,
    String? lastName,
    String? role,
    bool? isActive,
    bool? isEmailVerified,
  }) {
    return UserModel(
      id: id ?? 'test-user-id',
      email: email ?? 'test@example.com',
      firstName: firstName ?? 'John',
      lastName: lastName ?? 'Doe',
      role: role ?? 'CUSTOMER',
      isActive: isActive ?? true,
      isEmailVerified: isEmailVerified ?? true,
    );
  }

  static Map<String, dynamic> productJson({
    String? id,
    String? name,
    double? price,
    double? discountPrice,
    int? stockQuantity,
  }) {
    return {
      'id': id ?? 'json-product-id',
      'name': name ?? 'JSON Product',
      'slug': 'json-product',
      'sku': 'JSON-001',
      'price': price ?? 19.99,
      if (discountPrice != null) 'discountPrice': discountPrice,
      'unit': 'KILOGRAM',
      'unitStep': 0.5,
      'stockQuantity': stockQuantity ?? 50,
      'minStockThreshold': 5,
      'isFeatured': true,
      'images': [
        {
          'id': 'img-1',
          'url': 'https://example.com/image.jpg',
          'isPrimary': true,
          'sortOrder': 0,
        }
      ],
      'category': {'name': 'Fruits'},
      'averageRating': 4.5,
    };
  }

  static Map<String, dynamic> userJson({
    String? id,
    String? email,
    String? firstName,
    String? lastName,
  }) {
    return {
      'id': id ?? 'json-user-id',
      'email': email ?? 'json@example.com',
      'firstName': firstName ?? 'Jane',
      'lastName': lastName ?? 'Smith',
      'role': 'CUSTOMER',
      'isActive': true,
      'isEmailVerified': true,
    };
  }
}

// Widget test wrapper with providers
Widget createTestWidget(Widget child, {List<Override>? overrides}) {
  return ProviderScope(
    overrides: overrides ?? [],
    child: MaterialApp(
      home: Scaffold(body: child),
    ),
  );
}

// Common finders
Finder containsText(String text) => find.textContaining(text);

// Extension for easier testing
extension WidgetTesterExtension on WidgetTester {
  Future<void> pumpApp(Widget child, {List<Override>? overrides}) async {
    await pumpWidget(createTestWidget(child, overrides: overrides));
  }

  Future<void> pumpAndSettleApp(Widget child, {List<Override>? overrides}) async {
    await pumpWidget(createTestWidget(child, overrides: overrides));
    await pumpAndSettle();
  }
}
