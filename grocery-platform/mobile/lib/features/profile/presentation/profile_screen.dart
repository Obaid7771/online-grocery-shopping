import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../shared/widgets/responsive_wrapper.dart';
import '../../auth/providers/auth_provider.dart';
import '../providers/profile_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final user = authState.user;
    final horizontalPadding = ResponsiveWrapper.getHorizontalPadding(context);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Account Profile', style: AppTextStyles.h2.copyWith(fontSize: 20)),
        centerTitle: false,
      ),
      body: ListView(
        padding: EdgeInsets.symmetric(horizontal: horizontalPadding, vertical: 16),
        children: [
          // User Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 30,
                  backgroundColor: AppColors.primarySurface,
                  child: Text(
                    user != null ? user.firstName[0].toUpperCase() : 'U',
                    style: AppTextStyles.h2.copyWith(color: AppColors.primary),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        user?.fullName ?? 'FreshCart Customer',
                        style: AppTextStyles.h3,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        user?.email ?? 'customer@freshcart.io',
                        style: AppTextStyles.bodyMedium,
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.edit_outlined, color: AppColors.primary),
                  onPressed: () => context.push('/profile/edit'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Menu Sections
          _buildMenuSection(
            title: 'Account Settings',
            items: [
              _MenuItem(
                icon: Icons.location_on_outlined,
                title: 'Delivery Addresses',
                subtitle: 'Manage home, work, and saved pins',
                onTap: () => context.push('/profile/addresses'),
              ),
              _MenuItem(
                icon: Icons.notifications_none_outlined,
                title: 'Notification Preferences',
                subtitle: 'Push notifications & order alerts',
                onTap: () => context.push('/profile/preferences'),
              ),
              _MenuItem(
                icon: Icons.receipt_long_outlined,
                title: 'Order History',
                subtitle: 'Invoices, live tracking, and reorders',
                onTap: () => context.go('/orders'),
              ),
            ],
          ),
          const SizedBox(height: 16),

          _buildMenuSection(
            title: 'Security & App',
            items: [
              _MenuItem(
                icon: Icons.lock_outline_rounded,
                title: 'Change Password',
                onTap: () => context.push('/profile/change-password'),
              ),
              _MenuItem(
                icon: Icons.help_outline_rounded,
                title: 'Help Center & FAQs',
                onTap: () {},
              ),
              _MenuItem(
                icon: Icons.privacy_tip_outlined,
                title: 'Privacy Policy',
                onTap: () {},
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Logout Button
          OutlinedButton(
            onPressed: () async {
              final confirm = await showDialog<bool>(
                context: context,
                builder: (ctx) => AlertDialog(
                  title: const Text('Log Out'),
                  content: const Text('Are you sure you want to log out of your FreshCart account?'),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(ctx, false),
                      child: const Text('Cancel'),
                    ),
                    ElevatedButton(
                      onPressed: () => Navigator.pop(ctx, true),
                      style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
                      child: const Text('Log Out'),
                    ),
                  ],
                ),
              );

              if (confirm == true) {
                await ref.read(authProvider.notifier).logout();
                if (context.mounted) {
                  context.go('/login');
                }
              }
            },
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: AppColors.errorLight),
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.logout_rounded, color: AppColors.error, size: 20),
                const SizedBox(width: 8),
                Text(
                  'Log Out',
                  style: AppTextStyles.button.copyWith(color: AppColors.error),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // Delete Account Button (GDPR)
          Center(
            child: TextButton(
              onPressed: () async {
                final confirm = await showDialog<bool>(
                  context: context,
                  builder: (ctx) => AlertDialog(
                    title: const Text('Delete Account'),
                    content: const Text(
                      'This will deactivate your FreshCart account and remove your personal addresses and saved data. This action cannot be undone.',
                    ),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(ctx, false),
                        child: const Text('Keep Account'),
                      ),
                      ElevatedButton(
                        onPressed: () => Navigator.pop(ctx, true),
                        style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
                        child: const Text('Delete Permanently'),
                      ),
                    ],
                  ),
                );

                if (confirm == true) {
                  await ref.read(profileNotifierProvider.notifier).deleteAccount();
                  if (context.mounted) {
                    context.go('/login');
                  }
                }
              },
              child: Text(
                'Delete Account',
                style: AppTextStyles.bodySmall.copyWith(
                  color: AppColors.textTertiary,
                  decoration: TextDecoration.underline,
                ),
              ),
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildMenuSection({required String title, required List<_MenuItem> items}) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 8),
            child: Text(
              title,
              style: AppTextStyles.bodySmall.copyWith(
                fontWeight: FontWeight.w700,
                color: AppColors.textTertiary,
              ),
            ),
          ),
          ...items.map(
            (item) => ListTile(
              leading: Container(
                padding: const EdgeInsets.all(8),
                decoration: const BoxDecoration(
                  color: AppColors.primarySurface,
                  shape: BoxShape.circle,
                ),
                child: Icon(item.icon, color: AppColors.primary, size: 20),
              ),
              title: Text(item.title, style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600)),
              subtitle: item.subtitle != null ? Text(item.subtitle!, style: AppTextStyles.bodySmall) : null,
              trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.textTertiary, size: 20),
              onTap: item.onTap,
            ),
          ),
        ],
      ),
    );
  }
}

class _MenuItem {
  final IconData icon;
  final String title;
  final String? subtitle;
  final VoidCallback onTap;

  _MenuItem({
    required this.icon,
    required this.title,
    this.subtitle,
    required this.onTap,
  });
}
