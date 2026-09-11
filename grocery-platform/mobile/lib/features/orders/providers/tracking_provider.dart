import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../services/tracking_service.dart';

final orderLiveTrackingProvider =
    StreamProvider.family.autoDispose<LiveTrackingData, String>((ref, orderId) {
  final service = ref.watch(trackingServiceProvider);
  return service.streamOrderTracking(orderId);
});
