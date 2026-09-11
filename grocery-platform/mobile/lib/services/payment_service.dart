import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/constants/api_constants.dart';
import '../core/network/api_client.dart';
import '../shared/models/order_model.dart';

final paymentServiceProvider = Provider<PaymentService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return PaymentService(apiClient);
});

class PaymentService {
  final ApiClient _apiClient;

  PaymentService(this._apiClient);

  Future<Map<String, dynamic>> createPaymentIntent(String orderId, String paymentMethod) async {
    final response = await _apiClient.post(
      ApiConstants.createPaymentIntent,
      data: {
        'orderId': orderId,
        'paymentMethod': paymentMethod,
      },
    );

    if (response is Map<String, dynamic> && response['data'] != null) {
      return response['data'] as Map<String, dynamic>;
    }
    return response as Map<String, dynamic>;
  }

  Future<OrderModel> confirmPayment(String orderId, String paymentIntentId) async {
    final response = await _apiClient.post(
      ApiConstants.confirmPayment,
      data: {
        'orderId': orderId,
        'paymentIntentId': paymentIntentId,
      },
    );

    final data = response is Map<String, dynamic> && response['data'] != null
        ? response['data']
        : response;

    return OrderModel.fromJson(data as Map<String, dynamic>);
  }

  Future<Map<String, dynamic>> createPaypalOrder(String orderId) async {
    final response = await _apiClient.post(
      ApiConstants.createPaypalOrder,
      data: {'orderId': orderId},
    );

    if (response is Map<String, dynamic> && response['data'] != null) {
      return response['data'] as Map<String, dynamic>;
    }
    return response as Map<String, dynamic>;
  }

  Future<OrderModel> capturePaypalOrder(String orderId, String paypalOrderId) async {
    final response = await _apiClient.post(
      ApiConstants.capturePaypalOrder,
      data: {
        'orderId': orderId,
        'paypalOrderId': paypalOrderId,
      },
    );

    final data = response is Map<String, dynamic> && response['data'] != null
        ? response['data']
        : response;

    return OrderModel.fromJson(data as Map<String, dynamic>);
  }
}
