import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../shared/models/address_model.dart';
import '../../../shared/widgets/empty_state_view.dart';
import '../../../shared/widgets/custom_button.dart';
import '../../../shared/widgets/responsive_wrapper.dart';
import '../providers/profile_provider.dart';

class SavedAddressesScreen extends ConsumerWidget {
  const SavedAddressesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final addressesAsync = ref.watch(savedAddressesProvider);
    final horizontalPadding = ResponsiveWrapper.getHorizontalPadding(context);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Saved Addresses', style: AppTextStyles.h2.copyWith(fontSize: 20)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => context.pop(),
        ),
      ),
      body: addressesAsync.when(
        data: (addresses) {
          if (addresses.isEmpty) {
            return Padding(
              padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
              child: EmptyStateView(
                icon: Icons.location_off_outlined,
                title: 'No Saved Addresses',
                description: 'Add your home or office address for fast, one-tap grocery deliveries.',
                buttonText: 'Add New Address',
                onButtonPressed: () => _openAddAddressModal(context, ref),
              ),
            );
          }

          return RefreshIndicator(
            color: AppColors.primary,
            onRefresh: () async => ref.invalidate(savedAddressesProvider),
            child: ListView.separated(
              padding: EdgeInsets.symmetric(horizontal: horizontalPadding, vertical: 16),
              itemCount: addresses.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final address = addresses[index];
                return _AddressCard(address: address);
              },
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.primary)),
        error: (e, _) => Center(child: Text('Error loading addresses: $e')),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _openAddAddressModal(context, ref),
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('Add Address', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
    );
  }

  void _openAddAddressModal(BuildContext context, WidgetRef ref) {
    final streetCtrl = TextEditingController();
    final aptCtrl = TextEditingController();
    final cityCtrl = TextEditingController(text: 'San Francisco');
    final postalCtrl = TextEditingController(text: '94105');
    final nameCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    String label = 'Home';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 20,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('New Delivery Address', style: AppTextStyles.h2.copyWith(fontSize: 18)),
                    IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(ctx)),
                  ],
                ),
                const SizedBox(height: 14),

                // Label selector chips
                Row(
                  children: ['Home', 'Work', 'Other'].map((l) {
                    final isSelected = label == l;
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: ChoiceChip(
                        label: Text(l),
                        selected: isSelected,
                        selectedColor: AppColors.primarySurface,
                        labelStyle: TextStyle(
                          color: isSelected ? AppColors.primaryDark : AppColors.textPrimary,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                        ),
                        onSelected: (val) {
                          if (val) setModalState(() => label = l);
                        },
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 12),

                TextField(
                  controller: nameCtrl,
                  decoration: const InputDecoration(labelText: 'Recipient Full Name'),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: phoneCtrl,
                  decoration: const InputDecoration(labelText: 'Phone Number'),
                  keyboardType: TextInputType.phone,
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: streetCtrl,
                  decoration: const InputDecoration(labelText: 'Street Address'),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: aptCtrl,
                  decoration: const InputDecoration(labelText: 'Apartment, Suite, Unit (Optional)'),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: cityCtrl,
                        decoration: const InputDecoration(labelText: 'City'),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: TextField(
                        controller: postalCtrl,
                        decoration: const InputDecoration(labelText: 'Postal Code'),
                        keyboardType: TextInputType.number,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                CustomButton(
                  text: 'Save Delivery Address',
                  onPressed: () async {
                    if (streetCtrl.text.isNotEmpty && nameCtrl.text.isNotEmpty) {
                      await ref.read(profileNotifierProvider.notifier).createAddress({
                        'label': label,
                        'recipientName': nameCtrl.text.trim(),
                        'phone': phoneCtrl.text.trim(),
                        'street': streetCtrl.text.trim(),
                        'apartment': aptCtrl.text.trim(),
                        'city': cityCtrl.text.trim(),
                        'state': 'CA',
                        'postalCode': postalCtrl.text.trim(),
                        'country': 'USA',
                      });
                      if (context.mounted) Navigator.pop(ctx);
                    }
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _AddressCard extends ConsumerWidget {
  final AddressModel address;

  const _AddressCard({required this.address});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: address.isDefault ? AppColors.primary : AppColors.border,
          width: address.isDefault ? 1.6 : 1.0,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.primarySurface,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  address.label.toUpperCase(),
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.primaryDark,
                    fontWeight: FontWeight.w700,
                    fontSize: 10,
                  ),
                ),
              ),
              if (address.isDefault) ...[
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.primaryDark,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Text(
                    'DEFAULT',
                    style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
              const Spacer(),
              PopupMenuButton<String>(
                icon: const Icon(Icons.more_vert, size: 20, color: AppColors.textTertiary),
                onSelected: (val) {
                  if (val == 'default') {
                    ref.read(profileNotifierProvider.notifier).setDefaultAddress(address.id);
                  } else if (val == 'delete') {
                    ref.read(profileNotifierProvider.notifier).deleteAddress(address.id);
                  }
                },
                itemBuilder: (ctx) => [
                  if (!address.isDefault)
                    const PopupMenuItem(value: 'default', child: Text('Set as Default')),
                  const PopupMenuItem(
                    value: 'delete',
                    child: Text('Delete Address', style: TextStyle(color: AppColors.error)),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            '${address.recipientName} • ${address.phone}',
            style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 4),
          Text(
            address.formattedAddress,
            style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
          ),
        ],
      ),
    );
  }
}
