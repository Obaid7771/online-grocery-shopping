import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../constants/api_constants.dart';
import '../storage/secure_storage_service.dart';
import 'api_interceptor.dart';
import 'api_exceptions.dart';

// Provider for SecureStorageService
final secureStorageProvider = Provider<SecureStorageService>((ref) {
  return SecureStorageService();
});

// Provider for ApiClient
final apiClientProvider = Provider<ApiClient>((ref) {
  final storageService = ref.watch(secureStorageProvider);
  return ApiClient(storageService);
});

class ApiClient {
  late final Dio _dio;
  final SecureStorageService _storageService;

  ApiClient(this._storageService) {
    _dio = Dio(
      BaseOptions(
        baseUrl: ApiConstants.baseUrl,
        connectTimeout: ApiConstants.connectTimeout,
        receiveTimeout: ApiConstants.receiveTimeout,
      ),
    );

    _dio.interceptors.add(ApiInterceptor(_storageService, _dio));
  }

  Dio get dio => _dio;

  Future<dynamic> get(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      final response = await _dio.get(path, queryParameters: queryParameters);
      return _extractData(response);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<dynamic> post(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      final response = await _dio.post(path, data: data, queryParameters: queryParameters);
      return _extractData(response);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<dynamic> put(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      final response = await _dio.put(path, data: data, queryParameters: queryParameters);
      return _extractData(response);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<dynamic> patch(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      final response = await _dio.patch(path, data: data, queryParameters: queryParameters);
      return _extractData(response);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<dynamic> delete(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      final response = await _dio.delete(path, data: data, queryParameters: queryParameters);
      return _extractData(response);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  dynamic _extractData(Response response) {
    if (response.data is Map<String, dynamic> && response.data.containsKey('data')) {
      return response.data['data'];
    }
    return response.data;
  }
}
