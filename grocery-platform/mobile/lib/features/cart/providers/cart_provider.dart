import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../services/cart_service.dart';
import '../../../shared/models/cart_model.dart';
import '../../../shared/models/product_model.dart';

final cartServiceProvider = Provider<CartService>((ref) {
  return CartService();
});

class CartNotifier extends StateNotifier<CartModel> {
  final CartService _cartService;

  CartNotifier(this._cartService) : super(_cartService.currentCart);

  void addItem(ProductModel product, {int quantity = 1}) {
    state = _cartService.addItem(product, quantity: quantity);
  }

  void updateQuantity(String productId, int newQuantity) {
    state = _cartService.updateQuantity(productId, newQuantity);
  }

  void removeItem(String productId) {
    state = _cartService.removeItem(productId);
  }

  void clearCart() {
    state = _cartService.clearCart();
  }

  void applyCoupon(String code, double discountAmount) {
    state = _cartService.applyCoupon(code, discountAmount);
  }

  void removeCoupon() {
    state = _cartService.removeCoupon();
  }

  int getItemQuantity(String productId) {
    final item = state.items.firstWhere(
      (i) => i.product.id == productId,
      orElse: () => CartItemModel(
        id: '',
        product: ProductModel(
          id: '',
          name: '',
          slug: '',
          sku: '',
          price: 0,
          unit: 'PIECE',
          unitStep: 1,
          stockQuantity: 0,
          minStockThreshold: 0,
          isFeatured: false,
        ),
        quantity: 0,
        unitPrice: 0,
      ),
    );
    return item.quantity;
  }
}

final cartProvider = StateNotifierProvider<CartNotifier, CartModel>((ref) {
  final cartService = ref.watch(cartServiceProvider);
  return CartNotifier(cartService);
});
