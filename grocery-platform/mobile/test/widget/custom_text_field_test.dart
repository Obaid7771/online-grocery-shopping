import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:freshcart_mobile/shared/widgets/custom_text_field.dart';

void main() {
  group('CustomTextField', () {
    late TextEditingController controller;

    setUp(() {
      controller = TextEditingController();
    });

    tearDown(() {
      controller.dispose();
    });

    Widget createWidget({
      required String label,
      String? hintText,
      TextInputType keyboardType = TextInputType.text,
      bool isPassword = false,
      IconData? prefixIcon,
      Widget? suffixIcon,
      String? Function(String?)? validator,
      void Function(String)? onChanged,
      int maxLines = 1,
      bool autofocus = false,
    }) {
      return MaterialApp(
        home: Scaffold(
          body: Form(
            child: CustomTextField(
              label: label,
              controller: controller,
              hintText: hintText,
              keyboardType: keyboardType,
              isPassword: isPassword,
              prefixIcon: prefixIcon,
              suffixIcon: suffixIcon,
              validator: validator,
              onChanged: onChanged,
              maxLines: maxLines,
              autofocus: autofocus,
            ),
          ),
        ),
      );
    }

    group('rendering', () {
      testWidgets('should display label', (tester) async {
        await tester.pumpWidget(createWidget(label: 'Email Address'));

        expect(find.text('Email Address'), findsOneWidget);
      });

      testWidgets('should display hint text', (tester) async {
        await tester.pumpWidget(createWidget(
          label: 'Email',
          hintText: 'Enter your email',
        ));

        expect(find.text('Enter your email'), findsOneWidget);
      });

      testWidgets('should display prefix icon', (tester) async {
        await tester.pumpWidget(createWidget(
          label: 'Email',
          prefixIcon: Icons.email,
        ));

        expect(find.byIcon(Icons.email), findsOneWidget);
      });

      testWidgets('should display suffix icon', (tester) async {
        await tester.pumpWidget(createWidget(
          label: 'Field',
          suffixIcon: const Icon(Icons.clear),
        ));

        expect(find.byIcon(Icons.clear), findsOneWidget);
      });

      testWidgets('should show visibility toggle for password', (tester) async {
        await tester.pumpWidget(createWidget(
          label: 'Password',
          isPassword: true,
        ));

        expect(find.byIcon(Icons.visibility_off_outlined), findsOneWidget);
      });
    });

    group('text input', () {
      testWidgets('should update controller when text is entered',
          (tester) async {
        await tester.pumpWidget(createWidget(label: 'Input'));

        await tester.enterText(find.byType(TextFormField), 'Hello World');

        expect(controller.text, 'Hello World');
      });

      testWidgets('should call onChanged when text changes', (tester) async {
        String? changedValue;
        await tester.pumpWidget(createWidget(
          label: 'Input',
          onChanged: (value) => changedValue = value,
        ));

        await tester.enterText(find.byType(TextFormField), 'Test');

        expect(changedValue, 'Test');
      });

      testWidgets('should obscure text for password field', (tester) async {
        await tester.pumpWidget(createWidget(
          label: 'Password',
          isPassword: true,
        ));

        final textField = tester.widget<TextField>(find.byType(TextField));
        expect(textField.obscureText, true);
      });
    });

    group('password visibility toggle', () {
      testWidgets('should toggle password visibility', (tester) async {
        await tester.pumpWidget(createWidget(
          label: 'Password',
          isPassword: true,
        ));

        // Initially obscured
        var textField = tester.widget<TextField>(find.byType(TextField));
        expect(textField.obscureText, true);
        expect(find.byIcon(Icons.visibility_off_outlined), findsOneWidget);

        // Tap to show password
        await tester.tap(find.byType(IconButton));
        await tester.pump();

        textField = tester.widget<TextField>(find.byType(TextField));
        expect(textField.obscureText, false);
        expect(find.byIcon(Icons.visibility_outlined), findsOneWidget);

        // Tap to hide password again
        await tester.tap(find.byType(IconButton));
        await tester.pump();

        textField = tester.widget<TextField>(find.byType(TextField));
        expect(textField.obscureText, true);
        expect(find.byIcon(Icons.visibility_off_outlined), findsOneWidget);
      });
    });

    group('validation', () {
      testWidgets('should display validation error', (tester) async {
        await tester.pumpWidget(createWidget(
          label: 'Email',
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Email is required';
            }
            return null;
          },
        ));

        // Submit empty form to trigger validation
        final formState =
            tester.state<FormState>(find.byType(Form));
        formState.validate();
        await tester.pump();

        expect(find.text('Email is required'), findsOneWidget);
      });

      testWidgets('should not show error when validation passes',
          (tester) async {
        await tester.pumpWidget(createWidget(
          label: 'Email',
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Email is required';
            }
            return null;
          },
        ));

        await tester.enterText(find.byType(TextFormField), 'test@example.com');

        final formState =
            tester.state<FormState>(find.byType(Form));
        formState.validate();
        await tester.pump();

        expect(find.text('Email is required'), findsNothing);
      });
    });

    group('keyboard type', () {
      testWidgets('should apply email keyboard type', (tester) async {
        await tester.pumpWidget(createWidget(
          label: 'Email',
          keyboardType: TextInputType.emailAddress,
        ));

        final textField = tester.widget<TextField>(find.byType(TextField));
        expect(textField.keyboardType, TextInputType.emailAddress);
      });

      testWidgets('should apply number keyboard type', (tester) async {
        await tester.pumpWidget(createWidget(
          label: 'Phone',
          keyboardType: TextInputType.phone,
        ));

        final textField = tester.widget<TextField>(find.byType(TextField));
        expect(textField.keyboardType, TextInputType.phone);
      });
    });

    group('multiline', () {
      testWidgets('should allow multiple lines when maxLines > 1',
          (tester) async {
        await tester.pumpWidget(createWidget(
          label: 'Description',
          maxLines: 5,
        ));

        final textField = tester.widget<TextField>(find.byType(TextField));
        expect(textField.maxLines, 5);
      });

      testWidgets('should force single line for password', (tester) async {
        await tester.pumpWidget(createWidget(
          label: 'Password',
          isPassword: true,
          maxLines: 5,
        ));

        final textField = tester.widget<TextField>(find.byType(TextField));
        expect(textField.maxLines, 1);
      });
    });
  });
}
