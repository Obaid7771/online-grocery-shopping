import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../shared/widgets/empty_state_view.dart';
import '../../../shared/widgets/error_state_view.dart';
import '../../../shared/models/notification_model.dart';
import '../providers/notifications_provider.dart';

class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notificationsAsync = ref.watch(notificationsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Notifications', style: AppTextStyles.h2.copyWith(fontSize: 20)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => context.pop(),
        ),
        actions: [
          TextButton(
            onPressed: () {
              ref.read(notificationActionProvider.notifier).markAllRead();
            },
            child: Text(
              'Mark all read',
              style: AppTextStyles.bodySmall.copyWith(
                color: AppColors.primaryDark,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: notificationsAsync.when(
        data: (response) {
          final list = response.notifications;
          if (list.isEmpty) {
            return EmptyStateView(
              icon: Icons.notifications_none_rounded,
              title: 'No Notifications Yet',
              description: 'You\'re all caught up! Order status updates and promos will appear here.',
              buttonText: 'Shop Groceries',
              onButtonPressed: () => context.go('/home'),
            );
          }

          return RefreshIndicator(
            color: AppColors.primary,
            onRefresh: () async {
              ref.invalidate(notificationsProvider);
            },
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: list.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (context, index) {
                final notification = list[index];
                return _NotificationTile(notification: notification);
              },
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.primary)),
        error: (e, _) => ErrorStateView(
          errorMessage: e.toString(),
          onRetry: () => ref.invalidate(notificationsProvider),
        ),
      ),
    );
  }
}

class _NotificationTile extends ConsumerWidget {
  final NotificationModel notification;

  const _NotificationTile({required this.notification});

  IconData _getIcon(String type) {
    switch (type.toUpperCase()) {
      case 'ORDER_STATUS':
      case 'ORDER_UPDATE':
        return Icons.local_shipping_outlined;
      case 'PAYMENT_SUCCESS':
        return Icons.check_circle_outline_rounded;
      case 'PROMOTION':
        return Icons.local_offer_outlined;
      default:
        return Icons.notifications_outlined;
    }
  }

  Color _getIconColor(String type) {
    switch (type.toUpperCase()) {
      case 'ORDER_STATUS':
      case 'ORDER_UPDATE':
        return AppColors.primary;
      case 'PAYMENT_SUCCESS':
        return AppColors.success;
      case 'PROMOTION':
        return AppColors.secondary;
      default:
        return AppColors.primary;
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final iconColor = _getIconColor(notification.type);

    return InkWell(
      onTap: () {
        if (!notification.isRead) {
          ref.read(notificationActionProvider.notifier).markRead(notification.id);
        }

        // Navigate to associated order if available
        if (notification.data != null && notification.data!['orderId'] != null) {
          context.push('/orders/${notification.data!['orderId']}');
        }
      },
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: notification.isRead ? Colors.white : AppColors.primarySurface.withOpacity(0.5),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: notification.isRead ? AppColors.border : AppColors.primaryLight,
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: iconColor.withOpacity(0.12),
                shape: BoxShape.circle,
              ),
              child: Icon(_getIcon(notification.type), color: iconColor, size: 22),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          notification.title,
                          style: AppTextStyles.bodyMedium.copyWith(
                            fontWeight: notification.isRead ? FontWeight.w600 : FontWeight.w800,
                          ),
                        ),
                      ),
                      Text(
                        notification.timeAgo,
                        style: AppTextStyles.bodySmall.copyWith(fontSize: 11),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    notification.body,
                    style: AppTextStyles.bodySmall.copyWith(
                      color: notification.isRead ? AppColors.textSecondary : AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
            ),
            if (!notification.isRead) ...[
              const SizedBox(width: 6),
              Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  color: AppColors.primary,
                  shape: BoxShape.circle,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
