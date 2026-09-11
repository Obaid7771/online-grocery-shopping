import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/providers/auth_provider.dart';
import '../../../services/product_service.dart';
import '../../../shared/models/product_model.dart';

final productServiceProvider = Provider<ProductService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return ProductService(apiClient);
});

final featuredProductsProvider = FutureProvider<List<ProductModel>>((ref) async {
  final service = ref.watch(productServiceProvider);
  return service.getFeaturedProducts();
});

final popularProductsProvider = FutureProvider<List<ProductModel>>((ref) async {
  final service = ref.watch(productServiceProvider);
  return service.getPopularProducts();
});

final recommendedProductsProvider = FutureProvider<List<ProductModel>>((ref) async {
  final service = ref.watch(productServiceProvider);
  return service.getRecommendedProducts();
});

final categoryProductsProvider = FutureProvider.family<List<ProductModel>, String>((ref, categoryId) async {
  final service = ref.watch(productServiceProvider);
  return service.getProducts(categoryId: categoryId, inStockOnly: false);
});

final productDetailProvider = FutureProvider.family<ProductModel, String>((ref, slug) async {
  final service = ref.watch(productServiceProvider);
  return service.getProductBySlug(slug);
});

final productSearchProvider = FutureProvider.family<List<ProductModel>, String>((ref, query) async {
  if (query.trim().isEmpty) return [];
  final service = ref.watch(productServiceProvider);
  return service.searchProducts(query);
});
