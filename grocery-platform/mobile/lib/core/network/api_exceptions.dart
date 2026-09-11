import 'package:dio/dio.dart';

class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final List<String>? validationErrors;

  ApiException({
    required this.message,
    this.statusCode,
    this.validationErrors,
  });

  factory ApiException.fromDioError(DioException dioError) {
    switch (dioError.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return ApiException(
          message: 'Connection timed out. Please check your internet connection.',
        );

      case DioExceptionType.badResponse:
        final response = dioError.response;
        if (response != null && response.data is Map<String, dynamic>) {
          final data = response.data as Map<String, dynamic>;
          final msg = data['message'] ?? 'An unexpected error occurred';
          List<String>? validationErrors;

          if (data['validationErrors'] is List) {
            validationErrors = (data['validationErrors'] as List).map((e) => e.toString()).toList();
          }

          return ApiException(
            message: msg is List ? msg.join(', ') : msg.toString(),
            statusCode: response.statusCode,
            validationErrors: validationErrors,
          );
        }
        return ApiException(
          message: 'Server error: ${response?.statusCode}',
          statusCode: response?.statusCode,
        );

      case DioExceptionType.cancel:
        return ApiException(message: 'Request was cancelled.');

      case DioExceptionType.connectionError:
        return ApiException(
          message: 'Cannot connect to server. Please verify the backend is running.',
        );

      default:
        return ApiException(
          message: dioError.message ?? 'An unexpected error occurred.',
        );
    }
  }

  @override
  String toString() => message;
}
