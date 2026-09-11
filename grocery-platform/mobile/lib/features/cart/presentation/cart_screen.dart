import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../shared/widgets/custom_button.dart';
import '../../../shared/widgets/empty_state_view.dart';
import '../../../shared/widgets/responsive_wrapper.dart';
import '../providers/cart_provider.dart';
import 'widgets/cart_item_tile.dart';
import 'widgets/cart_summary_card.dart';

class CartScreen extends ConsumerWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cart = ref.watch(cartProvider);
    final horizontalPadding = ResponsiveWrapper.getHorizontalPadding(context);

    if (cart.items.isEmpty) {
      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          title: Text('Your Cart', style: AppTextStyles.h2.copyWith(fontSize: 20)),
          centerTitle: false,
        ),
        body: Padding(
          padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
          child: EmptyStateView(
            icon: Icons.shopping_basket_outlined,
            title: 'Your Basket is Empty',
            description: 'Looks like you haven\'t added any farm-fresh groceries yet.',
            buttonText: 'Start Shopping',
            onButtonPressed: () => context.go('/home'),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          'Your Basket (${cart.totalItemCount} items)',
          style: AppTextStyles.h2.copyWith(fontSize: 20),
        ),
        centerTitle: false,
        actions: [
          TextButton(
            onPressed: () {
              ref.read(cartProvider.notifier).clearCart();
            },
            child: Text(
              'Clear All',
              style: AppTextStyles.bodySmall.copyWith(
                color: AppColors.error,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: EdgeInsets.symmetric(horizontal: horizontalPadding, vertical: 16),
              children: [
                // Free delivery indicator
                if (cart.subtotal < 50.0)
                  Container(
                    margin: const EdgeInsets.only(bottom: 16),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: AppColors.secondaryLight,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.info_outline_rounded, color: AppColors.secondary, size: 20),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            'Add ${CurrencyFormatter.format(50.0 - cart.subtotal)} more to unlock FREE Delivery!',
                            style: AppTextStyles.bodySmall.copyWith(
                              color: Colors.brown[800],
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                // Cart Line Items
                ...cart.items.map(
                  (item) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: CartItemTile(item: item),
                  ),
                ),

                const SizedBox(height: 8),

                // Order Breakdown & Coupon Card
                CartSummaryCard(cart: cart),
                const SizedBox(height: 24),
              ],
            ),
          ),

          // Bottom Checkout Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.06),
                  blurRadius: 10,
                  offset: const Offset(0, -4),
                ),
              ],
            ),
            child: SafeArea(
              child: Row(
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('Total Bill', style: AppTextStyles.bodySmall),
                      Text(
                        CurrencyFormatter.format(cart.total),
                        style: AppTextStyles.h2.copyWith(color: AppColors.primaryDark),
                      ),
                    ],
                  ),
                  const SizedBox(width: 24),
                  Expanded(
                    child: CustomButton(
                      text: 'Proceed to Checkout',
                      icon: Icons.arrow_forward_rounded,
                      onPressed: () {
                        context.push('/checkout');
                      },
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
