import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../shared/widgets/custom_button.dart';
import '../../../shared/widgets/responsive_wrapper.dart';
import '../../../shared/models/address_model.dart';
import '../../../services/address_service.dart';
import '../../cart/providers/cart_provider.dart';
import '../providers/checkout_provider.dart';
import 'widgets/delivery_type_selector.dart';
import 'widgets/address_selector.dart';
import 'widgets/delivery_slot_picker.dart';
import 'widgets/payment_method_selector.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  final _notesController = TextEditingController();

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cart = ref.watch(cartProvider);
    final checkoutState = ref.watch(checkoutProvider);
    final checkoutNotifier = ref.read(checkoutProvider.notifier);
    final addressesAsync = ref.watch(addressesProvider);
    final slotsAsync = ref.watch(deliverySlotsProvider);
    final horizontalPadding = ResponsiveWrapper.getHorizontalPadding(context);

    // Auto-select first or default address if not selected
    addressesAsync.whenData((addresses) {
      if (checkoutState.selectedAddress == null && addresses.isNotEmpty) {
        final defaultAddr = addresses.firstWhere(
          (a) => a.isDefault,
          orElse: () => addresses.first,
        );
        WidgetsBinding.instance.addPostFrameCallback((_) {
          checkoutNotifier.selectAddress(defaultAddr);
        });
      }
    });

    // Auto-select first available slot if not selected
    slotsAsync.whenData((slots) {
      if (checkoutState.selectedSlot == null && slots.isNotEmpty) {
        final available = slots.firstWhere(
          (s) => s.isAvailable,
          orElse: () => slots.first,
        );
        WidgetsBinding.instance.addPostFrameCallback((_) {
          checkoutNotifier.selectSlot(available);
        });
      }
    });

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Checkout', style: AppTextStyles.h2.copyWith(fontSize: 20)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => context.pop(),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: EdgeInsets.symmetric(horizontal: horizontalPadding, vertical: 16),
              children: [
                // Error banner if any
                if (checkoutState.errorMessage != null) ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    margin: const EdgeInsets.only(bottom: 16),
                    decoration: BoxDecoration(
                      color: AppColors.errorLight,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.error),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.error_outline_rounded, color: AppColors.error, size: 20),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            checkoutState.errorMessage!,
                            style: AppTextStyles.bodySmall.copyWith(
                              color: AppColors.error,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],

                // 1. Delivery vs Pickup Toggle
                DeliveryTypeSelector(
                  selectedType: checkoutState.deliveryType,
                  onChanged: (type) => checkoutNotifier.setDeliveryType(type),
                ),
                const SizedBox(height: 16),

                // 2. Address Selector (Only if Home Delivery)
                if (checkoutState.deliveryType == 'DELIVERY') ...[
                  addressesAsync.when(
                    data: (addresses) => AddressSelector(
                      selectedAddress: checkoutState.selectedAddress,
                      availableAddresses: addresses,
                      onSelected: (addr) => checkoutNotifier.selectAddress(addr),
                      onAddNew: () => _showAddAddressDialog(context),
                    ),
                    loading: () => const Center(
                      child: Padding(
                        padding: EdgeInsets.all(16),
                        child: CircularProgressIndicator(color: AppColors.primary),
                      ),
                    ),
                    error: (_, __) => AddressSelector(
                      selectedAddress: checkoutState.selectedAddress,
                      availableAddresses: const [],
                      onSelected: (addr) => checkoutNotifier.selectAddress(addr),
                      onAddNew: () => _showAddAddressDialog(context),
                    ),
                  ),
                  const SizedBox(height: 16),
                ],

                // 3. Preferred Delivery Slot
                slotsAsync.when(
                  data: (slots) => DeliverySlotPicker(
                    slots: slots,
                    selectedSlot: checkoutState.selectedSlot,
                    onSlotSelected: (slot) => checkoutNotifier.selectSlot(slot),
                  ),
                  loading: () => const SizedBox.shrink(),
                  error: (_, __) => const SizedBox.shrink(),
                ),
                const SizedBox(height: 16),

                // 4. Order Notes / Delivery Instructions
                Container(
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
                          const Icon(Icons.edit_note_rounded, color: AppColors.primary, size: 20),
                          const SizedBox(width: 8),
                          Text('Order Instructions (Optional)', style: AppTextStyles.h3.copyWith(fontSize: 16)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      TextField(
                        controller: _notesController,
                        onChanged: (val) => checkoutNotifier.setNotes(val),
                        maxLines: 2,
                        decoration: InputDecoration(
                          hintText: 'e.g., Leave on the front porch table or ring door bell',
                          contentPadding: const EdgeInsets.all(12),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                            borderSide: const BorderSide(color: AppColors.border),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // 5. Payment Method Selector
                PaymentMethodSelector(
                  selectedMethod: checkoutState.selectedPaymentMethod,
                  onMethodChanged: (method) => checkoutNotifier.selectPaymentMethod(method),
                ),
                const SizedBox(height: 16),

                // 6. Summary Breakdown
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Bill Summary', style: AppTextStyles.h3.copyWith(fontSize: 16)),
                      const SizedBox(height: 12),
                      _buildLine('Subtotal', CurrencyFormatter.format(cart.subtotal)),
                      const SizedBox(height: 8),
                      _buildLine(
                        'Delivery Fee',
                        checkoutState.deliveryType == 'PICKUP'
                            ? 'FREE (Pickup)'
                            : (cart.calculatedDeliveryFee == 0
                                ? 'FREE'
                                : CurrencyFormatter.format(cart.calculatedDeliveryFee)),
                        isHighlighted: cart.calculatedDeliveryFee == 0 || checkoutState.deliveryType == 'PICKUP',
                      ),
                      if (cart.discountAmount > 0) ...[
                        const SizedBox(height: 8),
                        _buildLine(
                          'Promo Discount (${cart.couponCode})',
                          '-${CurrencyFormatter.format(cart.discountAmount)}',
                          isHighlighted: true,
                        ),
                      ],
                      const SizedBox(height: 8),
                      _buildLine('Estimated Taxes (8.5%)', CurrencyFormatter.format(cart.taxAmount)),
                      const Divider(color: AppColors.divider, height: 20),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Total to Pay', style: AppTextStyles.h2.copyWith(fontSize: 18)),
                          Text(
                            CurrencyFormatter.format(
                              checkoutState.deliveryType == 'PICKUP'
                                  ? (cart.total - cart.calculatedDeliveryFee)
                                  : cart.total,
                            ),
                            style: AppTextStyles.h2.copyWith(color: AppColors.primaryDark, fontSize: 20),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),

          // Bottom Place Order Action Bar
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
              child: CustomButton(
                text: 'Place Order • ${CurrencyFormatter.format(checkoutState.deliveryType == "PICKUP" ? (cart.total - cart.calculatedDeliveryFee) : cart.total)}',
                isLoading: checkoutState.isProcessing,
                icon: Icons.check_circle_outline_rounded,
                onPressed: () async {
                  final order = await checkoutNotifier.placeOrder();
                  if (order != null && context.mounted) {
                    context.go('/order-confirmation', extra: order);
                  }
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLine(String label, String value, {bool isHighlighted = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: AppTextStyles.bodyMedium),
        Text(
          value,
          style: AppTextStyles.bodyMedium.copyWith(
            fontWeight: FontWeight.w600,
            color: isHighlighted ? AppColors.primaryDark : AppColors.textPrimary,
          ),
        ),
      ],
    );
  }

  void _showAddAddressDialog(BuildContext context) {
    final streetController = TextEditingController();
    final cityController = TextEditingController(text: 'San Francisco');
    final postalController = TextEditingController(text: '94105');
    final recipientController = TextEditingController();
    final phoneController = TextEditingController();
    bool isSaving = false;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          title: const Text('Add Delivery Address'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: recipientController,
                  decoration: const InputDecoration(labelText: 'Recipient Name'),
                ),
                TextField(
                  controller: phoneController,
                  decoration: const InputDecoration(labelText: 'Phone Number'),
                ),
                TextField(
                  controller: streetController,
                  decoration: const InputDecoration(labelText: 'Street Address'),
                ),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: cityController,
                        decoration: const InputDecoration(labelText: 'City'),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: TextField(
                        controller: postalController,
                        decoration: const InputDecoration(labelText: 'Postal Code'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: isSaving ? null : () => Navigator.pop(ctx),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: isSaving
                  ? null
                  : () async {
                      if (streetController.text.isNotEmpty &&
                          recipientController.text.isNotEmpty) {
                        setDialogState(() => isSaving = true);
                        try {
                          final addressService = ref.read(addressServiceProvider);
                          final savedAddress = await addressService.createAddress({
                            'recipientName': recipientController.text,
                            'phone': phoneController.text,
                            'street': streetController.text,
                            'city': cityController.text,
                            'state': 'CA',
                            'postalCode': postalController.text,
                            'isDefault': true,
                          });
                          ref.read(checkoutProvider.notifier).selectAddress(savedAddress);
                          ref.invalidate(addressesProvider);
                          if (ctx.mounted) Navigator.pop(ctx);
                        } catch (e) {
                          setDialogState(() => isSaving = false);
                          if (ctx.mounted) {
                            ScaffoldMessenger.of(ctx).showSnackBar(
                              SnackBar(content: Text('Failed to save address: $e')),
                            );
                          }
                        }
                      }
                    },
              child: isSaving
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Save Address'),
            ),
          ],
        ),
      ),
    );
  }
}
