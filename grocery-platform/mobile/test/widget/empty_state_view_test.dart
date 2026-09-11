import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:freshcart_mobile/shared/widgets/empty_state_view.dart';

void main() {
  group('EmptyStateView', () {
    Widget createWidget({
      IconData icon = Icons.shopping_cart_outlined,
      String title = 'Test Title',
      String description = 'Test Description',
      String? buttonText,
      VoidCallback? onButtonPressed,
    }) {
      return MaterialApp(
        home: Scaffold(
          body: EmptyStateView(
            icon: icon,
            title: title,
            description: description,
            buttonText: buttonText,
            onButtonPressed: onButtonPressed,
          ),
        ),
      );
    }

    group('rendering', () {
      testWidgets('should display icon', (tester) async {
        await tester.pumpWidget(createWidget(
          icon: Icons.inbox_outlined,
        ));

        expect(find.byIcon(Icons.inbox_outlined), findsOneWidget);
      });

      testWidgets('should display title', (tester) async {
        await tester.pumpWidget(createWidget(
          title: 'No Items Found',
        ));

        expect(find.text('No Items Found'), findsOneWidget);
      });

      testWidgets('should display description', (tester) async {
        await tester.pumpWidget(createWidget(
          description: 'Your cart is empty. Start shopping!',
        ));

        expect(find.text('Your cart is empty. Start shopping!'), findsOneWidget);
      });

      testWidgets('should not display button when buttonText is null',
          (tester) async {
        await tester.pumpWidget(createWidget(
          buttonText: null,
        ));

        expect(find.byType(ElevatedButton), findsNothing);
      });

      testWidgets('should not display button when onButtonPressed is null',
          (tester) async {
        await tester.pumpWidget(createWidget(
          buttonText: 'Action',
          onButtonPressed: null,
        ));

        expect(find.byType(ElevatedButton), findsNothing);
      });

      testWidgets('should display button when both text and callback provided',
          (tester) async {
        await tester.pumpWidget(createWidget(
          buttonText: 'Start Shopping',
          onButtonPressed: () {},
        ));

        expect(find.text('Start Shopping'), findsOneWidget);
        expect(find.byType(ElevatedButton), findsOneWidget);
      });
    });

    group('interactions', () {
      testWidgets('should call onButtonPressed when button tapped',
          (tester) async {
        var tapped = false;
        await tester.pumpWidget(createWidget(
          buttonText: 'Browse Products',
          onButtonPressed: () => tapped = true,
        ));

        await tester.tap(find.text('Browse Products'));
        await tester.pump();

        expect(tapped, true);
      });
    });

    group('layout', () {
      testWidgets('should center content', (tester) async {
        await tester.pumpWidget(createWidget());

        expect(find.byType(Center), findsOneWidget);
      });

      testWidgets('should display all elements in column', (tester) async {
        await tester.pumpWidget(createWidget(
          buttonText: 'Action',
          onButtonPressed: () {},
        ));

        expect(find.byType(Column), findsAtLeastNWidgets(1));
      });
    });

    group('common empty states', () {
      testWidgets('should render cart empty state', (tester) async {
        await tester.pumpWidget(createWidget(
          icon: Icons.shopping_cart_outlined,
          title: 'Your Cart is Empty',
          description:
              'Looks like you haven\'t added any items to your cart yet.',
          buttonText: 'Start Shopping',
          onButtonPressed: () {},
        ));

        expect(find.byIcon(Icons.shopping_cart_outlined), findsOneWidget);
        expect(find.text('Your Cart is Empty'), findsOneWidget);
        expect(find.text('Start Shopping'), findsOneWidget);
      });

      testWidgets('should render no orders state', (tester) async {
        await tester.pumpWidget(createWidget(
          icon: Icons.receipt_long_outlined,
          title: 'No Orders Yet',
          description: 'You haven\'t placed any orders yet.',
          buttonText: 'Browse Products',
          onButtonPressed: () {},
        ));

        expect(find.byIcon(Icons.receipt_long_outlined), findsOneWidget);
        expect(find.text('No Orders Yet'), findsOneWidget);
        expect(find.text('Browse Products'), findsOneWidget);
      });

      testWidgets('should render no search results state', (tester) async {
        await tester.pumpWidget(createWidget(
          icon: Icons.search_off,
          title: 'No Results Found',
          description: 'Try searching with different keywords.',
        ));

        expect(find.byIcon(Icons.search_off), findsOneWidget);
        expect(find.text('No Results Found'), findsOneWidget);
        expect(find.byType(ElevatedButton), findsNothing);
      });

      testWidgets('should render no notifications state', (tester) async {
        await tester.pumpWidget(createWidget(
          icon: Icons.notifications_none_outlined,
          title: 'No Notifications',
          description: 'You\'re all caught up!',
        ));

        expect(find.byIcon(Icons.notifications_none_outlined), findsOneWidget);
        expect(find.text('No Notifications'), findsOneWidget);
      });
    });
  });
}
