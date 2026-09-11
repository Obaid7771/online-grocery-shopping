import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../shared/models/order_model.dart';
import '../../../shared/widgets/custom_button.dart';
import '../../../shared/widgets/responsive_wrapper.dart';

class OrderConfirmationScreen extends StatelessWidget {
  final OrderModel order;

  const OrderConfirmationScreen({
    super.key,
    required this.order,
  });

  @override
  Widget build(BuildContext context) {
    final horizontalPadding = ResponsiveWrapper.getHorizontalPadding(context);

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) context.go('/home');
      },
      child: Scaffold(
        backgroundColor: Colors.white,
        body: SafeArea(
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: horizontalPadding, vertical: 16),
            child: Column(
              children: [
                const Spacer(),

                // Success Badge
                Container(
                  width: 90,
                  height: 90,
                  decoration: BoxDecoration(
                    color: AppColors.primarySurface,
                    shape: BoxShape.circle,
                    border: Border.all(color: AppColors.primaryLight, width: 2),
                  ),
                  child: const Center(
                    child: Icon(Icons.check_circle_rounded, color: AppColors.primary, size: 54),
                  ),
                ),
                const SizedBox(height: 24),

                Text('Order Placed Successfully!', style: AppTextStyles.h1.copyWith(fontSize: 24)),
                const SizedBox(height: 8),
                Text(
                  'Thank you for shopping fresh! We are currently preparing your grocery basket.',
                  style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 28),

                // Order Info Card
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: AppColors.background,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Column(
                    children: [
                      _buildRow('Order Number', order.orderNumber, isBold: true),
                      const Divider(color: AppColors.divider, height: 20),
                      _buildRow(
                        'Fulfillment',
                        order.deliveryType == 'PICKUP' ? 'Store Pickup' : 'Home Delivery',
                      ),
                      const SizedBox(height: 8),
                      if (order.deliverySlot != null) ...[
                        _buildRow(
                          'Delivery Window',
                          '${order.deliverySlot!.displayDate} (${order.deliverySlot!.displayWindow})',
                        ),
                        const SizedBox(height: 8),
                      ],
                      _buildRow('Items Ordered', '${order.totalItemCount} items'),
                      const Divider(color: AppColors.divider, height: 20),
                      _buildRow(
                        'Total Paid',
                        CurrencyFormatter.format(order.totalAmount),
                        isPrimary: true,
                      ),
                    ],
                  ),
                ),

                const Spacer(),

                // Actions
                CustomButton(
                  text: 'Track Order',
                  icon: Icons.navigation_rounded,
                  onPressed: () {
                    context.go('/orders/${order.id}');
                  },
                ),
                const SizedBox(height: 12),
                CustomButton(
                  text: 'Continue Shopping',
                  isOutlined: true,
                  onPressed: () => context.go('/home'),
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildRow(String label, String value, {bool isBold = false, bool isPrimary = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textTertiary)),
        Text(
          value,
          style: AppTextStyles.bodyMedium.copyWith(
            fontWeight: isBold || isPrimary ? FontWeight.w700 : FontWeight.w600,
            color: isPrimary ? AppColors.primaryDark : AppColors.textPrimary,
          ),
        ),
      ],
    );
  }
}
