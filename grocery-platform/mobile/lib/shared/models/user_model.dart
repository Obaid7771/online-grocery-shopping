class UserModel {
  final String id;
  final String email;
  final String? phone;
  final String firstName;
  final String lastName;
  final String role;
  final String? avatarUrl;
  final bool isActive;
  final bool isEmailVerified;

  UserModel({
    required this.id,
    required this.email,
    this.phone,
    required this.firstName,
    required this.lastName,
    required this.role,
    this.avatarUrl,
    required this.isActive,
    required this.isEmailVerified,
  });

  String get fullName => '$firstName $lastName';

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String,
      email: json['email'] as String,
      phone: json['phone'] as String?,
      firstName: json['firstName'] as String,
      lastName: json['lastName'] as String,
      role: json['role'] as String? ?? 'CUSTOMER',
      avatarUrl: json['avatarUrl'] as String?,
      isActive: json['isActive'] as bool? ?? true,
      isEmailVerified: json['isEmailVerified'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'phone': phone,
      'firstName': firstName,
      'lastName': lastName,
      'role': role,
      'avatarUrl': avatarUrl,
      'isActive': isActive,
      'isEmailVerified': isEmailVerified,
    };
  }
}
