import 'package:flutter_test/flutter_test.dart';
import 'package:freshcart_mobile/shared/models/product_model.dart';
import '../../helpers/test_helpers.dart';

void main() {
  group('ProductModel', () {
    group('constructor', () {
      test('should create product with required fields', () {
        final product = TestData.createProduct();

        expect(product.id, 'test-product-id');
        expect(product.name, 'Test Product');
        expect(product.price, 9.99);
        expect(product.stockQuantity, 100);
      });

      test('should have correct default values', () {
        final product = TestData.createProduct();

        expect(product.description, isNull);
        expect(product.discountPrice, isNull);
        expect(product.images, isEmpty);
        expect(product.averageRating, 5.0);
      });
    });

    group('effectivePrice', () {
      test('should return price when no discount', () {
        final product = TestData.createProduct(price: 10.0);

        expect(product.effectivePrice, 10.0);
      });

      test('should return discountPrice when available', () {
        final product = TestData.createProduct(
          price: 10.0,
          discountPrice: 7.50,
        );

        expect(product.effectivePrice, 7.50);
      });
    });

    group('hasDiscount', () {
      test('should return false when no discountPrice', () {
        final product = TestData.createProduct(price: 10.0);

        expect(product.hasDiscount, false);
      });

      test('should return true when discountPrice is less than price', () {
        final product = TestData.createProduct(
          price: 10.0,
          discountPrice: 8.0,
        );

        expect(product.hasDiscount, true);
      });

      test('should return false when discountPrice equals price', () {
        final product = TestData.createProduct(
          price: 10.0,
          discountPrice: 10.0,
        );

        expect(product.hasDiscount, false);
      });
    });

    group('isInStock', () {
      test('should return true when stockQuantity > 0', () {
        final product = TestData.createProduct(stockQuantity: 10);

        expect(product.isInStock, true);
      });

      test('should return false when stockQuantity is 0', () {
        final product = TestData.createProduct(stockQuantity: 0);

        expect(product.isInStock, false);
      });
    });

    group('discountPercentage', () {
      test('should return 0 when no discount', () {
        final product = TestData.createProduct(price: 10.0);

        expect(product.discountPercentage, 0);
      });

      test('should calculate correct percentage', () {
        final product = TestData.createProduct(
          price: 100.0,
          discountPrice: 75.0,
        );

        expect(product.discountPercentage, 25);
      });

      test('should round percentage correctly', () {
        final product = TestData.createProduct(
          price: 99.0,
          discountPrice: 66.0,
        );

        // (99 - 66) / 99 * 100 = 33.33... rounds to 33
        expect(product.discountPercentage, 33);
      });
    });

    group('primaryImageUrl', () {
      test('should return default image when no images', () {
        final product = TestData.createProduct(images: []);

        expect(product.primaryImageUrl, contains('unsplash.com'));
      });

      test('should return primary image when available', () {
        final product = TestData.createProduct(
          images: [
            ProductImageModel(
              id: '1',
              url: 'https://example.com/secondary.jpg',
              isPrimary: false,
              sortOrder: 1,
            ),
            ProductImageModel(
              id: '2',
              url: 'https://example.com/primary.jpg',
              isPrimary: true,
              sortOrder: 0,
            ),
          ],
        );

        expect(product.primaryImageUrl, 'https://example.com/primary.jpg');
      });

      test('should return first image when no primary marked', () {
        final product = TestData.createProduct(
          images: [
            ProductImageModel(
              id: '1',
              url: 'https://example.com/first.jpg',
              isPrimary: false,
              sortOrder: 0,
            ),
            ProductImageModel(
              id: '2',
              url: 'https://example.com/second.jpg',
              isPrimary: false,
              sortOrder: 1,
            ),
          ],
        );

        expect(product.primaryImageUrl, 'https://example.com/first.jpg');
      });
    });

    group('fromJson', () {
      test('should parse JSON correctly', () {
        final json = TestData.productJson(
          id: 'json-id',
          name: 'JSON Product',
          price: 25.99,
          stockQuantity: 75,
        );

        final product = ProductModel.fromJson(json);

        expect(product.id, 'json-id');
        expect(product.name, 'JSON Product');
        expect(product.price, 25.99);
        expect(product.stockQuantity, 75);
        expect(product.isFeatured, true);
        expect(product.unit, 'KILOGRAM');
        expect(product.unitStep, 0.5);
        expect(product.categoryName, 'Fruits');
        expect(product.averageRating, 4.5);
      });

      test('should parse images from JSON', () {
        final json = TestData.productJson();

        final product = ProductModel.fromJson(json);

        expect(product.images, hasLength(1));
        expect(product.images.first.url, 'https://example.com/image.jpg');
        expect(product.images.first.isPrimary, true);
      });

      test('should handle missing optional fields', () {
        final json = {
          'id': 'minimal-id',
          'name': 'Minimal Product',
          'slug': 'minimal',
          'sku': 'MIN-001',
          'price': 5.0,
        };

        final product = ProductModel.fromJson(json);

        expect(product.discountPrice, isNull);
        expect(product.unit, 'PIECE');
        expect(product.stockQuantity, 0);
        expect(product.images, isEmpty);
        expect(product.categoryName, isNull);
      });

      test('should parse discountPrice when present', () {
        final json = TestData.productJson(
          price: 20.0,
          discountPrice: 15.0,
        );

        final product = ProductModel.fromJson(json);

        expect(product.discountPrice, 15.0);
        expect(product.hasDiscount, true);
      });
    });
  });

  group('ProductImageModel', () {
    test('should create from JSON', () {
      final json = {
        'id': 'img-123',
        'url': 'https://example.com/test.jpg',
        'isPrimary': true,
        'sortOrder': 2,
      };

      final image = ProductImageModel.fromJson(json);

      expect(image.id, 'img-123');
      expect(image.url, 'https://example.com/test.jpg');
      expect(image.isPrimary, true);
      expect(image.sortOrder, 2);
    });

    test('should have default values for missing fields', () {
      final json = {
        'id': 'img-456',
        'url': 'https://example.com/test.jpg',
      };

      final image = ProductImageModel.fromJson(json);

      expect(image.isPrimary, false);
      expect(image.sortOrder, 0);
    });
  });
}
