import 'package:flutter_test/flutter_test.dart';
import 'package:freshcart_mobile/core/utils/currency_formatter.dart';

void main() {
  group('CurrencyFormatter', () {
    group('format', () {
      test('should format integer amounts correctly', () {
        expect(CurrencyFormatter.format(10), '\$10.00');
        expect(CurrencyFormatter.format(100), '\$100.00');
        expect(CurrencyFormatter.format(1000), '\$1,000.00');
      });

      test('should format decimal amounts correctly', () {
        expect(CurrencyFormatter.format(9.99), '\$9.99');
        expect(CurrencyFormatter.format(49.50), '\$49.50');
        expect(CurrencyFormatter.format(0.99), '\$0.99');
      });

      test('should format zero correctly', () {
        expect(CurrencyFormatter.format(0), '\$0.00');
      });

      test('should handle null values', () {
        expect(CurrencyFormatter.format(null), '\$0.00');
      });

      test('should format large amounts correctly', () {
        expect(CurrencyFormatter.format(10000), '\$10,000.00');
        expect(CurrencyFormatter.format(1000000), '\$1,000,000.00');
      });

      test('should round to two decimal places', () {
        expect(CurrencyFormatter.format(9.999), '\$10.00');
        expect(CurrencyFormatter.format(9.991), '\$9.99');
        expect(CurrencyFormatter.format(9.995), '\$10.00');
      });

      test('should format negative amounts', () {
        expect(CurrencyFormatter.format(-10), '-\$10.00');
        expect(CurrencyFormatter.format(-99.99), '-\$99.99');
      });

      test('should format very small amounts', () {
        expect(CurrencyFormatter.format(0.01), '\$0.01');
        expect(CurrencyFormatter.format(0.1), '\$0.10');
      });
    });
  });
}
