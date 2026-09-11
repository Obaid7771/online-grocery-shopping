import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/providers/auth_provider.dart';
import '../../../services/category_service.dart';
import '../../../shared/models/category_model.dart';

final categoryServiceProvider = Provider<CategoryService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return CategoryService(apiClient);
});

final categoriesProvider = FutureProvider<List<CategoryModel>>((ref) async {
  final service = ref.watch(categoryServiceProvider);
  return service.getCategories();
});

final categoryDetailProvider = FutureProvider.family<CategoryModel, String>((ref, slug) async {
  final service = ref.watch(categoryServiceProvider);
  return service.getCategoryBySlug(slug);
});
