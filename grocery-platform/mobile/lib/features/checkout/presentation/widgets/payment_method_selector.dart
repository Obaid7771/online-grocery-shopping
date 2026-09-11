import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/models/order_model.dart';

class PaymentMethodSelector extends StatelessWidget {
  final PaymentMethodType selectedMethod;
  final ValueChanged<PaymentMethodType> onMethodChanged;

  const PaymentMethodSelector({
    super.key,
    required this.selectedMethod,
    required this.onMethodChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.payment_rounded, color: AppColors.primary, size: 20),
              const SizedBox(width: 8),
              Text('Payment Method', style: AppTextStyles.h3.copyWith(fontSize: 16)),
            ],
          ),
          const SizedBox(height: 12),
          _buildOption(
            type: PaymentMethodType.stripe,
            title: 'Credit / Debit Card (Stripe)',
            subtitle: 'Instant secure checkout via Stripe',
            icon: Icons.credit_card_rounded,
            iconColor: AppColors.primaryDark,
          ),
          const Divider(color: AppColors.divider, height: 16),
          _buildOption(
            type: PaymentMethodType.applePay,
            title: 'Apple Pay',
            subtitle: 'Fast one-touch payment',
            icon: Icons.apple_rounded,
            iconColor: Colors.black,
          ),
          const Divider(color: AppColors.divider, height: 16),
          _buildOption(
            type: PaymentMethodType.googlePay,
            title: 'Google Pay',
            subtitle: 'Pay with Google Account',
            icon: Icons.g_mobiledata_rounded,
            iconColor: Colors.blueAccent,
          ),
          const Divider(color: AppColors.divider, height: 16),
          _buildOption(
            type: PaymentMethodType.paypal,
            title: 'PayPal',
            subtitle: 'Safe digital wallet payment',
            icon: Icons.account_balance_wallet_outlined,
            iconColor: Colors.indigo,
          ),
          const Divider(color: AppColors.divider, height: 16),
          _buildOption(
            type: PaymentMethodType.cashOnDelivery,
            title: 'Cash on Delivery',
            subtitle: 'Pay cash upon arrival of groceries',
            icon: Icons.money_rounded,
            iconColor: AppColors.success,
          ),
        ],
      ),
    );
  }

  Widget _buildOption({
    required PaymentMethodType type,
    required String title,
    required String subtitle,
    required IconData icon,
    required Color iconColor,
  }) {
    final isSelected = selectedMethod == type;

    return InkWell(
      onTap: () => onMethodChanged(type),
      borderRadius: BorderRadius.circular(10),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primarySurface : AppColors.background,
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: iconColor, size: 22),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: AppTextStyles.bodyMedium.copyWith(
                      fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
                    ),
                  ),
                  Text(
                    subtitle,
                    style: AppTextStyles.bodySmall.copyWith(fontSize: 11),
                  ),
                ],
              ),
            ),
            Icon(
              isSelected ? Icons.radio_button_checked : Icons.radio_button_off,
              color: isSelected ? AppColors.primary : AppColors.textTertiary,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }
}
