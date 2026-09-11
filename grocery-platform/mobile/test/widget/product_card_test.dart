import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:freshcart_mobile/shared/widgets/product_card.dart';
import 'package:freshcart_mobile/shared/models/product_model.dart';
import '../helpers/test_helpers.dart';

void main() {
  group('ProductCard', () {
    Widget createProductCard({
      required product,
      double? width,
    }) {
      return ProviderScope(
        child: MaterialApp(
          home: Scaffold(
            body: ProductCard(
              product: product,
              width: width,
            ),
          ),
        ),
      );
    }

    group('rendering', () {
      testWidgets('should display product name', (tester) async {
        final product = TestData.createProduct(name: 'Organic Apples');

        await tester.pumpWidget(createProductCard(product: product));

        expect(find.text('Organic Apples'), findsOneWidget);
      });

      testWidgets('should display unit information', (tester) async {
        final product = TestData.createProduct(
          unit: 'KILOGRAM',
          unitStep: 0.5,
        );

        await tester.pumpWidget(createProductCard(product: product));

        expect(find.text('0.5 kilogram'), findsOneWidget);
      });

      testWidgets('should display price', (tester) async {
        final product = TestData.createProduct(price: 9.99);

        await tester.pumpWidget(createProductCard(product: product));

        expect(find.textContaining('9.99'), findsOneWidget);
      });

      testWidgets('should display discount badge when product has discount',
          (tester) async {
        final product = TestData.createProduct(
          price: 10.0,
          discountPrice: 8.0,
        );

        await tester.pumpWidget(createProductCard(product: product));

        expect(find.textContaining('-20%'), findsOneWidget);
      });

      testWidgets('should not display discount badge without discount',
          (tester) async {
        final product = TestData.createProduct(price: 10.0);

        await tester.pumpWidget(createProductCard(product: product));

        expect(find.textContaining('%'), findsNothing);
      });

      testWidgets('should display original price when discounted',
          (tester) async {
        final product = TestData.createProduct(
          price: 10.0,
          discountPrice: 7.5,
        );

        await tester.pumpWidget(createProductCard(product: product));

        expect(find.textContaining('10.0'), findsOneWidget);
        expect(find.textContaining('7.5'), findsOneWidget);
      });

      testWidgets('should apply custom width', (tester) async {
        final product = TestData.createProduct();

        await tester.pumpWidget(createProductCard(
          product: product,
          width: 200,
        ));

        final container = tester.widget<Container>(
          find.byType(Container).first,
        );

        expect(container.constraints?.maxWidth, 200);
      });
    });

    group('add to cart button', () {
      testWidgets('should show add button when not in cart', (tester) async {
        final product = TestData.createProduct(stockQuantity: 10);

        await tester.pumpWidget(createProductCard(product: product));

        expect(find.byIcon(Icons.add), findsOneWidget);
      });

      testWidgets('should be disabled when out of stock', (tester) async {
        final product = TestData.createProduct(stockQuantity: 0);

        await tester.pumpWidget(createProductCard(product: product));

        final addButton = find.byIcon(Icons.add);
        expect(addButton, findsOneWidget);

        // The button should be styled differently (using border color)
        final inkWell = tester.widget<InkWell>(
          find.ancestor(
            of: find.byIcon(Icons.add),
            matching: find.byType(InkWell),
          ).first,
        );
        expect(inkWell.onTap, isNull);
      });
    });

    group('product image', () {
      testWidgets('should display product image', (tester) async {
        final product = TestData.createProduct(
          images: [
            ProductImageModel(
              id: '1',
              url: 'https://example.com/image.jpg',
              isPrimary: true,
              sortOrder: 0,
            ),
          ],
        );

        await tester.pumpWidget(createProductCard(product: product));

        // CachedNetworkImage renders with the URL
        expect(find.byType(ClipRRect), findsOneWidget);
      });
    });

    group('cart quantity controls', () {
      testWidgets('should add item to cart when add button tapped',
          (tester) async {
        final product = TestData.createProduct(
          id: 'add-test',
          stockQuantity: 10,
        );

        await tester.pumpWidget(createProductCard(product: product));

        // Find and tap the add button
        await tester.tap(find.byIcon(Icons.add));
        await tester.pumpAndSettle();

        // After adding, should show quantity controls with quantity 1
        expect(find.text('1'), findsOneWidget);
      });

      testWidgets('should show quantity controls after adding item',
          (tester) async {
        final product = TestData.createProduct(
          id: 'quantity-test',
          stockQuantity: 10,
        );

        await tester.pumpWidget(createProductCard(product: product));

        // Add item
        await tester.tap(find.byIcon(Icons.add));
        await tester.pumpAndSettle();

        // Should now show both add and remove icons
        expect(find.byIcon(Icons.add), findsOneWidget);
        expect(find.byIcon(Icons.remove), findsOneWidget);
      });

      testWidgets('should increment quantity when plus tapped', (tester) async {
        final product = TestData.createProduct(
          id: 'increment-test',
          stockQuantity: 10,
        );

        await tester.pumpWidget(createProductCard(product: product));

        // Add item twice
        await tester.tap(find.byIcon(Icons.add));
        await tester.pumpAndSettle();

        await tester.tap(find.byIcon(Icons.add));
        await tester.pumpAndSettle();

        expect(find.text('2'), findsOneWidget);
      });

      testWidgets('should decrement quantity when minus tapped',
          (tester) async {
        final product = TestData.createProduct(
          id: 'decrement-test',
          stockQuantity: 10,
        );

        await tester.pumpWidget(createProductCard(product: product));

        // Add 2 items
        await tester.tap(find.byIcon(Icons.add));
        await tester.pumpAndSettle();
        await tester.tap(find.byIcon(Icons.add));
        await tester.pumpAndSettle();

        // Remove 1
        await tester.tap(find.byIcon(Icons.remove));
        await tester.pumpAndSettle();

        expect(find.text('1'), findsOneWidget);
      });

      testWidgets('should remove item when quantity becomes 0', (tester) async {
        final product = TestData.createProduct(
          id: 'remove-test',
          stockQuantity: 10,
        );

        await tester.pumpWidget(createProductCard(product: product));

        // Add then remove
        await tester.tap(find.byIcon(Icons.add));
        await tester.pumpAndSettle();

        await tester.tap(find.byIcon(Icons.remove));
        await tester.pumpAndSettle();

        // Should show single add button again
        expect(find.byIcon(Icons.remove), findsNothing);
        // Single add button (not in quantity controls)
        final addIcons = find.byIcon(Icons.add);
        expect(addIcons, findsOneWidget);
      });
    });
  });
}
