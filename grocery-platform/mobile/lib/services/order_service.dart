import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/constants/api_constants.dart';
import '../core/network/api_client.dart';
import '../shared/models/order_model.dart';

final orderServiceProvider = Provider<OrderService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return OrderService(apiClient);
});

class OrderService {
  final ApiClient _apiClient;

  OrderService(this._apiClient);

  Future<OrderModel> createOrder({
    required String deliveryType,
    String? addressId,
    String? deliverySlotId,
    String? notes,
    String? couponCode,
    required String paymentMethod,
    required List<Map<String, dynamic>> items,
  }) async {
    final response = await _apiClient.post(
      ApiConstants.orders,
      data: {
        'deliveryType': deliveryType,
        if (addressId != null) 'addressId': addressId,
        if (deliverySlotId != null) 'deliverySlotId': deliverySlotId,
        if (notes != null && notes.isNotEmpty) 'notes': notes,
        if (couponCode != null && couponCode.isNotEmpty) 'couponCode': couponCode,
        'paymentMethod': paymentMethod,
        'items': items,
      },
    );

    final data = response is Map<String, dynamic> && response['data'] != null
        ? response['data']
        : response;

    return OrderModel.fromJson(data as Map<String, dynamic>);
  }

  Future<List<OrderModel>> getMyOrders({String? status, int page = 1, int limit = 10}) async {
    final query = <String, dynamic>{'page': page, 'limit': limit};
    if (status != null) query['status'] = status;

    final response = await _apiClient.get(
      ApiConstants.myOrders,
      queryParameters: query,
    );

    List list = [];
    if (response is Map<String, dynamic> && response['data'] is List) {
      list = response['data'];
    } else if (response is List) {
      list = response;
    }

    return list.map((e) => OrderModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<OrderModel> getOrderById(String id) async {
    final response = await _apiClient.get('${ApiConstants.orders}/$id');

    final data = response is Map<String, dynamic> && response['data'] != null
        ? response['data']
        : response;

    return OrderModel.fromJson(data as Map<String, dynamic>);
  }

  Future<OrderModel> cancelOrder(String id, String reason) async {
    final response = await _apiClient.post(
      '${ApiConstants.orders}/$id/cancel',
      data: {'cancelReason': reason},
    );

    final data = response is Map<String, dynamic> && response['data'] != null
        ? response['data']
        : response;

    return OrderModel.fromJson(data as Map<String, dynamic>);
  }
}
