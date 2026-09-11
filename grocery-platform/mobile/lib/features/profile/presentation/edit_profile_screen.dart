import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../shared/widgets/custom_button.dart';
import '../../../shared/widgets/custom_text_field.dart';
import '../../../shared/widgets/responsive_wrapper.dart';
import '../../auth/providers/auth_provider.dart';
import '../providers/profile_provider.dart';

class EditProfileScreen extends ConsumerStatefulWidget {
  const EditProfileScreen({super.key});

  @override
  ConsumerState<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends ConsumerState<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _firstNameController;
  late TextEditingController _lastNameController;
  late TextEditingController _phoneController;

  @override
  void initState() {
    super.initState();
    final user = ref.read(authProvider).user;
    _firstNameController = TextEditingController(text: user?.firstName ?? '');
    _lastNameController = TextEditingController(text: user?.lastName ?? '');
    _phoneController = TextEditingController(text: user?.phone ?? '');
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;
    final profileState = ref.watch(profileNotifierProvider);
    final isLoading = profileState.isLoading;
    final horizontalPadding = ResponsiveWrapper.getHorizontalPadding(context);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Edit Profile', style: AppTextStyles.h2.copyWith(fontSize: 20)),
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
            children: [
              // Avatar with camera badge
              Center(
                child: Stack(
                  children: [
                    CircleAvatar(
                      radius: 46,
                      backgroundColor: AppColors.primarySurface,
                      child: Text(
                        user != null && user.firstName.isNotEmpty
                            ? user.firstName[0].toUpperCase()
                            : 'U',
                        style: AppTextStyles.h1.copyWith(color: AppColors.primary),
                      ),
                    ),
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: const BoxDecoration(
                          color: AppColors.primary,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.camera_alt_rounded, color: Colors.white, size: 16),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 28),

              // Fields
              CustomTextField(
                label: 'First Name',
                hintText: 'Enter your first name',
                controller: _firstNameController,
                prefixIcon: Icons.person_outline_rounded,
                validator: (val) => val == null || val.isEmpty ? 'First name is required' : null,
              ),
              const SizedBox(height: 16),

              CustomTextField(
                label: 'Last Name',
                hintText: 'Enter your last name',
                controller: _lastNameController,
                prefixIcon: Icons.person_outline_rounded,
                validator: (val) => val == null || val.isEmpty ? 'Last name is required' : null,
              ),
              const SizedBox(height: 16),

              CustomTextField(
                label: 'Phone Number',
                hintText: '+1 (555) 000-0000',
                controller: _phoneController,
                prefixIcon: Icons.phone_outlined,
                keyboardType: TextInputType.phone,
              ),
              const SizedBox(height: 16),

              // Email (Read Only)
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Email Address', style: AppTextStyles.bodySmall.copyWith(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.divider.withOpacity(0.5),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.mail_outline_rounded, color: AppColors.textTertiary, size: 20),
                        const SizedBox(width: 12),
                        Text(
                          user?.email ?? '',
                          style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textTertiary),
                        ),
                        const Spacer(),
                        const Icon(Icons.lock_outline_rounded, color: AppColors.textTertiary, size: 16),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 32),

              CustomButton(
                text: 'Save Changes',
                isLoading: isLoading,
                onPressed: () async {
                  if (_formKey.currentState!.validate()) {
                    final success = await ref
                        .read(profileNotifierProvider.notifier)
                        .updateProfile(
                          firstName: _firstNameController.text.trim(),
                          lastName: _lastNameController.text.trim(),
                          phone: _phoneController.text.trim(),
                        );

                    if (success && context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Profile updated successfully!'),
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
