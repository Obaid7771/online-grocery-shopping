class AddressModel {
  final String id;
  final String label;
  final String recipientName;
  final String phone;
  final String street;
  final String? apartment;
  final String city;
  final String state;
  final String postalCode;
  final String country;
  final bool isDefault;
  final String? deliveryInstructions;

  AddressModel({
    required this.id,
    this.label = 'Home',
    required this.recipientName,
    required this.phone,
    required this.street,
    this.apartment,
    required this.city,
    required this.state,
    required this.postalCode,
    this.country = 'USA',
    this.isDefault = false,
    this.deliveryInstructions,
  });

  String get formattedAddress {
    final apt = apartment != null && apartment!.isNotEmpty ? ' Apt $apartment,' : '';
    return '$street,$apt $city, $state $postalCode';
  }

  factory AddressModel.fromJson(Map<String, dynamic> json) {
    return AddressModel(
      id: json['id'] as String,
      label: json['label'] as String? ?? 'Home',
      recipientName: json['recipientName'] as String? ?? '',
      phone: json['phone'] as String? ?? '',
      street: json['street'] as String? ?? '',
      apartment: json['apartment'] as String?,
      city: json['city'] as String? ?? '',
      state: json['state'] as String? ?? '',
      postalCode: json['postalCode'] as String? ?? '',
      country: json['country'] as String? ?? 'USA',
      isDefault: json['isDefault'] as bool? ?? false,
      deliveryInstructions: json['deliveryInstructions'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'label': label,
      'recipientName': recipientName,
      'phone': phone,
      'street': street,
      'apartment': apartment,
      'city': city,
      'state': state,
      'postalCode': postalCode,
      'country': country,
      'isDefault': isDefault,
      'deliveryInstructions': deliveryInstructions,
    };
  }
}
