import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:freshcart_mobile/shared/widgets/custom_button.dart';

void main() {
  group('CustomButton', () {
    Widget createWidget({
      required String text,
      VoidCallback? onPressed,
      bool isLoading = false,
      bool isOutlined = false,
      Color? backgroundColor,
      Color? textColor,
      IconData? icon,
      double height = 52,
    }) {
      return MaterialApp(
        home: Scaffold(
          body: CustomButton(
            text: text,
            onPressed: onPressed,
            isLoading: isLoading,
            isOutlined: isOutlined,
            backgroundColor: backgroundColor,
            textColor: textColor,
            icon: icon,
            height: height,
          ),
        ),
      );
    }

    group('rendering', () {
      testWidgets('should display text', (tester) async {
        await tester.pumpWidget(createWidget(
          text: 'Click Me',
          onPressed: () {},
        ));

        expect(find.text('Click Me'), findsOneWidget);
      });

      testWidgets('should display icon when provided', (tester) async {
        await tester.pumpWidget(createWidget(
          text: 'With Icon',
          onPressed: () {},
          icon: Icons.add,
        ));

        expect(find.byIcon(Icons.add), findsOneWidget);
        expect(find.text('With Icon'), findsOneWidget);
      });

      testWidgets('should show CircularProgressIndicator when loading',
          (tester) async {
        await tester.pumpWidget(createWidget(
          text: 'Loading Button',
          onPressed: () {},
          isLoading: true,
        ));

        expect(find.byType(CircularProgressIndicator), findsOneWidget);
        expect(find.text('Loading Button'), findsNothing);
      });

      testWidgets('should render ElevatedButton by default', (tester) async {
        await tester.pumpWidget(createWidget(
          text: 'Elevated',
          onPressed: () {},
        ));

        expect(find.byType(ElevatedButton), findsOneWidget);
        expect(find.byType(OutlinedButton), findsNothing);
      });

      testWidgets('should render OutlinedButton when isOutlined is true',
          (tester) async {
        await tester.pumpWidget(createWidget(
          text: 'Outlined',
          onPressed: () {},
          isOutlined: true,
        ));

        expect(find.byType(OutlinedButton), findsOneWidget);
        expect(find.byType(ElevatedButton), findsNothing);
      });
    });

    group('interactions', () {
      testWidgets('should call onPressed when tapped', (tester) async {
        var tapped = false;
        await tester.pumpWidget(createWidget(
          text: 'Tap Me',
          onPressed: () => tapped = true,
        ));

        await tester.tap(find.byType(ElevatedButton));
        await tester.pump();

        expect(tapped, true);
      });

      testWidgets('should not call onPressed when disabled', (tester) async {
        var tapped = false;
        await tester.pumpWidget(createWidget(
          text: 'Disabled',
          onPressed: null,
        ));

        await tester.tap(find.byType(ElevatedButton));
        await tester.pump();

        expect(tapped, false);
      });

      testWidgets('should not call onPressed when loading', (tester) async {
        var tapped = false;
        await tester.pumpWidget(createWidget(
          text: 'Loading',
          onPressed: () => tapped = true,
          isLoading: true,
        ));

        await tester.tap(find.byType(ElevatedButton));
        await tester.pump();

        expect(tapped, false);
      });

      testWidgets('should call onPressed for outlined button', (tester) async {
        var tapped = false;
        await tester.pumpWidget(createWidget(
          text: 'Outlined Tap',
          onPressed: () => tapped = true,
          isOutlined: true,
        ));

        await tester.tap(find.byType(OutlinedButton));
        await tester.pump();

        expect(tapped, true);
      });
    });

    group('styling', () {
      testWidgets('should apply custom background color', (tester) async {
        await tester.pumpWidget(createWidget(
          text: 'Colored',
          onPressed: () {},
          backgroundColor: Colors.red,
        ));

        final elevatedButton =
            tester.widget<ElevatedButton>(find.byType(ElevatedButton));
        final style = elevatedButton.style;

        expect(style, isNotNull);
      });

      testWidgets('should apply custom height', (tester) async {
        await tester.pumpWidget(createWidget(
          text: 'Tall Button',
          onPressed: () {},
          height: 80,
        ));

        final elevatedButton =
            tester.widget<ElevatedButton>(find.byType(ElevatedButton));
        final style = elevatedButton.style;
        final minimumSize =
            style?.minimumSize?.resolve(WidgetState.values.toSet());

        expect(minimumSize?.height, 80);
      });
    });
  });
}
