import 'package:flutter_test/flutter_test.dart';
import 'package:freshcart_mobile/shared/models/user_model.dart';
import '../../helpers/test_helpers.dart';

void main() {
  group('UserModel', () {
    group('constructor', () {
      test('should create user with required fields', () {
        final user = TestData.createUser();

        expect(user.id, 'test-user-id');
        expect(user.email, 'test@example.com');
        expect(user.firstName, 'John');
        expect(user.lastName, 'Doe');
        expect(user.role, 'CUSTOMER');
      });

      test('should have correct default values', () {
        final user = TestData.createUser();

        expect(user.isActive, true);
        expect(user.isEmailVerified, true);
        expect(user.phone, isNull);
        expect(user.avatarUrl, isNull);
      });
    });

    group('fullName', () {
      test('should return concatenated first and last name', () {
        final user = TestData.createUser(
          firstName: 'Jane',
          lastName: 'Smith',
        );

        expect(user.fullName, 'Jane Smith');
      });
    });

    group('fromJson', () {
      test('should parse JSON correctly', () {
        final json = TestData.userJson(
          id: 'user-123',
          email: 'jane@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
        );

        final user = UserModel.fromJson(json);

        expect(user.id, 'user-123');
        expect(user.email, 'jane@example.com');
        expect(user.firstName, 'Jane');
        expect(user.lastName, 'Smith');
        expect(user.role, 'CUSTOMER');
        expect(user.isActive, true);
        expect(user.isEmailVerified, true);
      });

      test('should handle missing optional fields', () {
        final json = {
          'id': 'minimal-user',
          'email': 'minimal@example.com',
          'firstName': 'Min',
          'lastName': 'Imal',
        };

        final user = UserModel.fromJson(json);

        expect(user.phone, isNull);
        expect(user.avatarUrl, isNull);
        expect(user.role, 'CUSTOMER');
        expect(user.isActive, true);
        expect(user.isEmailVerified, false);
      });

      test('should parse phone and avatar when present', () {
        final json = {
          ...TestData.userJson(),
          'phone': '+1234567890',
          'avatarUrl': 'https://example.com/avatar.jpg',
        };

        final user = UserModel.fromJson(json);

        expect(user.phone, '+1234567890');
        expect(user.avatarUrl, 'https://example.com/avatar.jpg');
      });

      test('should parse different roles', () {
        final json = {
          ...TestData.userJson(),
          'role': 'ADMIN',
        };

        final user = UserModel.fromJson(json);

        expect(user.role, 'ADMIN');
      });
    });

    group('toJson', () {
      test('should serialize to JSON correctly', () {
        final user = UserModel(
          id: 'user-456',
          email: 'test@test.com',
          phone: '+9876543210',
          firstName: 'Test',
          lastName: 'User',
          role: 'STORE_MANAGER',
          avatarUrl: 'https://example.com/pic.jpg',
          isActive: true,
          isEmailVerified: false,
        );

        final json = user.toJson();

        expect(json['id'], 'user-456');
        expect(json['email'], 'test@test.com');
        expect(json['phone'], '+9876543210');
        expect(json['firstName'], 'Test');
        expect(json['lastName'], 'User');
        expect(json['role'], 'STORE_MANAGER');
        expect(json['avatarUrl'], 'https://example.com/pic.jpg');
        expect(json['isActive'], true);
        expect(json['isEmailVerified'], false);
      });

      test('should roundtrip from and to JSON', () {
        final original = UserModel(
          id: 'roundtrip-id',
          email: 'roundtrip@example.com',
          firstName: 'Round',
          lastName: 'Trip',
          role: 'CUSTOMER',
          isActive: true,
          isEmailVerified: true,
        );

        final json = original.toJson();
        final restored = UserModel.fromJson(json);

        expect(restored.id, original.id);
        expect(restored.email, original.email);
        expect(restored.firstName, original.firstName);
        expect(restored.lastName, original.lastName);
        expect(restored.role, original.role);
        expect(restored.isActive, original.isActive);
        expect(restored.isEmailVerified, original.isEmailVerified);
      });
    });
  });
}
