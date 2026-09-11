import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/models/category_model.dart';

class CategoryChips extends StatefulWidget {
  final List<CategoryModel> categories;

  const CategoryChips({
    super.key,
    required this.categories,
  });

  @override
  State<CategoryChips> createState() => _CategoryChipsState();
}

class _CategoryChipsState extends State<CategoryChips> {
  int _hoveredIndex = -1;

  @override
  Widget build(BuildContext context) {
    if (widget.categories.isEmpty) return const SizedBox.shrink();

    const spacing = 14.0;

    // Use Wrap to center categories and allow wrapping on wider screens
    return Wrap(
      alignment: WrapAlignment.center,
      spacing: spacing,
      runSpacing: 12,
      children: widget.categories.asMap().entries.map((entry) {
        final index = entry.key;
        final cat = entry.value;
        return _buildCategoryChip(cat, index);
      }).toList(),
    );
  }

  Widget _buildCategoryChip(CategoryModel cat, int index) {
    final isHovered = _hoveredIndex == index;

    return MouseRegion(
      onEnter: (_) => setState(() => _hoveredIndex = index),
      onExit: (_) => setState(() => _hoveredIndex = -1),
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        onTap: () {
          context.push('/categories/${cat.slug}');
        },
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          width: 72,
          transform: isHovered
              ? (Matrix4.identity()..scale(1.1))
              : Matrix4.identity(),
          child: Column(
            children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                width: 58,
                height: 58,
                decoration: BoxDecoration(
                  color: AppColors.primarySurface,
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: isHovered ? AppColors.primary : AppColors.border,
                    width: isHovered ? 2 : 1,
                  ),
                  boxShadow: isHovered
                      ? [
                          BoxShadow(
                            color: AppColors.primary.withOpacity(0.3),
                            blurRadius: 12,
                            offset: const Offset(0, 4),
                          ),
                        ]
                      : null,
                ),
                child: ClipOval(
                  child: cat.imageUrl != null
                      ? CachedNetworkImage(
                          imageUrl: cat.imageUrl!,
                          fit: BoxFit.cover,
                          errorWidget: (_, __, ___) => const Icon(
                            Icons.fastfood_rounded,
                            color: AppColors.primary,
                            size: 24,
                          ),
                        )
                      : const Icon(
                          Icons.fastfood_rounded,
                          color: AppColors.primary,
                          size: 24,
                        ),
                ),
              ),
              const SizedBox(height: 6),
              Text(
                cat.name,
                style: AppTextStyles.bodySmall.copyWith(
                  fontWeight: FontWeight.w600,
                  color: isHovered ? AppColors.primary : AppColors.textPrimary,
                ),
                maxLines: 2,
                textAlign: TextAlign.center,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
