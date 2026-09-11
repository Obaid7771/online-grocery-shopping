import 'package:flutter_test/flutter_test.dart';
import 'package:freshcart_mobile/shared/models/cart_model.dart';
import '../../helpers/test_helpers.dart';

void main() {
  group('CartItemModel', () {
    test('should calculate totalPrice correctly', () {
      final item = TestData.createCartItem(
        unitPrice: 5.99,
        quantity: 3,
      );

      expect(item.totalPrice, closeTo(17.97, 0.01));
    });

    test('should copy with new quantity', () {
      final item = TestData.createCartItem(quantity: 2);
      final updated = item.copyWith(quantity: 5);

      expect(updated.quantity, 5);
      expect(updated.id, item.id);
      expect(updated.product.id, item.product.id);
    });

    test('should copy with new unitPrice', () {
      final item = TestData.createCartItem(unitPrice: 10.0);
      final updated = item.copyWith(unitPrice: 8.0);

      expect(updated.unitPrice, 8.0);
      expect(updated.quantity, item.quantity);
    });
  });

  group('CartModel', () {
    group('constructor', () {
      test('should create empty cart with defaults', () {
        final cart = CartModel();

        expect(cart.items, isEmpty);
        expect(cart.couponCode, isNull);
        expect(cart.couponDiscount, 0.0);
        expect(cart.deliveryFee, 3.99);
        expect(cart.taxRate, 0.085);
      });

      test('should create cart with provided items', () {
        final items = [
          TestData.createCartItem(quantity: 2),
          TestData.createCartItem(id: 'item-2', quantity: 1),
        ];
        final cart = CartModel(items: items);

        expect(cart.items, hasLength(2));
      });
    });

    group('totalItemCount', () {
      test('should return 0 for empty cart', () {
        final cart = CartModel();

        expect(cart.totalItemCount, 0);
      });

      test('should sum quantities of all items', () {
        final cart = TestData.createCart(items: [
          TestData.createCartItem(quantity: 2),
          TestData.createCartItem(id: 'item-2', quantity: 3),
          TestData.createCartItem(id: 'item-3', quantity: 1),
        ]);

        expect(cart.totalItemCount, 6);
      });
    });

    group('subtotal', () {
      test('should return 0 for empty cart', () {
        final cart = CartModel();

        expect(cart.subtotal, 0.0);
      });

      test('should sum total prices of all items', () {
        final cart = TestData.createCart(items: [
          TestData.createCartItem(unitPrice: 10.0, quantity: 2), // 20.0
          TestData.createCartItem(
            id: 'item-2',
            unitPrice: 5.0,
            quantity: 3,
          ), // 15.0
        ]);

        expect(cart.subtotal, 35.0);
      });
    });

    group('calculatedDeliveryFee', () {
      test('should return 0 for empty cart', () {
        final cart = CartModel();

        expect(cart.calculatedDeliveryFee, 0.0);
      });

      test('should return 0 when subtotal >= 50', () {
        final cart = TestData.createCart(
          items: [
            TestData.createCartItem(unitPrice: 60.0, quantity: 1),
          ],
          deliveryFee: 5.99,
        );

        expect(cart.calculatedDeliveryFee, 0.0);
      });

      test('should return deliveryFee when subtotal < 50', () {
        final cart = TestData.createCart(
          items: [
            TestData.createCartItem(unitPrice: 30.0, quantity: 1),
          ],
          deliveryFee: 4.99,
        );

        expect(cart.calculatedDeliveryFee, 4.99);
      });

      test('should return 0 when subtotal equals 50', () {
        final cart = TestData.createCart(
          items: [
            TestData.createCartItem(unitPrice: 50.0, quantity: 1),
          ],
          deliveryFee: 3.99,
        );

        expect(cart.calculatedDeliveryFee, 0.0);
      });
    });

    group('discountAmount', () {
      test('should return couponDiscount', () {
        final cart = TestData.createCart(couponDiscount: 10.0);

        expect(cart.discountAmount, 10.0);
      });
    });

    group('taxAmount', () {
      test('should calculate tax on discounted subtotal', () {
        final cart = TestData.createCart(
          items: [
            TestData.createCartItem(unitPrice: 100.0, quantity: 1),
          ],
          couponDiscount: 20.0,
          taxRate: 0.10,
        );

        // (100 - 20) * 0.10 = 8.0
        expect(cart.taxAmount, 8.0);
      });

      test('should return 0 when discount exceeds subtotal', () {
        final cart = TestData.createCart(
          items: [
            TestData.createCartItem(unitPrice: 10.0, quantity: 1),
          ],
          couponDiscount: 20.0,
        );

        expect(cart.taxAmount, 0.0);
      });
    });

    group('total', () {
      test('should return 0 for empty cart', () {
        final cart = CartModel();

        expect(cart.total, 0.0);
      });

      test('should calculate total correctly without discount', () {
        final cart = CartModel(
          items: [
            TestData.createCartItem(unitPrice: 40.0, quantity: 1),
          ],
          deliveryFee: 5.0,
          taxRate: 0.10,
        );

        // subtotal: 40
        // delivery: 5 (subtotal < 50)
        // tax: 40 * 0.10 = 4
        // total: 40 + 5 + 4 = 49
        expect(cart.total, 49.0);
      });

      test('should calculate total correctly with discount', () {
        final cart = CartModel(
          items: [
            TestData.createCartItem(unitPrice: 100.0, quantity: 1),
          ],
          couponDiscount: 10.0,
          deliveryFee: 5.0,
          taxRate: 0.10,
        );

        // subtotal: 100
        // discount: 10
        // discounted subtotal: 90
        // delivery: 0 (subtotal >= 50)
        // tax: 90 * 0.10 = 9
        // total: 90 + 0 + 9 = 99
        expect(cart.total, 99.0);
      });

      test('should clamp discounted subtotal to 0', () {
        final cart = CartModel(
          items: [
            TestData.createCartItem(unitPrice: 10.0, quantity: 1),
          ],
          couponDiscount: 50.0,
          deliveryFee: 5.0,
          taxRate: 0.10,
        );

        // discounted subtotal clamped to 0
        // delivery: 5 (subtotal < 50)
        // tax: 0
        // total: 0 + 5 + 0 = 5
        expect(cart.total, 5.0);
      });
    });

    group('copyWith', () {
      test('should copy with new items', () {
        final original = TestData.createCart(
          items: [TestData.createCartItem()],
        );
        final newItems = [
          TestData.createCartItem(id: 'new-1'),
          TestData.createCartItem(id: 'new-2'),
        ];

        final updated = original.copyWith(items: newItems);

        expect(updated.items, hasLength(2));
        expect(original.items, hasLength(1));
      });

      test('should copy with new coupon', () {
        final original = TestData.createCart();
        final updated = original.copyWith(
          couponCode: 'SAVE20',
          couponDiscount: 20.0,
        );

        expect(updated.couponCode, 'SAVE20');
        expect(updated.couponDiscount, 20.0);
        expect(original.couponCode, isNull);
      });

      test('should preserve unchanged values', () {
        final original = TestData.createCart(
          deliveryFee: 4.99,
          couponCode: 'TEST',
        );
        final updated = original.copyWith(couponDiscount: 5.0);

        expect(updated.deliveryFee, 4.99);
        expect(updated.couponCode, 'TEST');
        expect(updated.taxRate, original.taxRate);
      });
    });
  });
}
