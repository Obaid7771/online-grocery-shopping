import 'package:intl/intl.dart';

class CurrencyFormatter {
  static final NumberFormat _formatter = NumberFormat.currency(
    symbol: '\$',
    decimalDigits: 2,
  );

  static String format(num? amount) {
    if (amount == null) return '\$0.00';
    return _formatter.format(amount);
  }
}
