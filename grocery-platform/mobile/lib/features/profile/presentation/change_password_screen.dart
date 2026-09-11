import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../shared/widgets/custom_button.dart';
import '../../../shared/widgets/custom_text_field.dart';
import '../../../shared/widgets/responsive_wrapper.dart';
import '../providers/profile_provider.dart';

class ChangePasswordScreen extends ConsumerStatefulWidget {
  const ChangePasswordScreen({super.key});

  @override
  ConsumerState<ChangePasswordScreen> createState() => _ChangePasswordScreenState();
}

class _ChangePasswordScreenState extends ConsumerState<ChangePasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _currentPasswordCtrl = TextEditingController();
  final _newPasswordCtrl = TextEditingController();
  final _confirmPasswordCtrl = TextEditingController();

  @override
  void dispose() {
    _currentPasswordCtrl.dispose();
    _newPasswordCtrl.dispose();
    _confirmPasswordCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final profileState = ref.watch(profileNotifierProvider);
    final isLoading = profileState.isLoading;
    final horizontalPadding = ResponsiveWrapper.getHorizontalPadding(context);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Change Password', style: AppTextStyles.h2.copyWith(fontSize: 20)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.symmetric(horizontal: horizontalPadding, vertical: 20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Protect your account with a secure, strong password.',
                style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
              ),
              const SizedBox(height: 24),

              CustomTextField(
                label: 'Current Password',
                hintText: 'Enter current password',
                controller: _currentPasswordCtrl,
                isPassword: true,
                prefixIcon: Icons.lock_outline_rounded,
                validator: (val) =>
                    val == null || val.isEmpty ? 'Please enter current password' : null,
              ),
              const SizedBox(height: 16),

              CustomTextField(
                label: 'New Password',
                hintText: 'Minimum 8 characters with numbers & symbols',
                controller: _newPasswordCtrl,
                isPassword: true,
                prefixIcon: Icons.lock_reset_rounded,
                validator: (val) {
                  if (val == null || val.length < 8) {
                    return 'Password must be at least 8 characters';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              CustomTextField(
                label: 'Confirm New Password',
                hintText: 'Repeat new password',
                controller: _confirmPasswordCtrl,
                isPassword: true,
                prefixIcon: Icons.lock_reset_rounded,
                validator: (val) {
                  if (val != _newPasswordCtrl.text) {
                    return 'Passwords do not match';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 32),

              CustomButton(
                text: 'Update Password',
                isLoading: isLoading,
                onPressed: () async {
                  if (_formKey.currentState!.validate()) {
                    final success = await ref
                        .read(profileNotifierProvider.notifier)
                        .changePassword(
                          _currentPasswordCtrl.text,
                          _newPasswordCtrl.text,
                        );

                    if (success && context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Password updated successfully!'),
                          backgroundColor: AppColors.success,
                        ),
                      );
                      context.pop();
                    }
                  }
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
