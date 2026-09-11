import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/models/order_model.dart';
import '../../../services/order_service.dart';

final ordersFilterProvider = StateProvider<String?>((ref) => null);

final userOrdersProvider = FutureProvider<List<OrderModel>>((ref) async {
  final orderService = ref.watch(orderServiceProvider);
  final filter = ref.watch(ordersFilterProvider);
  return orderService.getMyOrders(status: filter);
});

final orderDetailProvider =
    FutureProvider.family<OrderModel, String>((ref, orderId) async {
  final orderService = ref.watch(orderServiceProvider);
  return orderService.getOrderById(orderId);
});
