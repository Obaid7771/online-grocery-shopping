import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/models/delivery_slot_model.dart';

class DeliverySlotPicker extends StatelessWidget {
  final List<DeliverySlotModel> slots;
  final DeliverySlotModel? selectedSlot;
  final ValueChanged<DeliverySlotModel> onSlotSelected;

  const DeliverySlotPicker({
    super.key,
    required this.slots,
    required this.selectedSlot,
    required this.onSlotSelected,
  });

  @override
  Widget build(BuildContext context) {
    if (slots.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          children: [
            const Icon(Icons.schedule, color: AppColors.textTertiary),
            const SizedBox(width: 8),
            Text('Standard delivery in 45-60 minutes', style: AppTextStyles.bodyMedium),
          ],
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.access_time_filled_rounded, color: AppColors.primary, size: 20),
              const SizedBox(width: 8),
              Text('Preferred Delivery Slot', style: AppTextStyles.h3.copyWith(fontSize: 16)),
            ],
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 72,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: slots.length,
              separatorBuilder: (_, __) => const SizedBox(width: 10),
              itemBuilder: (context, index) {
                final slot = slots[index];
                final isSelected = selectedSlot?.id == slot.id;

                return GestureDetector(
                  onTap: slot.isAvailable ? () => onSlotSelected(slot) : null,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 180),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? AppColors.primarySurface
                          : (slot.isAvailable ? Colors.white : AppColors.background),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isSelected
                            ? AppColors.primary
                            : (slot.isAvailable ? AppColors.border : AppColors.divider),
                        width: isSelected ? 1.8 : 1.0,
                      ),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          slot.displayDate,
                          style: AppTextStyles.bodySmall.copyWith(
                            fontWeight: FontWeight.w700,
                            color: isSelected ? AppColors.primaryDark : AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Text(
                              slot.displayWindow,
                              style: AppTextStyles.bodyMedium.copyWith(
                                fontWeight: isSelected ? FontWeight.w700 : FontWeight.normal,
                                color: slot.isAvailable
                                    ? AppColors.textPrimary
                                    : AppColors.textTertiary,
                              ),
                            ),
                            if (!slot.isAvailable) ...[
                              const SizedBox(width: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                                decoration: BoxDecoration(
                                  color: AppColors.errorLight,
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  'FULL',
                                  style: AppTextStyles.bodySmall.copyWith(
                                    fontSize: 9,
                                    color: AppColors.error,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
