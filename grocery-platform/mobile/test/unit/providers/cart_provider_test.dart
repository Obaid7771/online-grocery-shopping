import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:freshcart_mobile/features/cart/providers/cart_provider.dart';
import 'package:freshcart_mobile/services/cart_service.dart';
import '../../helpers/test_helpers.dart';

void main() {
  group('CartNotifier', () {
    late ProviderContainer container;
    late CartNotifier cartNotifier;

    setUp(() {
      container = ProviderContainer();
      cartNotifier = container.read(cartProvider.notifier);
    });

    tearDown(() {
      container.dispose();
    });

    group('addItem', () {
      test('should add item to cart state', () {
        final product = TestData.createProduct(id: 'test-product');

        cartNotifier.addItem(product);

        final cart = container.read(cartProvider);
        expect(cart.items, hasLength(1));
        expect(cart.items.first.product.id, 'test-product');
      });

      test('should increment quantity for existing product', () {
        final product = TestData.createProduct(id: 'existing');

        cartNotifier.addItem(product);
        cartNotifier.addItem(product);

        final cart = container.read(cartProvider);
        expect(cart.items, hasLength(1));
        expect(cart.items.first.quantity, 2);
      });

      test('should add with custom quantity', () {
        final product = TestData.createProduct();

        cartNotifier.addItem(product, quantity: 5);

        final cart = container.read(cartProvider);
        expect(cart.items.first.quantity, 5);
      });
    });

    group('updateQuantity', () {
      test('should update item quantity', () {
        final product = TestData.createProduct(id: 'update');
        cartNotifier.addItem(product, quantity: 1);

        cartNotifier.updateQuantity('update', 10);

        final cart = container.read(cartProvider);
        expect(cart.items.first.quantity, 10);
      });

      test('should remove item when quantity becomes 0', () {
        final product = TestData.createProduct(id: 'remove');
        cartNotifier.addItem(product);

        cartNotifier.updateQuantity('remove', 0);

        final cart = container.read(cartProvider);
        expect(cart.items, isEmpty);
      });
    });

    group('removeItem', () {
      test('should remove item from cart', () {
        final product = TestData.createProduct(id: 'to-remove');
        cartNotifier.addItem(product);

        cartNotifier.removeItem('to-remove');

        final cart = container.read(cartProvider);
        expect(cart.items, isEmpty);
      });
    });

    group('clearCart', () {
      test('should clear all items', () {
        cartNotifier.addItem(TestData.createProduct(id: 'p1'));
        cartNotifier.addItem(TestData.createProduct(id: 'p2'));

        cartNotifier.clearCart();

        final cart = container.read(cartProvider);
        expect(cart.items, isEmpty);
      });
    });

    group('applyCoupon', () {
      test('should apply coupon to cart', () {
        cartNotifier.addItem(TestData.createProduct());

        cartNotifier.applyCoupon('DISCOUNT20', 20.0);

        final cart = container.read(cartProvider);
        expect(cart.couponCode, 'DISCOUNT20');
        expect(cart.couponDiscount, 20.0);
      });
    });

    group('removeCoupon', () {
      test('should remove coupon from cart', () {
        cartNotifier.addItem(TestData.createProduct());
        cartNotifier.applyCoupon('CODE', 10.0);

        cartNotifier.removeCoupon();

        final cart = container.read(cartProvider);
        expect(cart.couponCode, isNull);
        expect(cart.couponDiscount, 0.0);
      });
    });

    group('getItemQuantity', () {
      test('should return quantity for existing item', () {
        final product = TestData.createProduct(id: 'existing');
        cartNotifier.addItem(product, quantity: 3);

        final quantity = cartNotifier.getItemQuantity('existing');

        expect(quantity, 3);
      });

      test('should return 0 for non-existing item', () {
        final quantity = cartNotifier.getItemQuantity('non-existent');

        expect(quantity, 0);
      });
    });
  });

  group('cartServiceProvider', () {
    test('should provide CartService instance', () {
      final container = ProviderContainer();

      final service = container.read(cartServiceProvider);

      expect(service, isA<CartService>());
      container.dispose();
    });
  });

  group('cartProvider state updates', () {
    test('should notify listeners on state change', () {
      final container = ProviderContainer();
      var updateCount = 0;

      container.listen(
        cartProvider,
        (previous, next) {
          updateCount++;
        },
      );

      final notifier = container.read(cartProvider.notifier);
      final product = TestData.createProduct();

      notifier.addItem(product);
      notifier.addItem(product);
      notifier.clearCart();

      expect(updateCount, 3);
      container.dispose();
    });
  });
}
