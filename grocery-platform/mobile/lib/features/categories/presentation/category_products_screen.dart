import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../shared/widgets/product_card.dart';
import '../../../shared/widgets/loading_shimmer.dart';
import '../../../shared/widgets/empty_state_view.dart';
import '../../../shared/widgets/error_state_view.dart';
import '../../../shared/widgets/responsive_wrapper.dart';
import '../providers/category_provider.dart';
import '../../products/providers/product_provider.dart';

class CategoryProductsScreen extends ConsumerWidget {
  final String slug;

  const CategoryProductsScreen({
    super.key,
    required this.slug,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final categoryAsync = ref.watch(categoryDetailProvider(slug));
    final horizontalPadding = ResponsiveWrapper.getHorizontalPadding(context);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: categoryAsync.when(
          data: (cat) => Text(cat.name, style: AppTextStyles.h2.copyWith(fontSize: 20)),
          loading: () => const Text('Loading...'),
          error: (_, __) => const Text('Category'),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => context.pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.search_rounded),
            onPressed: () => context.push('/search'),
          ),
        ],
      ),
      body: categoryAsync.when(
        data: (category) {
          final productsAsync = ref.watch(categoryProductsProvider(category.id));

          return productsAsync.when(
            data: (products) {
              if (products.isEmpty) {
                return Padding(
                  padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
                  child: EmptyStateView(
                    icon: Icons.inventory_2_outlined,
                    title: 'No Products Available',
                    description: 'We couldn\'t find any active items in this category currently.',
                    buttonText: 'Explore Categories',
                    onButtonPressed: () => context.pop(),
                  ),
                );
              }

              return RefreshIndicator(
                color: AppColors.primary,
                onRefresh: () async {
                  ref.invalidate(categoryProductsProvider(category.id));
                },
                child: GridView.builder(
                  padding: EdgeInsets.symmetric(horizontal: horizontalPadding, vertical: 16),
                  gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                    maxCrossAxisExtent: 200,
                    childAspectRatio: 0.58,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                  ),
                  itemCount: products.length,
                  itemBuilder: (context, index) {
                    return ProductCard(product: products[index]);
                  },
                ),
              );
            },
            loading: () => const ProductGridSkeleton(),
            error: (e, _) => ErrorStateView(
              errorMessage: e.toString(),
              onRetry: () => ref.invalidate(categoryProductsProvider(category.id)),
            ),
          );
        },
        loading: () => const ProductGridSkeleton(),
        error: (e, _) => ErrorStateView(
          errorMessage: e.toString(),
          onRetry: () => ref.invalidate(categoryDetailProvider(slug)),
        ),
      ),
    );
  }
}
