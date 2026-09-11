import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../shared/models/order_model.dart';
import '../providers/tracking_provider.dart';
import '../providers/orders_provider.dart';

class LiveTrackingScreen extends ConsumerWidget {
  final String orderId;

  const LiveTrackingScreen({
    super.key,
    required this.orderId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final trackingStreamAsync = ref.watch(orderLiveTrackingProvider(orderId));
    final orderAsync = ref.watch(orderDetailProvider(orderId));

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text('Live Order Tracking', style: AppTextStyles.h2.copyWith(fontSize: 18)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => context.pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () {
              ref.invalidate(orderLiveTrackingProvider(orderId));
              ref.invalidate(orderDetailProvider(orderId));
            },
          ),
        ],
      ),
      body: orderAsync.when(
        data: (order) {
          final trackingData = trackingStreamAsync.value;
          final isDelivered = (trackingData?.status ?? order.status) == OrderStatus.delivered;
          final remainingMinutes = trackingData?.estimatedMinutes ?? 18;

          return Column(
            children: [
              // Simulated Interactive Delivery Map View
              Expanded(
                flex: 5,
                child: Container(
                  width: double.infinity,
                  color: const Color(0xFFE8ECEF),
                  child: Stack(
                    children: [
                      // Map Background Grid & Street Lines
                      CustomPaint(
                        size: Size.infinite,
                        painter: _MapGridPainter(),
                      ),

                      // Destination Pin (Customer Home)
                      const Positioned(
                        top: 70,
                        right: 60,
                        child: _MapPin(
                          icon: Icons.home_rounded,
                          label: 'Delivery Address',
                          color: AppColors.primary,
                        ),
                      ),

                      // Origin Pin (FreshCart Hub)
                      const Positioned(
                        bottom: 80,
                        left: 50,
                        child: _MapPin(
                          icon: Icons.storefront_rounded,
                          label: 'FreshCart Fulfillment',
                          color: AppColors.secondary,
                        ),
                      ),

                      // Moving Delivery Vehicle Icon
                      AnimatedPositioned(
                        duration: const Duration(milliseconds: 1200),
                        curve: Curves.easeInOut,
                        bottom: isDelivered ? 250 : 130 + (18 - remainingMinutes) * 7.0,
                        left: isDelivered ? 240 : 80 + (18 - remainingMinutes) * 11.0,
                        child: Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.18),
                                blurRadius: 10,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: const Icon(
                            Icons.delivery_dining_rounded,
                            color: AppColors.primaryDark,
                            size: 28,
                          ),
                        ),
                      ),

                      // Floating ETA Card
                      Positioned(
                        top: 16,
                        left: 16,
                        right: 16,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(14),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.08),
                                blurRadius: 12,
                                offset: const Offset(0, 3),
                              ),
                            ],
                          ),
                          child: Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(10),
                                decoration: const BoxDecoration(
                                  color: AppColors.primarySurface,
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.timer_rounded, color: AppColors.primary),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      isDelivered
                                          ? 'Delivered to Door'
                                          : 'Estimated Arrival in $remainingMinutes mins',
                                      style: AppTextStyles.h3.copyWith(fontSize: 16),
                                    ),
                                    Text(
                                      order.deliverySlot != null
                                          ? 'Window: ${order.deliverySlot!.displayWindow}'
                                          : 'Priority Delivery',
                                      style: AppTextStyles.bodySmall,
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Bottom Tracking Details Sheet
              Expanded(
                flex: 4,
                child: Container(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black12,
                        blurRadius: 16,
                        offset: Offset(0, -4),
                      ),
                    ],
                  ),
                  child: ListView(
                    children: [
                      // Driver Info Card
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.background,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Row(
                          children: [
                            const CircleAvatar(
                              radius: 24,
                              backgroundColor: AppColors.primarySurface,
                              child: Icon(Icons.person_rounded, color: AppColors.primary),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Text(
                                        'Carlos M.',
                                        style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w700),
                                      ),
                                      const SizedBox(width: 6),
                                      const Icon(Icons.star_rounded, size: 16, color: AppColors.secondary),
                                      Text(' 4.9', style: AppTextStyles.bodySmall.copyWith(fontWeight: FontWeight.w700)),
                                    ],
                                  ),
                                  Text(
                                    'Delivery Specialist • Toyota Prius (7XYZ89)',
                                    style: AppTextStyles.bodySmall.copyWith(fontSize: 11),
                                  ),
                                ],
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.phone_in_talk_rounded, color: AppColors.primary),
                              onPressed: () {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Calling delivery driver Carlos...')),
                                );
                              },
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Status Progression
                      Text('Order Status', style: AppTextStyles.h3.copyWith(fontSize: 16)),
                      const SizedBox(height: 12),
                      _buildMilestone(
                        title: 'Order Confirmed',
                        subtitle: 'Inventory reserved & payment authorized',
                        isDone: true,
                        isCurrent: false,
                      ),
                      _buildMilestone(
                        title: 'Packed & Quality Inspected',
                        subtitle: 'Organics and dairy stored in cooler bags',
                        isDone: true,
                        isCurrent: false,
                      ),
                      _buildMilestone(
                        title: 'Out for Delivery',
                        subtitle: 'Driver has picked up and is en route',
                        isDone: !isDelivered,
                        isCurrent: !isDelivered,
                      ),
                      _buildMilestone(
                        title: 'Delivered',
                        subtitle: 'Groceries safely handed over to you',
                        isDone: isDelivered,
                        isCurrent: isDelivered,
                        isLast: true,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.primary)),
        error: (e, _) => Center(child: Text('Error loading order: $e')),
      ),
    );
  }

  Widget _buildMilestone({
    required String title,
    required String subtitle,
    required bool isDone,
    required bool isCurrent,
    bool isLast = false,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            CircleAvatar(
              radius: 10,
              backgroundColor: isDone
                  ? AppColors.primary
                  : (isCurrent ? AppColors.secondary : AppColors.divider),
              child: isDone
                  ? const Icon(Icons.check, size: 12, color: Colors.white)
                  : (isCurrent
                      ? const Icon(Icons.circle, size: 6, color: Colors.white)
                      : const SizedBox.shrink()),
            ),
            if (!isLast)
              Container(
                width: 2,
                height: 32,
                color: isDone ? AppColors.primary : AppColors.divider,
              ),
          ],
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: AppTextStyles.bodyMedium.copyWith(
                  fontWeight: isCurrent || isDone ? FontWeight.w700 : FontWeight.normal,
                  color: isCurrent || isDone ? AppColors.textPrimary : AppColors.textTertiary,
                ),
              ),
              Text(
                subtitle,
                style: AppTextStyles.bodySmall.copyWith(fontSize: 11),
              ),
              const SizedBox(height: 10),
            ],
          ),
        ),
      ],
    );
  }
}

class _MapPin extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;

  const _MapPin({
    required this.icon,
    required this.label,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
            boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 6)],
          ),
          child: Icon(icon, color: Colors.white, size: 20),
        ),
        const SizedBox(height: 4),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(4),
          ),
          child: Text(
            label,
            style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
          ),
        ),
      ],
    );
  }
}

class _MapGridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withOpacity(0.6)
      ..strokeWidth = 6.0;

    // Simulated street lines
    canvas.drawLine(const Offset(0, 100), Offset(size.width, 140), paint);
    canvas.drawLine(const Offset(40, 0), Offset(100, size.height), paint);
    canvas.drawLine(const Offset(220, 0), Offset(200, size.height), paint);
    canvas.drawLine(const Offset(0, 240), Offset(size.width, 220), paint);

    final routePaint = Paint()
      ..color = AppColors.primary.withOpacity(0.35)
      ..strokeWidth = 5.0
      ..strokeCap = StrokeCap.round;

    // Delivery route line
    canvas.drawLine(
      Offset(80, size.height - 110),
      Offset(size.width - 90, 100),
      routePaint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
