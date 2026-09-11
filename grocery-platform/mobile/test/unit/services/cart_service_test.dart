import 'package:flutter_test/flutter_test.dart';
import 'package:freshcart_mobile/services/cart_service.dart';
import '../../helpers/test_helpers.dart';

void main() {
  group('CartService', () {
    late CartService cartService;

    setUp(() {
      cartService = CartService();
    });

    group('currentCart', () {
      test('should return empty cart initially', () {
        final cart = cartService.currentCart;

        expect(cart.items, isEmpty);
        expect(cart.totalItemCount, 0);
      });
    });

    group('addItem', () {
      test('should add new item to empty cart', () {
        final product = TestData.createProduct(id: 'product-1', price: 10.0);

        final cart = cartService.addItem(product);

        expect(cart.items, hasLength(1));
        expect(cart.items.first.product.id, 'product-1');
        expect(cart.items.first.quantity, 1);
        expect(cart.items.first.unitPrice, 10.0);
      });

      test('should add item with specified quantity', () {
        final product = TestData.createProduct();

        final cart = cartService.addItem(product, quantity: 5);

        expect(cart.items.first.quantity, 5);
      });

      test('should use effectivePrice as unitPrice', () {
        final product = TestData.createProduct(
          price: 20.0,
          discountPrice: 15.0,
        );

        final cart = cartService.addItem(product);

        expect(cart.items.first.unitPrice, 15.0);
      });

      test('should increment quantity for existing product', () {
        final product = TestData.createProduct(id: 'existing');

        cartService.addItem(product, quantity: 2);
        final cart = cartService.addItem(product, quantity: 3);

        expect(cart.items, hasLength(1));
        expect(cart.items.first.quantity, 5);
      });

      test('should add multiple different products', () {
        final product1 = TestData.createProduct(id: 'p1', name: 'Product 1');
        final product2 = TestData.createProduct(id: 'p2', name: 'Product 2');
        final product3 = TestData.createProduct(id: 'p3', name: 'Product 3');

        cartService.addItem(product1);
        cartService.addItem(product2);
        final cart = cartService.addItem(product3);

        expect(cart.items, hasLength(3));
      });
    });

    group('updateQuantity', () {
      test('should update item quantity', () {
        final product = TestData.createProduct(id: 'update-test');
        cartService.addItem(product, quantity: 2);

        final cart = cartService.updateQuantity('update-test', 5);

        expect(cart.items.first.quantity, 5);
      });

      test('should remove item when quantity is 0', () {
        final product = TestData.createProduct(id: 'remove-test');
        cartService.addItem(product, quantity: 3);

        final cart = cartService.updateQuantity('remove-test', 0);

        expect(cart.items, isEmpty);
      });

      test('should remove item when quantity is negative', () {
        final product = TestData.createProduct(id: 'negative-test');
        cartService.addItem(product);

        final cart = cartService.updateQuantity('negative-test', -1);

        expect(cart.items, isEmpty);
      });

      test('should not affect other items', () {
        final product1 = TestData.createProduct(id: 'p1');
        final product2 = TestData.createProduct(id: 'p2');
        cartService.addItem(product1, quantity: 2);
        cartService.addItem(product2, quantity: 3);

        final cart = cartService.updateQuantity('p1', 10);

        expect(cart.items, hasLength(2));
        expect(
          cart.items.firstWhere((i) => i.product.id == 'p1').quantity,
          10,
        );
        expect(
          cart.items.firstWhere((i) => i.product.id == 'p2').quantity,
          3,
        );
      });
    });

    group('removeItem', () {
      test('should remove item from cart', () {
        final product = TestData.createProduct(id: 'to-remove');
        cartService.addItem(product);

        final cart = cartService.removeItem('to-remove');

        expect(cart.items, isEmpty);
      });

      test('should only remove specified item', () {
        final product1 = TestData.createProduct(id: 'keep');
        final product2 = TestData.createProduct(id: 'remove');
        cartService.addItem(product1);
        cartService.addItem(product2);

        final cart = cartService.removeItem('remove');

        expect(cart.items, hasLength(1));
        expect(cart.items.first.product.id, 'keep');
      });

      test('should handle removing non-existent item', () {
        final product = TestData.createProduct(id: 'existing');
        cartService.addItem(product);

        final cart = cartService.removeItem('non-existent');

        expect(cart.items, hasLength(1));
      });
    });

    group('clearCart', () {
      test('should remove all items', () {
        cartService.addItem(TestData.createProduct(id: 'p1'));
        cartService.addItem(TestData.createProduct(id: 'p2'));
        cartService.addItem(TestData.createProduct(id: 'p3'));

        final cart = cartService.clearCart();

        expect(cart.items, isEmpty);
        expect(cart.totalItemCount, 0);
      });

      test('should reset coupon', () {
        cartService.addItem(TestData.createProduct());
        cartService.applyCoupon('TEST', 10.0);

        final cart = cartService.clearCart();

        expect(cart.couponCode, isNull);
        expect(cart.couponDiscount, 0.0);
      });
    });

    group('applyCoupon', () {
      test('should apply coupon code and discount', () {
        cartService.addItem(TestData.createProduct());

        final cart = cartService.applyCoupon('SAVE20', 20.0);

        expect(cart.couponCode, 'SAVE20');
        expect(cart.couponDiscount, 20.0);
      });

      test('should replace existing coupon', () {
        cartService.addItem(TestData.createProduct());
        cartService.applyCoupon('FIRST', 10.0);

        final cart = cartService.applyCoupon('SECOND', 25.0);

        expect(cart.couponCode, 'SECOND');
        expect(cart.couponDiscount, 25.0);
      });
    });

    group('removeCoupon', () {
      test('should remove applied coupon', () {
        cartService.addItem(TestData.createProduct());
        cartService.applyCoupon('TOREMOVE', 15.0);

        final cart = cartService.removeCoupon();

        expect(cart.couponCode, isNull);
        expect(cart.couponDiscount, 0.0);
      });

      test('should handle removing when no coupon applied', () {
        cartService.addItem(TestData.createProduct());

        final cart = cartService.removeCoupon();

        expect(cart.couponCode, isNull);
        expect(cart.couponDiscount, 0.0);
      });
    });

    group('complex scenarios', () {
      test('should calculate correct totals after multiple operations', () {
        // Add products
        final product1 = TestData.createProduct(id: 'p1', price: 10.0);
        final product2 = TestData.createProduct(id: 'p2', price: 20.0);

        cartService.addItem(product1, quantity: 2); // 20.0
        cartService.addItem(product2, quantity: 1); // 20.0
        cartService.updateQuantity('p2', 3); // 60.0

        var cart = cartService.currentCart;
        expect(cart.subtotal, 80.0); // 20 + 60

        // Apply coupon
        cartService.applyCoupon('SAVE10', 10.0);
        cart = cartService.currentCart;

        // subtotal: 80, discount: 10, discounted: 70
        // delivery: 0 (subtotal >= 50)
        // tax: 70 * 0.085 = 5.95
        // total: 70 + 0 + 5.95 = 75.95
        expect(cart.total, closeTo(75.95, 0.01));

        // Remove one product
        cartService.removeItem('p1');
        cart = cartService.currentCart;

        // subtotal: 60, discount: 10, discounted: 50
        // delivery: 0
        // tax: 50 * 0.085 = 4.25
        // total: 50 + 0 + 4.25 = 54.25
        expect(cart.total, closeTo(54.25, 0.01));
      });

      test('should maintain cart state across operations', () {
        final product = TestData.createProduct(id: 'persistent');

        cartService.addItem(product);
        expect(cartService.currentCart.items, hasLength(1));

        cartService.addItem(product);
        expect(cartService.currentCart.items, hasLength(1));
        expect(cartService.currentCart.items.first.quantity, 2);

        cartService.applyCoupon('TEST', 5.0);
        expect(cartService.currentCart.couponCode, 'TEST');

        cartService.updateQuantity('persistent', 10);
        expect(cartService.currentCart.items.first.quantity, 10);
        expect(cartService.currentCart.couponCode, 'TEST');
      });
    });
  });
}
