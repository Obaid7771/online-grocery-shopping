import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../shared/widgets/custom_button.dart';
import '../../../shared/widgets/error_state_view.dart';
import '../../../shared/widgets/responsive_wrapper.dart';
import '../providers/product_provider.dart';
import '../../cart/providers/cart_provider.dart';

class ProductDetailScreen extends ConsumerStatefulWidget {
  final String slug;

  const ProductDetailScreen({
    super.key,
    required this.slug,
  });

  @override
  ConsumerState<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends ConsumerState<ProductDetailScreen> {
  int _selectedQuantity = 1;

  @override
  Widget build(BuildContext context) {
    final productAsync = ref.watch(productDetailProvider(widget.slug));
    final horizontalPadding = ResponsiveWrapper.getHorizontalPadding(context);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => context.pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.favorite_border_rounded),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Added to Wishlist')),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.share_outlined),
            onPressed: () {},
          ),
        ],
      ),
      body: productAsync.when(
        data: (product) {
          return Column(
            children: [
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Product Image Showcase
                      Container(
                        height: 300,
                        width: double.infinity,
                        color: AppColors.background,
                        child: Stack(
                          children: [
                            Center(
                              child: CachedNetworkImage(
                                imageUrl: product.primaryImageUrl,
                                fit: BoxFit.contain,
                                placeholder: (_, __) => const Center(
                                  child: CircularProgressIndicator(color: AppColors.primary),
                                ),
                              ),
                            ),
                            if (product.hasDiscount)
                              Positioned(
                                top: 16,
                                left: 16,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                  decoration: BoxDecoration(
                                    color: AppColors.secondary,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    '-${product.discountPercentage}% OFF',
                                    style: AppTextStyles.bodySmall.copyWith(
                                      color: Colors.white,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),

                      // Content Details
                      Padding(
                        padding: EdgeInsets.symmetric(horizontal: horizontalPadding, vertical: 20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Category & Rating
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  product.categoryName?.toUpperCase() ?? 'GROCERY',
                                  style: AppTextStyles.bodySmall.copyWith(
                                    color: AppColors.primary,
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: 0.8,
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: AppColors.primarySurface,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Row(
                                    children: [
                                      const Icon(Icons.star_rounded, size: 16, color: AppColors.secondary),
                                      const SizedBox(width: 4),
                                      Text(
                                        '${product.averageRating}',
                                        style: AppTextStyles.bodySmall.copyWith(
                                          fontWeight: FontWeight.w700,
                                          color: AppColors.textPrimary,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),

                            // Title
                            Text(product.name, style: AppTextStyles.h1),
                            const SizedBox(height: 8),

                            // Unit specification & Stock badge
                            Row(
                              children: [
                                Text(
                                  'Standard Unit: ${product.unitStep} ${product.unit.toLowerCase()}',
                                  style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textTertiary),
                                ),
                                const SizedBox(width: 12),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: product.isInStock ? AppColors.primaryLight : AppColors.errorLight,
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(
                                    product.isInStock ? 'In Stock (${product.stockQuantity})' : 'Out of Stock',
                                    style: AppTextStyles.bodySmall.copyWith(
                                      color: product.isInStock ? AppColors.primaryDark : AppColors.error,
                                      fontWeight: FontWeight.w600,
                                      fontSize: 11,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),

                            // Price Row
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.baseline,
                              textBaseline: TextBaseline.alphabetic,
                              children: [
                                Text(
                                  CurrencyFormatter.format(product.effectivePrice),
                                  style: AppTextStyles.h1.copyWith(
                                    color: AppColors.primaryDark,
                                    fontSize: 32,
                                  ),
                                ),
                                if (product.hasDiscount) ...[
                                  const SizedBox(width: 10),
                                  Text(
                                    CurrencyFormatter.format(product.price),
                                    style: AppTextStyles.originalPrice.copyWith(fontSize: 18),
                                  ),
                                ],
                              ],
                            ),
                            const SizedBox(height: 24),
                            const Divider(color: AppColors.divider),
                            const SizedBox(height: 16),

                            // Description
                            Text('Product Details', style: AppTextStyles.h3),
                            const SizedBox(height: 8),
                            Text(
                              product.description ??
                                  'Freshly sourced premium quality grocery item, rigorously inspected for optimal flavor, purity, and organic standards.',
                              style: AppTextStyles.bodyMedium.copyWith(height: 1.6),
                            ),
                            const SizedBox(height: 24),

                            // Logistics Perks
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: AppColors.primarySurface,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: AppColors.primaryLight),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.local_shipping_outlined, color: AppColors.primary),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'Free Delivery on Orders Over \$50',
                                          style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600),
                                        ),
                                        Text(
                                          'Select your preferred arrival slot at checkout',
                                          style: AppTextStyles.bodySmall,
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Bottom Sticky Add-To-Cart Bar
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.06),
                      blurRadius: 10,
                      offset: const Offset(0, -4),
                    ),
                  ],
                ),
                child: SafeArea(
                  child: Row(
                    children: [
                      // Quantity Stepper
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.background,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Row(
                          children: [
                            IconButton(
                              icon: const Icon(Icons.remove, size: 18),
                              onPressed: _selectedQuantity > 1
                                  ? () => setState(() => _selectedQuantity--)
                                  : null,
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 8),
                              child: Text(
                                '$_selectedQuantity',
                                style: AppTextStyles.h3.copyWith(fontSize: 16),
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.add, size: 18),
                              onPressed: product.isInStock && _selectedQuantity < product.stockQuantity
                                  ? () => setState(() => _selectedQuantity++)
                                  : null,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 16),

                      // Add to Cart Button
                      Expanded(
                        child: CustomButton(
                          text: 'Add to Cart • ${CurrencyFormatter.format(product.effectivePrice * _selectedQuantity)}',
                          icon: Icons.shopping_bag_outlined,
                          onPressed: product.isInStock
                              ? () {
                                  ref
                                      .read(cartProvider.notifier)
                                      .addItem(product, quantity: _selectedQuantity);
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text('Added $_selectedQuantity x ${product.name} to Cart'),
                                      backgroundColor: AppColors.primaryDark,
                                      action: SnackBarAction(
                                        label: 'View Cart',
                                        textColor: Colors.white,
                                        onPressed: () => context.go('/cart'),
                                      ),
                                    ),
                                  );
                                }
                              : null,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
        loading: () => const Center(
          child: CircularProgressIndicator(color: AppColors.primary),
        ),
        error: (e, _) => ErrorStateView(
          errorMessage: e.toString(),
          onRetry: () => ref.invalidate(productDetailProvider(widget.slug)),
        ),
      ),
    );
  }
}
