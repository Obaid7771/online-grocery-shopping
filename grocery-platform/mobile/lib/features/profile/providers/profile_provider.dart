import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/models/address_model.dart';
import '../../../services/user_service.dart';
import '../../auth/providers/auth_provider.dart';

final savedAddressesProvider =
    FutureProvider.autoDispose<List<AddressModel>>((ref) async {
  final userService = ref.watch(userServiceProvider);
  return userService.getAddresses();
});

class ProfileNotifier extends StateNotifier<AsyncValue<void>> {
  final Ref _ref;

  ProfileNotifier(this._ref) : super(const AsyncValue.data(null));

  Future<bool> updateProfile({
    String? firstName,
    String? lastName,
    String? phone,
    String? avatarUrl,
  }) async {
    state = const AsyncValue.loading();
    try {
      final updatedUser = await _ref.read(userServiceProvider).updateProfile(
            firstName: firstName,
            lastName: lastName,
            phone: phone,
            avatarUrl: avatarUrl,
          );
      _ref.read(authProvider.notifier).setUser(updatedUser);
      state = const AsyncValue.data(null);
      return true;
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return false;
    }
  }

  Future<bool> changePassword(String currentPassword, String newPassword) async {
    state = const AsyncValue.loading();
    try {
      await _ref.read(userServiceProvider).changePassword(currentPassword, newPassword);
      state = const AsyncValue.data(null);
      return true;
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return false;
    }
  }

  Future<bool> createAddress(Map<String, dynamic> payload) async {
    try {
      await _ref.read(userServiceProvider).createAddress(payload);
      _ref.invalidate(savedAddressesProvider);
      return true;
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return false;
    }
  }

  Future<bool> deleteAddress(String id) async {
    try {
      await _ref.read(userServiceProvider).deleteAddress(id);
      _ref.invalidate(savedAddressesProvider);
      return true;
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return false;
    }
  }

  Future<bool> setDefaultAddress(String id) async {
    try {
      await _ref.read(userServiceProvider).setDefaultAddress(id);
      _ref.invalidate(savedAddressesProvider);
      return true;
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return false;
    }
  }

  Future<bool> deleteAccount() async {
    state = const AsyncValue.loading();
    try {
      await _ref.read(userServiceProvider).deleteAccount();
      await _ref.read(authProvider.notifier).logout();
      state = const AsyncValue.data(null);
      return true;
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return false;
    }
  }
}

final profileNotifierProvider =
    StateNotifierProvider<ProfileNotifier, AsyncValue<void>>((ref) {
  return ProfileNotifier(ref);
});
