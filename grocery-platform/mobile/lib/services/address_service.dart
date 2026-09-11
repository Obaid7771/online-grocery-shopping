import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/constants/api_constants.dart';
import '../core/network/api_client.dart';
import '../shared/models/address_model.dart';

final addressServiceProvider = Provider<AddressService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return AddressService(apiClient);
});

class AddressService {
  final ApiClient _apiClient;

  AddressService(this._apiClient);

  Future<List<AddressModel>> getAddresses() async {
    final response = await _apiClient.get(ApiConstants.addresses);
    List list = [];
    if (response is Map<String, dynamic> && response['data'] is List) {
      list = response['data'];
    } else if (response is List) {
      list = response;
    }

    return list.map((e) => AddressModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<AddressModel> createAddress(Map<String, dynamic> payload) async {
    final response = await _apiClient.post(
      ApiConstants.addresses,
      data: payload,
    );

    final data = response is Map<String, dynamic> && response['data'] != null
        ? response['data']
        : response;

    return AddressModel.fromJson(data as Map<String, dynamic>);
  }
}
