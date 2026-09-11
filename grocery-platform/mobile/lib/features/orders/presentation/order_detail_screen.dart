import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../shared/models/order_model.dart';
import '../../../shared/widgets/error_state_view.dart';
import '../../../shared/widgets/responsive_wrapper.dart';
import '../../../services/order_service.dart';
import '../providers/orders_provider.dart';

class OrderDetailScreen extends ConsumerStatefulWidget {
  final String orderId;

  const OrderDetailScreen({
    super.key,
    required this.orderId,
  });

  @override
  ConsumerState<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends ConsumerState<OrderDetailScreen> {
  bool _isCancelling = false;

  void _confirmCancelOrder(BuildContext context, OrderModel order) {
    final reasonController = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Cancel Order'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Are you sure you want to cancel this order? Any payments will be refunded.'),
            const SizedBox(height: 12),
            TextField(
              controller: reasonController,
              decoration: const InputDecoration(
                hintText: 'Reason for cancellation (optional)',
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Keep Order'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(ctx);
              setState(() => _isCancelling = true);
              try {
                final reason = reasonController.text.trim().isEmpty
                    ? 'Customer cancellation'
                    : reasonController.text.trim();
                await ref.read(orderServiceProvider).cancelOrder(order.id, reason);
                ref.invalidate(orderDetailProvider(widget.orderId));
                ref.invalidate(userOrdersProvider);
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Order cancelled successfully'),
                      backgroundColor: AppColors.error,
                    ),
                  );
                }
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Failed to cancel: $e')),
                  );
                }
              } finally {
                if (mounted) setState(() => _isCancelling = false);
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            child: const Text('Cancel Order'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final orderAsync = ref.watch(orderDetailProvider(widget.orderId));
    final horizontalPadding = ResponsiveWrapper.getHorizontalPadding(context);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Order Details', style: AppTextStyles.h2.copyWith(fontSize: 20)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () {
            if (context.canPop()) {
              context.pop();
            } else {
              context.go('/orders');
            }
          },
        ),
      ),
      body: orderAsync.when(
        data: (order) => ListView(
          padding: EdgeInsets.symmetric(horizontal: horizontalPadding, vertical: 16),
          children: [
            // Status Header & Progress Stepper
            _buildStatusHeader(order),
            const SizedBox(height: 16),

            // Order Fulfillment & Address Info
            _buildDeliveryInfoCard(order),
            const SizedBox(height: 16),

            // Items Purchased
            _buildItemsCard(order),
            const SizedBox(height: 16),

            // Bill & Payment Summary
            _buildPaymentCard(order),
            const SizedBox(height: 24),

            // Live tracking CTA — only for active deliveries
            if (order.status == OrderStatus.outForDelivery) ...[
              ElevatedButton.icon(
                onPressed: () => context.push('/orders/${order.id}/track'),
                icon: const Icon(Icons.navigation_rounded),
                label: const Text('Track Live Delivery'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  minimumSize: const Size.fromHeight(50),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
              const SizedBox(height: 12),
            ],

            // Cancel Order Action if allowed
            if (order.status.isCancellable) ...[
              OutlinedButton(
                onPressed: _isCancelling ? null : () => _confirmCancelOrder(context, order),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AppColors.error),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: _isCancelling
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(color: AppColors.error, strokeWidth: 2),
                      )
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.cancel_outlined, color: AppColors.error, size: 20),
                          const SizedBox(width: 8),
                          Text(
                            'Cancel Order',
                            style: AppTextStyles.button.copyWith(color: AppColors.error),
                          ),
                        ],
                      ),
              ),
              const SizedBox(height: 20),
            ],
          ],
        ),
        loading: () => const Center(
          child: CircularProgressIndicator(color: AppColors.primary),
        ),
        error: (e, _) => ErrorStateView(
          errorMessage: e.toString(),
          onRetry: () => ref.invalidate(orderDetailProvider(widget.orderId)),
        ),
      ),
    );
  }

  Widget _buildStatusHeader(OrderModel order) {
    final stepIndex = order.status.stepIndex;
    final isCancelled = order.status == OrderStatus.cancelled || order.status == OrderStatus.refunded;

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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(order.orderNumber, style: AppTextStyles.h2.copyWith(fontSize: 18)),
              Text(
                order.status.displayName,
                style: AppTextStyles.bodyMedium.copyWith(
                  fontWeight: FontWeight.w700,
                  color: isCancelled ? AppColors.error : AppColors.primaryDark,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            'Placed on ${DateFormat('MMMM d, yyyy • h:mm a').format(order.createdAt)}',
            style: AppTextStyles.bodySmall.copyWith(color: AppColors.textTertiary),
          ),
          const SizedBox(height: 20),

          if (!isCancelled) ...[
            Row(
              children: [
                _buildStepNode(title: 'Confirmed', isCompleted: stepIndex >= 1, isActive: stepIndex == 1),
                _buildStepLine(isCompleted: stepIndex >= 2),
                _buildStepNode(title: 'Packing', isCompleted: stepIndex >= 2, isActive: stepIndex == 2),
                _buildStepLine(isCompleted: stepIndex >= 3),
                _buildStepNode(title: 'Out / Ready', isCompleted: stepIndex >= 3, isActive: stepIndex == 3),
                _buildStepLine(isCompleted: stepIndex >= 4),
                _buildStepNode(title: 'Delivered', isCompleted: stepIndex >= 4, isActive: stepIndex == 4),
              ],
            ),
          ] else ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.errorLight,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                children: [
                  const Icon(Icons.info_rounded, color: AppColors.error),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'This order has been cancelled/refunded.',
                      style: AppTextStyles.bodySmall.copyWith(color: AppColors.error, fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildStepNode({required String title, required bool isCompleted, required bool isActive}) {
    return Expanded(
      child: Column(
        children: [
          CircleAvatar(
            radius: 12,
            backgroundColor: isCompleted
                ? AppColors.primary
                : (isActive ? AppColors.primarySurface : AppColors.divider),
            child: isCompleted
                ? const Icon(Icons.check, size: 14, color: Colors.white)
                : (isActive
                    ? const Icon(Icons.circle, size: 8, color: AppColors.primary)
                    : const SizedBox.shrink()),
          ),
          const SizedBox(height: 6),
          Text(
            title,
            style: AppTextStyles.bodySmall.copyWith(
              fontSize: 10,
              fontWeight: isCompleted || isActive ? FontWeight.w700 : FontWeight.normal,
              color: isCompleted || isActive ? AppColors.textPrimary : AppColors.textTertiary,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildStepLine({required bool isCompleted}) {
    return Container(
      width: 20,
      height: 2,
      margin: const EdgeInsets.only(bottom: 20),
      color: isCompleted ? AppColors.primary : AppColors.divider,
    );
  }

  Widget _buildDeliveryInfoCard(OrderModel order) {
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
          Text('Delivery & Schedule', style: AppTextStyles.h3.copyWith(fontSize: 16)),
          const SizedBox(height: 12),
          if (order.deliverySlot != null) ...[
            Row(
              children: [
                const Icon(Icons.access_time_rounded, color: AppColors.primary, size: 20),
                const SizedBox(width: 8),
                Text(
                  '${order.deliverySlot!.displayDate} (${order.deliverySlot!.displayWindow})',
                  style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600),
                ),
              ],
            ),
            const SizedBox(height: 10),
          ],
          if (order.address != null) ...[
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.location_on_outlined, color: AppColors.primary, size: 20),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${order.address!.recipientName} (${order.address!.phone})',
                        style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600),
                      ),
                      Text(order.address!.formattedAddress, style: AppTextStyles.bodySmall),
                    ],
                  ),
                ),
              ],
            ),
          ] else ...[
            Row(
              children: [
                const Icon(Icons.storefront_rounded, color: AppColors.primary, size: 20),
                const SizedBox(width: 8),
                Text('Store Pickup at Central Hub', style: AppTextStyles.bodyMedium),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildItemsCard(OrderModel order) {
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
          Text('Items Ordered (${order.totalItemCount})', style: AppTextStyles.h3.copyWith(fontSize: 16)),
          const SizedBox(height: 12),
          ...order.items.map((item) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Row(
                children: [
                  Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      color: AppColors.primarySurface,
                      borderRadius: BorderRadius.circular(8),
                      image: item.imageUrl != null
                          ? DecorationImage(image: NetworkImage(item.imageUrl!), fit: BoxFit.cover)
                          : null,
                    ),
                    child: item.imageUrl == null
                        ? const Icon(Icons.fastfood_rounded, color: AppColors.primary, size: 18)
                        : null,
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(item.productName, style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600)),
                        Text('${item.quantity} x ${CurrencyFormatter.format(item.unitPrice)}', style: AppTextStyles.bodySmall),
                      ],
                    ),
                  ),
                  Text(CurrencyFormatter.format(item.totalPrice), style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w700)),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildPaymentCard(OrderModel order) {
    final payment = order.payments.isNotEmpty ? order.payments.first : null;

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
          Text('Payment & Breakdown', style: AppTextStyles.h3.copyWith(fontSize: 16)),
          const SizedBox(height: 12),
          _buildRow('Payment Method', payment?.method.displayName ?? 'Stripe'),
          const SizedBox(height: 8),
          _buildRow('Subtotal', CurrencyFormatter.format(order.subtotal)),
          const SizedBox(height: 8),
          _buildRow('Delivery Fee', order.deliveryFee == 0 ? 'FREE' : CurrencyFormatter.format(order.deliveryFee)),
          if (order.discountAmount > 0) ...[
            const SizedBox(height: 8),
            _buildRow('Discount', '-${CurrencyFormatter.format(order.discountAmount)}', isHighlight: true),
          ],
          const SizedBox(height: 8),
          _buildRow('Taxes', CurrencyFormatter.format(order.taxAmount)),
          const Divider(color: AppColors.divider, height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Total Paid', style: AppTextStyles.h3),
              Text(
                CurrencyFormatter.format(order.totalAmount),
                style: AppTextStyles.h2.copyWith(color: AppColors.primaryDark),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildRow(String label, String value, {bool isHighlight = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary)),
        Text(
          value,
          style: AppTextStyles.bodyMedium.copyWith(
            fontWeight: FontWeight.w600,
            color: isHighlight ? AppColors.primaryDark : AppColors.textPrimary,
          ),
        ),
      ],
    );
  }
}
