import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../../../../shared/models/cart_model.dart';
import '../../providers/cart_provider.dart';

class CartSummaryCard extends ConsumerStatefulWidget {
  final CartModel cart;

  const CartSummaryCard({
    super.key,
    required this.cart,
  });

  @override
  ConsumerState<CartSummaryCard> createState() => _CartSummaryCardState();
}

class _CartSummaryCardState extends ConsumerState<CartSummaryCard> {
  final _couponController = TextEditingController();
  bool _isApplying = false;

  @override
  void dispose() {
    _couponController.dispose();
    super.dispose();
  }

  void _applyCoupon() {
    final code = _couponController.text.trim().toUpperCase();
    if (code.isEmpty) return;

    setState(() => _isApplying = true);

    // Validate coupon code (FRESH20)
    if (code == 'FRESH20') {
      final discount = widget.cart.subtotal * 0.20;
      ref.read(cartProvider.notifier).applyCoupon('FRESH20', discount);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Coupon FRESH20 applied: 20% discount!'),
          backgroundColor: AppColors.success,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Invalid or expired coupon code'),
          backgroundColor: AppColors.error,
        ),
      );
    }

    setState(() => _isApplying = false);
  }

  @override
  Widget build(BuildContext context) {
    final cart = widget.cart;

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
          // Promo Code Input
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _couponController,
                  textCapitalization: TextCapitalization.characters,
                  decoration: InputDecoration(
                    hintText: 'Enter Promo Code (e.g. FRESH20)',
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    prefixIcon: const Icon(Icons.local_offer_outlined, color: AppColors.primary, size: 20),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              ElevatedButton(
                onPressed: _isApplying ? null : _applyCoupon,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primarySurface,
                  foregroundColor: AppColors.primaryDark,
                  minimumSize: const Size(80, 48),
                  elevation: 0,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('Apply', style: TextStyle(fontWeight: FontWeight.w700)),
              ),
            ],
          ),

          if (cart.couponCode != null) ...[
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: AppColors.primarySurface,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Coupon ${cart.couponCode} applied',
                    style: AppTextStyles.bodySmall.copyWith(
                      color: AppColors.primaryDark,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  GestureDetector(
                    onTap: () {
                      ref.read(cartProvider.notifier).removeCoupon();
                      _couponController.clear();
                    },
                    child: const Icon(Icons.close, size: 16, color: AppColors.primaryDark),
                  ),
                ],
              ),
            ),
          ],

          const SizedBox(height: 16),
          const Divider(color: AppColors.divider),
          const SizedBox(height: 12),

          // Bill Breakdown
          _buildRow('Subtotal', CurrencyFormatter.format(cart.subtotal)),
          const SizedBox(height: 8),

          _buildRow(
            'Delivery Fee',
            cart.calculatedDeliveryFee == 0
                ? 'FREE'
                : CurrencyFormatter.format(cart.calculatedDeliveryFee),
            isFree: cart.calculatedDeliveryFee == 0,
          ),
          const SizedBox(height: 8),

          if (cart.discountAmount > 0) ...[
            _buildRow(
              'Coupon Discount',
              '-${CurrencyFormatter.format(cart.discountAmount)}',
              isDiscount: true,
            ),
            const SizedBox(height: 8),
          ],

          _buildRow('Estimated Tax', CurrencyFormatter.format(cart.taxAmount)),
          const SizedBox(height: 12),
          const Divider(color: AppColors.divider),
          const SizedBox(height: 8),

          // Total Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Total Amount', style: AppTextStyles.h3),
              Text(
                CurrencyFormatter.format(cart.total),
                style: AppTextStyles.h2.copyWith(color: AppColors.primaryDark),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildRow(String label, String value, {bool isDiscount = false, bool isFree = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: AppTextStyles.bodyMedium),
        Text(
          value,
          style: AppTextStyles.bodyMedium.copyWith(
            fontWeight: FontWeight.w600,
            color: isFree || isDiscount ? AppColors.primaryDark : AppColors.textPrimary,
          ),
        ),
      ],
    );
  }
}
