import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../shared/models/order_model.dart';
import 'order_service.dart';

class LiveTrackingData {
  final OrderStatus status;
  final String displayName;
  final double? driverLat;
  final double? driverLng;
  final double? bearing;
  final int? estimatedMinutes;

  LiveTrackingData({
    required this.status,
    required this.displayName,
    this.driverLat,
    this.driverLng,
    this.bearing,
    this.estimatedMinutes,
  });

  factory LiveTrackingData.fromOrder(OrderModel order) {
    return LiveTrackingData(
      status: order.status,
      displayName: order.status.displayName,
      driverLat: 37.7749,
      driverLng: -122.4194,
      bearing: 45,
      estimatedMinutes: order.status == OrderStatus.outForDelivery ? 12 : 25,
    );
  }
}

final trackingServiceProvider = Provider<TrackingService>((ref) {
  final orderService = ref.watch(orderServiceProvider);
  return TrackingService(orderService);
});

class TrackingService {
  final OrderService _orderService;

  TrackingService(this._orderService);

  /// Streams real-time order tracking status and simulated driver coordinates.
  Stream<LiveTrackingData> streamOrderTracking(String orderId) async* {
    // Initial fetch
    final initialOrder = await _orderService.getOrderById(orderId);
    yield LiveTrackingData.fromOrder(initialOrder);

    // Periodic telemetry polling & driver progression
    int remainingMinutes = initialOrder.status == OrderStatus.outForDelivery ? 14 : 25;
    double lat = 37.7749;
    double lng = -122.4194;

    while (true) {
      await Future.delayed(const Duration(seconds: 4));

      try {
        final order = await _orderService.getOrderById(orderId);
        if (remainingMinutes > 1 && order.status == OrderStatus.outForDelivery) {
          remainingMinutes -= 1;
          lat += 0.0008;
          lng += 0.0006;
        }

        yield LiveTrackingData(
          status: order.status,
          displayName: order.status.displayName,
          driverLat: lat,
          driverLng: lng,
          bearing: 55,
          estimatedMinutes: remainingMinutes,
        );

        if (order.status == OrderStatus.delivered ||
            order.status == OrderStatus.cancelled ||
            order.status == OrderStatus.refunded) {
          break;
        }
      } catch (_) {
        // Retry silently
      }
    }
  }
}
