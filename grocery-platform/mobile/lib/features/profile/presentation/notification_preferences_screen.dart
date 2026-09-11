import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../shared/widgets/responsive_wrapper.dart';

class NotificationPreferencesScreen extends StatefulWidget {
  const NotificationPreferencesScreen({super.key});

  @override
  State<NotificationPreferencesScreen> createState() => _NotificationPreferencesScreenState();
}

class _NotificationPreferencesScreenState extends State<NotificationPreferencesScreen> {
  bool _orderStatus = true;
  bool _driverTracking = true;
  bool _promotions = true;
  bool _emailReceipts = true;

  @override
  Widget build(BuildContext context) {
    final horizontalPadding = ResponsiveWrapper.getHorizontalPadding(context);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Notification Settings', style: AppTextStyles.h2.copyWith(fontSize: 20)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => context.pop(),
        ),
      ),
      body: ListView(
        padding: EdgeInsets.symmetric(horizontal: horizontalPadding, vertical: 16),
        children: [
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                SwitchListTile(
                  title: Text('Order Status Updates', style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w700)),
                  subtitle: Text('Receive notifications when order is packed or ready', style: AppTextStyles.bodySmall),
                  value: _orderStatus,
                  activeColor: AppColors.primary,
                  onChanged: (val) => setState(() => _orderStatus = val),
                ),
                const Divider(color: AppColors.divider, height: 1),
                SwitchListTile(
                  title: Text('Driver Telemetry & Arrival', style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w700)),
                  subtitle: Text('Live updates when driver is approaching your address', style: AppTextStyles.bodySmall),
                  value: _driverTracking,
                  activeColor: AppColors.primary,
                  onChanged: (val) => setState(() => _driverTracking = val),
                ),
                const Divider(color: AppColors.divider, height: 1),
                SwitchListTile(
                  title: Text('Deals & Promotional Discounts', style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w700)),
                  subtitle: Text('Weekly coupons, seasonal organic sales, and special offers', style: AppTextStyles.bodySmall),
                  value: _promotions,
                  activeColor: AppColors.primary,
                  onChanged: (val) => setState(() => _promotions = val),
                ),
                const Divider(color: AppColors.divider, height: 1),
                SwitchListTile(
                  title: Text('Email Invoices & Receipts', style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w700)),
                  subtitle: Text('Itemized digital receipts sent upon order delivery', style: AppTextStyles.bodySmall),
                  value: _emailReceipts,
                  activeColor: AppColors.primary,
                  onChanged: (val) => setState(() => _emailReceipts = val),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
