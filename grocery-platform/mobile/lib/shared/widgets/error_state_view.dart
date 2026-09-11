import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import 'custom_button.dart';

class ErrorStateView extends StatelessWidget {
  final String errorMessage;
  final VoidCallback onRetry;

  const ErrorStateView({
    super.key,
    required this.errorMessage,
    required this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: const BoxDecoration(
                color: AppColors.errorLight,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.cloud_off_rounded, size: 48, color: AppColors.error),
            ),
            const SizedBox(height: 20),
            Text('Something Went Wrong', style: AppTextStyles.h3),
            const SizedBox(height: 8),
            Text(
              errorMessage,
              style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textTertiary),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: 140,
              child: CustomButton(
                text: 'Try Again',
                onPressed: onRetry,
                height: 44,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
