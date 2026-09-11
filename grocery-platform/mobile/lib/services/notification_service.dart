import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/constants/api_constants.dart';
import '../core/network/api_client.dart';
import '../shared/models/notification_model.dart';

final notificationServiceProvider = Provider<NotificationService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return NotificationService(apiClient);
});

class NotificationResponse {
  final List<NotificationModel> notifications;
  final int unreadCount;

  NotificationResponse({
    required this.notifications,
    required this.unreadCount,
  });
}

class NotificationService {
  final ApiClient _apiClient;

  NotificationService(this._apiClient);

  Future<NotificationResponse> getNotifications({int page = 1, int limit = 20}) async {
    final response = await _apiClient.get(
      ApiConstants.notifications,
      queryParameters: {'page': page, 'limit': limit},
    );

    final data = response is Map<String, dynamic> ? response : <String, dynamic>{};
    final list = (data['data'] as List?) ?? [];
    final unreadCount = data['unreadCount'] as int? ?? 0;

    return NotificationResponse(
      notifications: list.map((e) => NotificationModel.fromJson(e as Map<String, dynamic>)).toList(),
      unreadCount: unreadCount,
    );
  }

  Future<void> markAsRead(String id) async {
    await _apiClient.patch('${ApiConstants.notifications}/$id/read');
  }

  Future<void> markAllAsRead() async {
    await _apiClient.patch(ApiConstants.readAllNotifications);
  }

  Future<void> registerFcmToken(String token, {String deviceType = 'mobile'}) async {
    await _apiClient.post(
      ApiConstants.fcmToken,
      data: {'fcmToken': token, 'deviceType': deviceType},
    );
  }
}
