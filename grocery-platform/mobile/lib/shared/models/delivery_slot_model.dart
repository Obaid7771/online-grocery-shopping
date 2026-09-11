import 'package:intl/intl.dart';

class DeliverySlotModel {
  final String id;
  final DateTime slotDate;
  final String startTime;
  final String endTime;
  final int maxCapacity;
  final int bookedCount;
  final int availableSlots;
  final bool isAvailable;

  DeliverySlotModel({
    required this.id,
    required this.slotDate,
    required this.startTime,
    required this.endTime,
    required this.maxCapacity,
    required this.bookedCount,
    required this.availableSlots,
    required this.isAvailable,
  });

  String get displayWindow {
    return '$startTime - $endTime';
  }

  String get displayDate {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final target = DateTime(slotDate.year, slotDate.month, slotDate.day);

    if (target == today) {
      return 'Today, ${DateFormat('MMM d').format(slotDate)}';
    } else if (target == today.add(const Duration(days: 1))) {
      return 'Tomorrow, ${DateFormat('MMM d').format(slotDate)}';
    }
    return DateFormat('EEE, MMM d').format(slotDate);
  }

  factory DeliverySlotModel.fromJson(Map<String, dynamic> json) {
    return DeliverySlotModel(
      id: json['id'] as String,
      slotDate: DateTime.parse(json['slotDate'] as String),
      startTime: json['startTime'] as String? ?? '09:00',
      endTime: json['endTime'] as String? ?? '11:00',
      maxCapacity: json['maxCapacity'] as int? ?? 25,
      bookedCount: json['bookedCount'] as int? ?? 0,
      availableSlots: json['availableSlots'] as int? ?? 0,
      isAvailable: json['isAvailable'] as bool? ?? true,
    );
  }
}
