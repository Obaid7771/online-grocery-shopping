import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';

class SearchBarWidget extends StatelessWidget {
  final bool readOnly;
  final VoidCallback? onTap;

  const SearchBarWidget({
    super.key,
    this.readOnly = true,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap ?? () => context.push('/search'),
      child: Container(
        height: 50,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.border),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.02),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            const Icon(Icons.search_rounded, color: AppColors.textTertiary, size: 22),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                'Search fresh fruits, vegetables, milk...',
                style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textTertiary),
                overflow: TextOverflow.ellipsis,
              ),
            ),
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.primarySurface,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.tune_rounded, size: 16, color: AppColors.primary),
            ),
          ],
        ),
      ),
    );
  }
}
