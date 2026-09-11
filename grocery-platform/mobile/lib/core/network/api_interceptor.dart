import 'package:dio/dio.dart';
import '../storage/secure_storage_service.dart';
import '../constants/api_constants.dart';

class ApiInterceptor extends QueuedInterceptor {
  final SecureStorageService _storageService;
  final Dio _dio;

  ApiInterceptor(this._storageService, this._dio);

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await _storageService.getAccessToken();
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    options.headers['Content-Type'] = 'application/json';
    options.headers['Accept'] = 'application/json';

    return handler.next(options);
  }

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    if (err.response?.statusCode == 401 &&
        !err.requestOptions.path.contains('/auth/login') &&
        !err.requestOptions.path.contains('/auth/refresh-token')) {
      // Access token has expired; attempt transparent refresh
      final refreshToken = await _storageService.getRefreshToken();
      if (refreshToken != null && refreshToken.isNotEmpty) {
        try {
          final response = await _dio.post(
            '${ApiConstants.baseUrl}${ApiConstants.refreshToken}',
            data: {'refreshToken': refreshToken},
          );

          if (response.statusCode == 200 && response.data['data'] != null) {
            final data = response.data['data'];
            final newAccessToken = data['accessToken'] as String;
            final newRefreshToken = data['refreshToken'] as String;

            await _storageService.saveTokens(
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
            );

            // Retry the original request with new access token
            final requestOptions = err.requestOptions;
            requestOptions.headers['Authorization'] = 'Bearer $newAccessToken';

            final retryResponse = await _dio.fetch(requestOptions);
            return handler.resolve(retryResponse);
          }
        } catch (_) {
          // Token refresh failed; session invalidated
          await _storageService.clearAll();
        }
      }
    }

    return handler.next(err);
  }
}
