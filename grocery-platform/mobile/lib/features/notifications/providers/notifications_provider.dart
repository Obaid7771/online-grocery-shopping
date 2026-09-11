import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../services/notification_service.dart';

final notificationsProvider =
    FutureProvider.autoDispose<NotificationResponse>((ref) async {
  final service = ref.watch(notificationServiceProvider);
  return service.getNotifications();
});

class NotificationNotifier extends StateNotifier<AsyncValue<void>> {
  final Ref _ref;

  NotificationNotifier(this._ref) : super(const AsyncValue.data(null));

  Future<void> markRead(String id) async {
    state = const AsyncValue.loading();
    try {
      await _ref.read(notificationServiceProvider).markAsRead(id);
      _ref.invalidate(notificationsProvider);
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> markAllRead() async {
    state = const AsyncValue.loading();
    try {
      await _ref.read(notificationServiceProvider).markAllAsRead();
      _ref.invalidate(notificationsProvider);
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

final notificationActionProvider =
    StateNotifierProvider<NotificationNotifier, AsyncValue<void>>((ref) {
  return NotificationNotifier(ref);
});
