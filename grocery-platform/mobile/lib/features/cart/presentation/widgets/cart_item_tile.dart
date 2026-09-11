import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../../../../shared/models/cart_model.dart';
import '../../providers/cart_provider.dart';

class CartItemTile extends ConsumerWidget {
  final CartItemModel item;

  const CartItemTile({
    super.key,
    required this.item,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cartNotifier = ref.read(cartProvider.notifier);

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          // Image
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: SizedBox(
              width: 70,
              height: 70,
              child: CachedNetworkImage(
                imageUrl: item.product.primaryImageUrl,
                fit: BoxFit.cover,
                placeholder: (_, __) => Container(color: AppColors.divider),
                errorWidget: (_, __, ___) => Container(
                  color: AppColors.divider,
                  child: const Icon(Icons.fastfood_rounded, color: AppColors.textTertiary),
                ),
              ),
            ),
          ),
          const SizedBox(width: 14),

          // Details
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.product.name,
                  style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w700),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(
                  '${CurrencyFormatter.format(item.unitPrice)} / ${item.product.unit.toLowerCase()}',
                  style: AppTextStyles.bodySmall,
                ),
                const SizedBox(height: 8),
                Text(
                  CurrencyFormatter.format(item.totalPrice),
                  style: AppTextStyles.price,
                ),
              ],
            ),
          ),

          // Stepper
          Container(
            decoration: BoxDecoration(
              color: AppColors.primarySurface,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.primaryLight),
            ),
            child: Row(
              children: [
                InkWell(
                  onTap: () {
                    cartNotifier.updateQuantity(item.product.id, item.quantity - 1);
                  },
                  child: const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                    child: Icon(Icons.remove, size: 16, color: AppColors.primary),
                  ),
                ),
                Text(
                  '${item.quantity}',
                  style: AppTextStyles.bodyMedium.copyWith(
                    fontWeight: FontWeight.w700,
                    color: AppColors.primaryDark,
                  ),
                ),
                InkWell(
                  onTap: () {
                    cartNotifier.updateQuantity(item.product.id, item.quantity + 1);
                  },
                  child: const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                    child: Icon(Icons.add, size: 16, color: AppColors.primary),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
