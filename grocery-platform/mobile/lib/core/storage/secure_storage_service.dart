import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants/api_constants.dart';

class SecureStorageService {
  final FlutterSecureStorage _storage;

  SecureStorageService()
      : _storage = const FlutterSecureStorage(
          aOptions: AndroidOptions(
            encryptedSharedPreferences: true,
          ),
          iOptions: IOSOptions(
            accessibility: KeychainAccessibility.first_unlock,
          ),
        );

  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await _storage.write(key: ApiConstants.accessTokenKey, value: accessToken);
    await _storage.write(key: ApiConstants.refreshTokenKey, value: refreshToken);
  }

  Future<String?> getAccessToken() async {
    return _storage.read(key: ApiConstants.accessTokenKey);
  }

  Future<String?> getRefreshToken() async {
    return _storage.read(key: ApiConstants.refreshTokenKey);
  }

  Future<void> clearAll() async {
    await _storage.deleteAll();
  }

  Future<void> saveUserData(String jsonString) async {
    await _storage.write(key: ApiConstants.userKey, value: jsonString);
  }

  Future<String?> getUserData() async {
    return _storage.read(key: ApiConstants.userKey);
  }

  Future<bool> hasToken() async {
    final token = await getAccessToken();
    return token != null && token.isNotEmpty;
  }
}
