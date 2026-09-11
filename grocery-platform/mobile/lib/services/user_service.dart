import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/constants/api_constants.dart';
import '../core/network/api_client.dart';
import '../shared/models/user_model.dart';
import '../shared/models/address_model.dart';

final userServiceProvider = Provider<UserService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return UserService(apiClient);
});

class UserService {
  final ApiClient _apiClient;

  UserService(this._apiClient);

  Future<UserModel> getProfile() async {
    final response = await _apiClient.get(ApiConstants.userProfile);
    final data = response is Map<String, dynamic> && response['data'] != null
        ? response['data']
        : response;
    return UserModel.fromJson(data as Map<String, dynamic>);
  }

  Future<UserModel> updateProfile({
    String? firstName,
    String? lastName,
    String? phone,
    String? avatarUrl,
  }) async {
    final response = await _apiClient.patch(
      ApiConstants.updateProfile,
      data: {
        if (firstName != null) 'firstName': firstName,
        if (lastName != null) 'lastName': lastName,
        if (phone != null) 'phone': phone,
        if (avatarUrl != null) 'avatarUrl': avatarUrl,
      },
    );

    final data = response is Map<String, dynamic> && response['data'] != null
        ? response['data']
        : response;
    return UserModel.fromJson(data as Map<String, dynamic>);
  }

  Future<void> changePassword(String currentPassword, String newPassword) async {
    await _apiClient.put(
      '/users/password',
      data: {
        'currentPassword': currentPassword,
        'newPassword': newPassword,
      },
    );
  }

  Future<void> deleteAccount() async {
    await _apiClient.delete('/users/account');
  }

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
    final response = await _apiClient.post(ApiConstants.addresses, data: payload);
    final data = response is Map<String, dynamic> && response['data'] != null
        ? response['data']
        : response;
    return AddressModel.fromJson(data as Map<String, dynamic>);
  }

  Future<AddressModel> updateAddress(String id, Map<String, dynamic> payload) async {
    final response = await _apiClient.put('${ApiConstants.addresses}/$id', data: payload);
    final data = response is Map<String, dynamic> && response['data'] != null
        ? response['data']
        : response;
    return AddressModel.fromJson(data as Map<String, dynamic>);
  }

  Future<void> deleteAddress(String id) async {
    await _apiClient.delete('${ApiConstants.addresses}/$id');
  }

  Future<void> setDefaultAddress(String id) async {
    await _apiClient.patch('${ApiConstants.addresses}/$id/default');
  }
}
