import 'dart:convert';
import '../core/network/api_client.dart';
import '../core/storage/secure_storage_service.dart';
import '../core/constants/api_constants.dart';
import '../shared/models/user_model.dart';

class AuthService {
  final ApiClient _apiClient;
  final SecureStorageService _storageService;

  AuthService(this._apiClient, this._storageService);

  Future<UserModel> register({
    required String email,
    required String firstName,
    required String lastName,
    String? phone,
    required String password,
  }) async {
    final response = await _apiClient.post(
      ApiConstants.register,
      data: {
        'email': email,
        'firstName': firstName,
        'lastName': lastName,
        if (phone != null && phone.isNotEmpty) 'phone': phone,
        'password': password,
      },
    );

    final accessToken = response['accessToken'] as String;
    final refreshToken = response['refreshToken'] as String;
    await _storageService.saveTokens(
      accessToken: accessToken,
      refreshToken: refreshToken,
    );

    final user = UserModel.fromJson(response['user']);
    await _storageService.saveUserData(jsonEncode(user.toJson()));

    return user;
  }

  Future<UserModel> login({
    required String email,
    required String password,
  }) async {
    final response = await _apiClient.post(
      ApiConstants.login,
      data: {
        'email': email,
        'password': password,
      },
    );

    final accessToken = response['accessToken'] as String;
    final refreshToken = response['refreshToken'] as String;
    await _storageService.saveTokens(
      accessToken: accessToken,
      refreshToken: refreshToken,
    );

    final user = UserModel.fromJson(response['user']);
    await _storageService.saveUserData(jsonEncode(user.toJson()));

    return user;
  }

  Future<void> logout() async {
    try {
      final refreshToken = await _storageService.getRefreshToken();
      if (refreshToken != null) {
        await _apiClient.post(
          ApiConstants.logout,
          data: {'refreshToken': refreshToken},
        );
      }
    } catch (_) {
      // Continue cleanup on error
    } finally {
      await _storageService.clearAll();
    }
  }

  Future<String> forgotPassword(String email) async {
    final response = await _apiClient.post(
      ApiConstants.forgotPassword,
      data: {'email': email},
    );
    return response['message'] as String? ?? 'Password recovery code sent.';
  }

  Future<String> resetPassword({
    required String token,
    required String newPassword,
  }) async {
    final response = await _apiClient.post(
      ApiConstants.resetPassword,
      data: {
        'token': token,
        'newPassword': newPassword,
      },
    );
    return response['message'] as String;
  }

  Future<String> verifyOtp({
    required String email,
    required String otp,
  }) async {
    final response = await _apiClient.post(
      ApiConstants.verifyOtp,
      data: {
        'email': email,
        'otp': otp,
      },
    );
    return response['message'] as String;
  }

  Future<UserModel?> getSavedUser() async {
    final jsonStr = await _storageService.getUserData();
    if (jsonStr == null) return null;
    return UserModel.fromJson(jsonDecode(jsonStr));
  }

  Future<bool> isAuthenticated() async {
    return _storageService.hasToken();
  }
}
