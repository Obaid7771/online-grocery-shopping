import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../shared/widgets/empty_state_view.dart';
import '../../../shared/widgets/error_state_view.dart';
import '../../../shared/widgets/responsive_wrapper.dart';
import '../providers/product_provider.dart';
import '../../cart/providers/cart_provider.dart';

class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  final _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final searchResultsAsync = ref.watch(productSearchProvider(_searchQuery));
    final horizontalPadding = ResponsiveWrapper.getHorizontalPadding(context);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        titleSpacing: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => context.pop(),
        ),
        title: Padding(
          padding: const EdgeInsets.only(right: 16),
          child: TextField(
            controller: _searchController,
            autofocus: true,
            onChanged: (val) {
              setState(() {
                _searchQuery = val.trim();
              });
            },
            decoration: InputDecoration(
              hintText: 'Search organic fruits, bread, milk...',
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              prefixIcon: const Icon(Icons.search_rounded, color: AppColors.textTertiary),
              suffixIcon: _searchController.text.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.close_rounded, size: 18),
                      onPressed: () {
                        _searchController.clear();
                        setState(() => _searchQuery = '');
                      },
                    )
                  : null,
            ),
          ),
        ),
      ),
      body: _searchQuery.isEmpty
          ? Padding(
              padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.manage_search_rounded, size: 64, color: AppColors.textTertiary),
                    const SizedBox(height: 16),
                    Text('Type to Search Fresh Items', style: AppTextStyles.h3),
                    const SizedBox(height: 6),
                    Text(
                      'Try "Apples", "Organic Milk", "Avocado", or "Salmon"',
                      style: AppTextStyles.bodyMedium,
                    ),
                  ],
                ),
              ),
            )
          : searchResultsAsync.when(
              data: (products) {
                if (products.isEmpty) {
                  return Padding(
                    padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
                    child: EmptyStateView(
                      icon: Icons.search_off_rounded,
                      title: 'No Results Found',
                      description: 'We couldn\'t find any grocery items matching "$_searchQuery".',
                    ),
                  );
                }

                return ListView.separated(
                  padding: EdgeInsets.symmetric(horizontal: horizontalPadding, vertical: 16),
                  itemCount: products.length,
                  separatorBuilder: (_, __) => const Divider(color: AppColors.divider),
                  itemBuilder: (context, index) {
                    final product = products[index];
                    return ListTile(
                      contentPadding: const EdgeInsets.symmetric(vertical: 4),
                      onTap: () => context.push('/products/${product.slug}'),
                      leading: Container(
                        width: 50,
                        height: 50,
                        decoration: BoxDecoration(
                          color: AppColors.primarySurface,
                          borderRadius: BorderRadius.circular(10),
                          image: DecorationImage(
                            image: NetworkImage(product.primaryImageUrl),
                            fit: BoxFit.cover,
                          ),
                        ),
                      ),
                      title: Text(
                        product.name,
                        style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600),
                      ),
                      subtitle: Text(
                        '${product.categoryName ?? "Grocery"} • ${product.unitStep} ${product.unit.toLowerCase()}',
                        style: AppTextStyles.bodySmall,
                      ),
                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            CurrencyFormatter.format(product.effectivePrice),
                            style: AppTextStyles.price,
                          ),
                          const SizedBox(width: 8),
                          IconButton(
                            icon: const Icon(Icons.add_circle, color: AppColors.primary),
                            onPressed: () {
                              ref.read(cartProvider.notifier).addItem(product);
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text('Added ${product.name} to Cart'),
                                  duration: const Duration(seconds: 1),
                                ),
                              );
                            },
                          ),
                        ],
                      ),
                    );
                  },
                );
              },
              loading: () => const Center(
                child: CircularProgressIndicator(color: AppColors.primary),
              ),
              error: (e, _) => ErrorStateView(
                errorMessage: e.toString(),
                onRetry: () => ref.invalidate(productSearchProvider(_searchQuery)),
              ),
            ),
    );
  }
}
