import '../core/network/api_client.dart';
import '../core/constants/api_constants.dart';
import '../shared/models/product_model.dart';

class ProductService {
  final ApiClient _apiClient;

  ProductService(this._apiClient);

  Future<List<ProductModel>> getProducts({
    String? categoryId,
    bool? inStockOnly,
    double? minPrice,
    double? maxPrice,
    String? sortBy,
    String? sortOrder,
    int page = 1,
    int limit = 20,
  }) async {
    final queryParams = <String, dynamic>{
      'page': page,
      'limit': limit,
      if (categoryId != null) 'categoryId': categoryId,
      if (inStockOnly != null) 'inStockOnly': inStockOnly,
      if (minPrice != null) 'minPrice': minPrice,
      if (maxPrice != null) 'maxPrice': maxPrice,
      if (sortBy != null) 'sortBy': sortBy,
      if (sortOrder != null) 'sortOrder': sortOrder,
    };

    final response = await _apiClient.get(
      ApiConstants.products,
      queryParameters: queryParams,
    );

    if (response is List) {
      return response.map((item) => ProductModel.fromJson(item)).toList();
    }
    return [];
  }

  Future<List<ProductModel>> getFeaturedProducts({int limit = 10}) async {
    final response = await _apiClient.get(
      ApiConstants.featuredProducts,
      queryParameters: {'limit': limit},
    );
    if (response is List) {
      return response.map((item) => ProductModel.fromJson(item)).toList();
    }
    return [];
  }

  Future<List<ProductModel>> getPopularProducts({int limit = 10}) async {
    final response = await _apiClient.get(
      ApiConstants.popularProducts,
      queryParameters: {'limit': limit},
    );
    if (response is List) {
      return response.map((item) => ProductModel.fromJson(item)).toList();
    }
    return [];
  }

  Future<List<ProductModel>> getRecommendedProducts({int limit = 10}) async {
    final response = await _apiClient.get(
      ApiConstants.recommendedProducts,
      queryParameters: {'limit': limit},
    );
    if (response is List) {
      return response.map((item) => ProductModel.fromJson(item)).toList();
    }
    return [];
  }

  Future<ProductModel> getProductBySlug(String slug) async {
    final response = await _apiClient.get('${ApiConstants.products}/$slug');
    return ProductModel.fromJson(response);
  }

  Future<List<ProductModel>> searchProducts(String query, {int limit = 15}) async {
    if (query.trim().isEmpty) return [];
    final response = await _apiClient.get(
      ApiConstants.productSearch,
      queryParameters: {'q': query, 'limit': limit},
    );
    if (response is List) {
      return response.map((item) => ProductModel.fromJson(item)).toList();
    }
    return [];
  }
}
