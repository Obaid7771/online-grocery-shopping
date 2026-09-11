import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/models/address_model.dart';

class AddressSelector extends StatelessWidget {
  final AddressModel? selectedAddress;
  final List<AddressModel> availableAddresses;
  final ValueChanged<AddressModel> onSelected;
  final VoidCallback onAddNew;

  const AddressSelector({
    super.key,
    required this.selectedAddress,
    required this.availableAddresses,
    required this.onSelected,
    required this.onAddNew,
  });

  @override
  Widget build(BuildContext context) {
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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.location_on_rounded, color: AppColors.primary, size: 20),
                  const SizedBox(width: 8),
                  Text('Delivery Address', style: AppTextStyles.h3.copyWith(fontSize: 16)),
                ],
              ),
              TextButton(
                onPressed: () => _showAddressPicker(context),
                child: Text(
                  selectedAddress == null ? 'Add Address' : 'Change',
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.primaryDark,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          if (selectedAddress != null) ...[
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.primarySurface,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    selectedAddress!.label.toUpperCase(),
                    style: AppTextStyles.bodySmall.copyWith(
                      color: AppColors.primaryDark,
                      fontWeight: FontWeight.w700,
                      fontSize: 10,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  selectedAddress!.recipientName,
                  style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600),
                ),
                const SizedBox(width: 8),
                Text(
                  '(${selectedAddress!.phone})',
                  style: AppTextStyles.bodySmall.copyWith(color: AppColors.textTertiary),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              selectedAddress!.formattedAddress,
              style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
            ),
            if (selectedAddress!.deliveryInstructions != null &&
                selectedAddress!.deliveryInstructions!.isNotEmpty) ...[
              const SizedBox(height: 6),
              Row(
                children: [
                  const Icon(Icons.info_outline_rounded, size: 14, color: AppColors.textTertiary),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      'Note: ${selectedAddress!.deliveryInstructions}',
                      style: AppTextStyles.bodySmall.copyWith(fontStyle: FontStyle.italic),
                    ),
                  ),
                ],
              ),
            ],
          ] else ...[
            GestureDetector(
              onTap: onAddNew,
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.background,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.divider, style: BorderStyle.solid),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.add_location_alt_outlined, color: AppColors.primary, size: 20),
                    const SizedBox(width: 8),
                    Text(
                      'Select or Add Delivery Address',
                      style: AppTextStyles.bodyMedium.copyWith(
                        color: AppColors.primaryDark,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  void _showAddressPicker(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Select Delivery Address', style: AppTextStyles.h2.copyWith(fontSize: 18)),
                    IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () => Navigator.pop(ctx),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                if (availableAddresses.isEmpty)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 20),
                    child: Center(
                      child: Text('No saved addresses yet.', style: AppTextStyles.bodyMedium),
                    ),
                  )
                else
                  ...availableAddresses.map(
                    (addr) => ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: Icon(
                        addr.id == selectedAddress?.id
                            ? Icons.radio_button_checked
                            : Icons.radio_button_off,
                        color: AppColors.primary,
                      ),
                      title: Text(
                        '${addr.label}: ${addr.recipientName}',
                        style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w700),
                      ),
                      subtitle: Text(addr.formattedAddress, style: AppTextStyles.bodySmall),
                      onTap: () {
                        onSelected(addr);
                        Navigator.pop(ctx);
                      },
                    ),
                  ),
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  onPressed: () {
                    Navigator.pop(ctx);
                    onAddNew();
                  },
                  icon: const Icon(Icons.add, color: AppColors.primary),
                  label: const Text('Add New Address'),
                  style: OutlinedButton.styleFrom(
                    minimumSize: const Size(double.infinity, 48),
                    side: const BorderSide(color: AppColors.primary),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
