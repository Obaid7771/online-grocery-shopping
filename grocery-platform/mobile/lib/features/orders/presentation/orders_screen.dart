import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../shared/models/order_model.dart';
import '../../../shared/widgets/empty_state_view.dart';
import '../../../shared/widgets/error_state_view.dart';
import '../../../shared/widgets/responsive_wrapper.dart';
import '../providers/orders_provider.dart';

class OrdersScreen extends ConsumerWidget {
  const OrdersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final activeFilter = ref.watch(ordersFilterProvider);
    final ordersAsync = ref.watch(userOrdersProvider);
    final horizontalPadding = ResponsiveWrapper.getHorizontalPadding(context);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('My Orders', style: AppTextStyles.h2.copyWith(fontSize: 20)),
        centerTitle: false,
      ),
      body: Column(
        children: [
          // Filter Chips
          SizedBox(
            height: 48,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
              children: [
                _buildFilterChip(ref, label: 'All', value: null, current: activeFilter),
                _buildFilterChip(ref, label: 'Confirmed', value: 'CONFIRMED', current: activeFilter),
                _buildFilterChip(ref, label: 'Preparing', value: 'PREPARING', current: activeFilter),
                _buildFilterChip(ref, label: 'Out for Delivery', value: 'OUT_FOR_DELIVERY', current: activeFilter),
                _buildFilterChip(ref, label: 'Delivered', value: 'DELIVERED', current: activeFilter),
                _buildFilterChip(ref, label: 'Cancelled', value: 'CANCELLED', current: activeFilter),
              ],
            ),
          ),
          const SizedBox(height: 8),

          // Orders List
          Expanded(
            child: ordersAsync.when(
              data: (orders) {
                if (orders.isEmpty) {
                  return Padding(
                    padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
                    child: EmptyStateView(
                      icon: Icons.receipt_long_outlined,
                      title: 'No Orders Found',
                      description: activeFilter == null
                          ? 'You haven\'t placed any orders yet. Fresh groceries are waiting!'
                          : 'No orders found matching the selected status filter.',
                      buttonText: 'Start Shopping',
                      onButtonPressed: () => context.go('/home'),
                    ),
                  );
                }

                return RefreshIndicator(
                  color: AppColors.primary,
                  onRefresh: () async {
                    ref.invalidate(userOrdersProvider);
                  },
                  child: ListView.separated(
                    padding: EdgeInsets.symmetric(horizontal: horizontalPadding, vertical: 16),
                    itemCount: orders.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 14),
                    itemBuilder: (context, index) {
                      final order = orders[index];
                      return _OrderCard(order: order);
                    },
                  ),
                );
              },
              loading: () => const Center(
                child: CircularProgressIndicator(color: AppColors.primary),
              ),
              error: (e, _) => ErrorStateView(
                errorMessage: e.toString(),
                onRetry: () => ref.invalidate(userOrdersProvider),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(
    WidgetRef ref, {
    required String label,
    required String? value,
    required String? current,
  }) {
    final isSelected = value == current;

    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(label),
        selected: isSelected,
        selectedColor: AppColors.primarySurface,
        checkmarkColor: AppColors.primary,
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: BorderSide(
            color: isSelected ? AppColors.primary : AppColors.border,
          ),
        ),
        labelStyle: AppTextStyles.bodySmall.copyWith(
          color: isSelected ? AppColors.primaryDark : AppColors.textPrimary,
          fontWeight: isSelected ? FontWeight.w700 : FontWeight.normal,
        ),
        onSelected: (_) {
          ref.read(ordersFilterProvider.notifier).state = value;
        },
      ),
    );
  }
}

class _OrderCard extends StatelessWidget {
  final OrderModel order;

  const _OrderCard({required this.order});

  Color _getStatusColor(OrderStatus status) {
    switch (status) {
      case OrderStatus.pendingPayment:
        return AppColors.secondary;
      case OrderStatus.paid:
      case OrderStatus.confirmed:
      case OrderStatus.preparing:
        return AppColors.primaryDark;
      case OrderStatus.readyForPickup:
      case OrderStatus.outForDelivery:
        return Colors.blue;
      case OrderStatus.delivered:
        return AppColors.success;
      case OrderStatus.cancelled:
      case OrderStatus.refunded:
        return AppColors.error;
    }
  }

  @override
  Widget build(BuildContext context) {
    final statusColor = _getStatusColor(order.status);

    return InkWell(
      onTap: () => context.push('/orders/${order.id}'),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.02),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Bar: Order ID, Date & Status Pill
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      order.orderNumber,
                      style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      DateFormat('MMM d, yyyy • h:mm a').format(order.createdAt),
                      style: AppTextStyles.bodySmall.copyWith(color: AppColors.textTertiary),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    order.status.displayName,
                    style: AppTextStyles.bodySmall.copyWith(
                      color: statusColor,
                      fontWeight: FontWeight.w700,
                      fontSize: 11,
                    ),
                  ),
                ),
              ],
            ),
            const Divider(color: AppColors.divider, height: 20),

            // Item Thumbnails & Item count
            Row(
              children: [
                ...order.items.take(3).map((item) {
                  return Container(
                    width: 44,
                    height: 44,
                    margin: const EdgeInsets.only(right: 8),
                    decoration: BoxDecoration(
                      color: AppColors.primarySurface,
                      borderRadius: BorderRadius.circular(8),
                      image: item.imageUrl != null
                          ? DecorationImage(
                              image: NetworkImage(item.imageUrl!),
                              fit: BoxFit.cover,
                            )
                          : null,
                    ),
                    child: item.imageUrl == null
                        ? const Icon(Icons.fastfood_rounded, color: AppColors.primary, size: 20)
                        : null,
                  );
                }),
                if (order.items.length > 3) ...[
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: AppColors.background,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Center(
                      child: Text(
                        '+${order.items.length - 3}',
                        style: AppTextStyles.bodySmall.copyWith(fontWeight: FontWeight.w700),
                      ),
                    ),
                  ),
                ],
                const Spacer(),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text('${order.totalItemCount} items', style: AppTextStyles.bodySmall),
                    const SizedBox(height: 2),
                    Text(
                      CurrencyFormatter.format(order.totalAmount),
                      style: AppTextStyles.h3.copyWith(color: AppColors.primaryDark),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Action Row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  order.deliveryType == 'PICKUP' ? 'Store Pickup' : 'Home Delivery',
                  style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary),
                ),
                Row(
                  children: [
                    Text(
                      'View Details',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const Icon(Icons.chevron_right_rounded, color: AppColors.primary, size: 18),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
