import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/constants/api_constants.dart';
import '../core/network/api_client.dart';
import '../shared/models/delivery_slot_model.dart';

final deliveryServiceProvider = Provider<DeliveryService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return DeliveryService(apiClient);
});

class DeliveryService {
  final ApiClient _apiClient;

  DeliveryService(this._apiClient);

  Future<List<DeliverySlotModel>> getAvailableSlots({String? date}) async {
    final response = await _apiClient.get(
      ApiConstants.deliverySlots,
      queryParameters: date != null ? {'date': date} : null,
    );

    List list = [];
    if (response is Map<String, dynamic> && response['data'] is List) {
      list = response['data'];
    } else if (response is List) {
      list = response;
    }

    return list
        .map((e) => DeliverySlotModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<Map<String, dynamic>> lookupZone(String postalCode) async {
    final response = await _apiClient.post(
      ApiConstants.deliveryZonesLookup,
      data: {'postalCode': postalCode},
    );

    if (response is Map<String, dynamic> && response['data'] != null) {
      return response['data'] as Map<String, dynamic>;
    }
    return response as Map<String, dynamic>;
  }
}
