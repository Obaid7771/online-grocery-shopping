import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/models/address_model.dart';
import '../../../shared/models/delivery_slot_model.dart';
import '../../../shared/models/order_model.dart';
import '../../../services/order_service.dart';
import '../../../services/payment_service.dart';
import '../../../services/address_service.dart';
import '../../../services/delivery_service.dart';
import '../../cart/providers/cart_provider.dart';

final addressesProvider = FutureProvider<List<AddressModel>>((ref) async {
  final service = ref.watch(addressServiceProvider);
  return service.getAddresses();
});

final deliverySlotsProvider = FutureProvider<List<DeliverySlotModel>>((ref) async {
  final service = ref.watch(deliveryServiceProvider);
  return service.getAvailableSlots();
});

class CheckoutState {
  final String deliveryType; // 'DELIVERY' or 'PICKUP'
  final AddressModel? selectedAddress;
  final DeliverySlotModel? selectedSlot;
  final PaymentMethodType selectedPaymentMethod;
  final String notes;
  final bool isProcessing;
  final String? errorMessage;
  final OrderModel? completedOrder;

  CheckoutState({
    this.deliveryType = 'DELIVERY',
    this.selectedAddress,
    this.selectedSlot,
    this.selectedPaymentMethod = PaymentMethodType.stripe,
    this.notes = '',
    this.isProcessing = false,
    this.errorMessage,
    this.completedOrder,
  });

  CheckoutState copyWith({
    String? deliveryType,
    AddressModel? selectedAddress,
    DeliverySlotModel? selectedSlot,
    PaymentMethodType? selectedPaymentMethod,
    String? notes,
    bool? isProcessing,
    String? errorMessage,
    OrderModel? completedOrder,
  }) {
    return CheckoutState(
      deliveryType: deliveryType ?? this.deliveryType,
      selectedAddress: selectedAddress ?? this.selectedAddress,
      selectedSlot: selectedSlot ?? this.selectedSlot,
      selectedPaymentMethod: selectedPaymentMethod ?? this.selectedPaymentMethod,
      notes: notes ?? this.notes,
      isProcessing: isProcessing ?? this.isProcessing,
      errorMessage: errorMessage,
      completedOrder: completedOrder ?? this.completedOrder,
    );
  }
}

class CheckoutNotifier extends StateNotifier<CheckoutState> {
  final Ref _ref;

  CheckoutNotifier(this._ref) : super(CheckoutState());

  void setDeliveryType(String type) {
    state = state.copyWith(deliveryType: type);
  }

  void selectAddress(AddressModel address) {
    state = state.copyWith(selectedAddress: address);
  }

  void selectSlot(DeliverySlotModel slot) {
    state = state.copyWith(selectedSlot: slot);
  }

  void selectPaymentMethod(PaymentMethodType method) {
    state = state.copyWith(selectedPaymentMethod: method);
  }

  void setNotes(String notes) {
    state = state.copyWith(notes: notes);
  }

  Future<OrderModel?> placeOrder() async {
    final cart = _ref.read(cartProvider);
    if (cart.items.isEmpty) {
      state = state.copyWith(errorMessage: 'Your cart is empty.');
      return null;
    }

    if (state.deliveryType == 'DELIVERY' && state.selectedAddress == null) {
      state = state.copyWith(errorMessage: 'Please select a delivery address.');
      return null;
    }

    state = state.copyWith(isProcessing: true, errorMessage: null);

    try {
      final orderService = _ref.read(orderServiceProvider);
      final paymentService = _ref.read(paymentServiceProvider);

      // Convert cart items
      final itemsPayload = cart.items
          .map((i) => {
                'productId': i.product.id,
                'quantity': i.quantity,
              })
          .toList();

      String paymentMethodString = 'STRIPE';
      switch (state.selectedPaymentMethod) {
        case PaymentMethodType.stripe:
          paymentMethodString = 'STRIPE';
          break;
        case PaymentMethodType.applePay:
          paymentMethodString = 'APPLE_PAY';
          break;
        case PaymentMethodType.googlePay:
          paymentMethodString = 'GOOGLE_PAY';
          break;
        case PaymentMethodType.paypal:
          paymentMethodString = 'PAYPAL';
          break;
        case PaymentMethodType.cashOnDelivery:
          paymentMethodString = 'CASH_ON_DELIVERY';
          break;
      }

      // 1. Create order on backend (reserves stock atomically and books delivery slot)
      final order = await orderService.createOrder(
        deliveryType: state.deliveryType,
        addressId: state.selectedAddress?.id,
        deliverySlotId: state.selectedSlot?.id,
        notes: state.notes,
        couponCode: cart.couponCode,
        paymentMethod: paymentMethodString,
        items: itemsPayload,
      );

      OrderModel finalOrder = order;

      // 2. Process payment gateway based on selected method
      if (state.selectedPaymentMethod == PaymentMethodType.stripe ||
          state.selectedPaymentMethod == PaymentMethodType.applePay ||
          state.selectedPaymentMethod == PaymentMethodType.googlePay) {
        // Create PaymentIntent
        final intentData = await paymentService.createPaymentIntent(order.id, paymentMethodString);
        final paymentIntentId = intentData['paymentIntentId'] as String;

        // In sandbox or live app: confirm transaction with backend
        finalOrder = await paymentService.confirmPayment(order.id, paymentIntentId);
      } else if (state.selectedPaymentMethod == PaymentMethodType.paypal) {
        final paypalData = await paymentService.createPaypalOrder(order.id);
        final paypalOrderId = paypalData['paypalOrderId'] as String;
        finalOrder = await paymentService.capturePaypalOrder(order.id, paypalOrderId);
      }

      // 3. Clear cart upon successful order placement
      _ref.read(cartProvider.notifier).clearCart();

      state = state.copyWith(
        isProcessing: false,
        completedOrder: finalOrder,
      );

      return finalOrder;
    } catch (e) {
      state = state.copyWith(
        isProcessing: false,
        errorMessage: e.toString().replaceAll('Exception:', '').trim(),
      );
      return null;
    }
  }
}

final checkoutProvider =
    StateNotifierProvider<CheckoutNotifier, CheckoutState>((ref) {
  return CheckoutNotifier(ref);
});
