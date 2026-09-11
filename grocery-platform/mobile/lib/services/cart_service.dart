import '../shared/models/cart_model.dart';
import '../shared/models/product_model.dart';

class CartService {
  CartModel _cart = CartModel();

  CartModel get currentCart => _cart;

  CartModel addItem(ProductModel product, {int quantity = 1}) {
    final existingIndex = _cart.items.indexWhere((item) => item.product.id == product.id);

    if (existingIndex >= 0) {
      final existingItem = _cart.items[existingIndex];
      final updatedItem = existingItem.copyWith(
        quantity: existingItem.quantity + quantity,
      );
      final updatedItems = List<CartItemModel>.from(_cart.items);
      updatedItems[existingIndex] = updatedItem;
      _cart = _cart.copyWith(items: updatedItems);
    } else {
      final newItem = CartItemModel(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        product: product,
        quantity: quantity,
        unitPrice: product.effectivePrice,
      );
      _cart = _cart.copyWith(items: [..._cart.items, newItem]);
    }

    return _cart;
  }

  CartModel updateQuantity(String productId, int newQuantity) {
    if (newQuantity <= 0) {
      return removeItem(productId);
    }

    final updatedItems = _cart.items.map((item) {
      if (item.product.id == productId) {
        return item.copyWith(quantity: newQuantity);
      }
      return item;
    }).toList();

    _cart = _cart.copyWith(items: updatedItems);
    return _cart;
  }

  CartModel removeItem(String productId) {
    final updatedItems = _cart.items.where((item) => item.product.id != productId).toList();
    _cart = _cart.copyWith(items: updatedItems);
    return _cart;
  }

  CartModel clearCart() {
    _cart = CartModel();
    return _cart;
  }

  CartModel applyCoupon(String code, double discountAmount) {
    _cart = _cart.copyWith(
      couponCode: code,
      couponDiscount: discountAmount,
    );
    return _cart;
  }

  CartModel removeCoupon() {
    _cart = _cart.copyWith(
      couponCode: null,
      couponDiscount: 0.0,
    );
    return _cart;
  }
}
