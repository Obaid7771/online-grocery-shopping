import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../shared/widgets/product_card.dart';
import '../../../shared/widgets/loading_shimmer.dart';
import '../../../shared/widgets/error_state_view.dart';
import '../../../shared/widgets/responsive_wrapper.dart';
import '../../categories/providers/category_provider.dart';
import '../../products/providers/product_provider.dart';
import 'widgets/location_header.dart';
import 'widgets/search_bar_widget.dart';
import 'widgets/banner_carousel.dart';
import 'widgets/category_chips.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final categoriesAsync = ref.watch(categoriesProvider);
    final popularProductsAsync = ref.watch(popularProductsProvider);
    final featuredProductsAsync = ref.watch(featuredProductsProvider);

    // Use shared responsive padding for consistency across all screens
    final horizontalPadding = ResponsiveWrapper.getHorizontalPadding(context);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: RefreshIndicator(
          color: AppColors.primary,
          onRefresh: () async {
            ref.invalidate(categoriesProvider);
            ref.invalidate(popularProductsProvider);
            ref.invalidate(featuredProductsProvider);
          },
          child: CustomScrollView(
            slivers: [
              // Sticky Header: Location & Search
              SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.fromLTRB(horizontalPadding, 12, horizontalPadding, 12),
                  child: Column(
                    children: [
                      LocationHeader(
                        onTap: () {
                          // Open address picker
                        },
                      ),
                      const SizedBox(height: 12),
                      const SearchBarWidget(),
                    ],
                  ),
                ),
              ),

              // Banners
              SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: horizontalPadding, vertical: 8),
                  child: const BannerCarousel(),
                ),
              ),

              // Categories Header & Chips
              SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.fromLTRB(horizontalPadding, 16, horizontalPadding, 8),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Categories', style: AppTextStyles.h2.copyWith(fontSize: 20)),
                      TextButton(
                        onPressed: () => context.go('/categories'),
                        child: Text(
                          'See All',
                          style: AppTextStyles.bodyMedium.copyWith(
                            color: AppColors.primary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              SliverToBoxAdapter(
                child: categoriesAsync.when(
                  data: (cats) => Padding(
                    padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
                    child: CategoryChips(categories: cats),
                  ),
                  loading: () => Padding(
                    padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        LoadingShimmer(width: 58, height: 58, borderRadius: 30),
                        LoadingShimmer(width: 58, height: 58, borderRadius: 30),
                        LoadingShimmer(width: 58, height: 58, borderRadius: 30),
                        LoadingShimmer(width: 58, height: 58, borderRadius: 30),
                      ],
                    ),
                  ),
                  error: (e, _) => const SizedBox.shrink(),
                ),
              ),

              // Popular Products Header & Horizontal Carousel (Recommended Style)
              SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.fromLTRB(horizontalPadding, 20, horizontalPadding, 12),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Recommended for You', style: AppTextStyles.h2.copyWith(fontSize: 20)),
                      Text(
                        'Hand-Picked',
                        style: AppTextStyles.bodySmall.copyWith(
                          color: AppColors.textTertiary,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              SliverToBoxAdapter(
                child: popularProductsAsync.when(
                  data: (products) {
                    if (products.isEmpty) {
                      return Padding(
                        padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
                        child: const Text('No recommended items found right now.'),
                      );
                    }
                    return Padding(
                      padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: SizedBox(
                          height: 320,
                          child: Stack(
                            clipBehavior: Clip.hardEdge,
                            children: [
                              ListView.separated(
                                scrollDirection: Axis.horizontal,
                                clipBehavior: Clip.none,
                                itemCount: products.length,
                                separatorBuilder: (_, __) => const SizedBox(width: 16),
                                itemBuilder: (context, index) {
                                  return ProductCard(
                                    product: products[index],
                                    width: 200,
                                  );
                                },
                              ),
                              // Right fade indicator
                              Positioned(
                                right: 0,
                                top: 0,
                                bottom: 0,
                                child: IgnorePointer(
                                  child: Container(
                                    width: 40,
                                    decoration: BoxDecoration(
                                      gradient: LinearGradient(
                                        colors: [
                                          AppColors.background.withOpacity(0),
                                          AppColors.background.withOpacity(0.9),
                                        ],
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                  loading: () => Padding(
                    padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
                    child: const Row(
                      children: [
                        LoadingShimmer(width: 200, height: 300, borderRadius: 16),
                        SizedBox(width: 16),
                        LoadingShimmer(width: 200, height: 300, borderRadius: 16),
                      ],
                    ),
                  ),
                  error: (e, _) => Padding(
                    padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
                    child: ErrorStateView(
                      errorMessage: e.toString(),
                      onRetry: () => ref.invalidate(popularProductsProvider),
                    ),
                  ),
                ),
              ),

              // Fresh Deals Grid
              SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.fromLTRB(horizontalPadding, 24, horizontalPadding, 12),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Fresh Deals', style: AppTextStyles.h2.copyWith(fontSize: 20)),
                      Text(
                        'Just for You',
                        style: AppTextStyles.bodySmall.copyWith(color: AppColors.textTertiary),
                      ),
                    ],
                  ),
                ),
              ),

              featuredProductsAsync.when(
                data: (products) {
                  return SliverPadding(
                    padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
                    sliver: SliverGrid(
                      gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                        maxCrossAxisExtent: 200,
                        childAspectRatio: 0.62,
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                      ),
                      delegate: SliverChildBuilderDelegate(
                        (context, index) => ProductCard(product: products[index]),
                        childCount: products.length,
                      ),
                    ),
                  );
                },
                loading: () => const SliverToBoxAdapter(child: ProductGridSkeleton()),
                error: (e, _) => SliverToBoxAdapter(
                  child: ErrorStateView(
                    errorMessage: e.toString(),
                    onRetry: () => ref.invalidate(featuredProductsProvider),
                  ),
                ),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 24)),
            ],
          ),
        ),
      ),
    );
  }
}
