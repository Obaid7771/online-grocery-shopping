import '../core/network/api_client.dart';
import '../core/constants/api_constants.dart';
import '../shared/models/category_model.dart';

class CategoryService {
  final ApiClient _apiClient;

  CategoryService(this._apiClient);

  Future<List<CategoryModel>> getCategories() async {
    final response = await _apiClient.get(ApiConstants.categories);
    if (response is List) {
      return response.map((item) => CategoryModel.fromJson(item)).toList();
    }
    return [];
  }

  Future<CategoryModel> getCategoryBySlug(String slug) async {
    final response = await _apiClient.get('${ApiConstants.categories}/$slug');
    return CategoryModel.fromJson(response);
  }
}
