import 'package:mocktail/mocktail.dart';
import 'package:freshcart_mobile/core/network/api_client.dart';
import 'package:freshcart_mobile/core/storage/secure_storage_service.dart';
import 'package:freshcart_mobile/services/auth_service.dart';
import 'package:freshcart_mobile/services/cart_service.dart';
import 'package:freshcart_mobile/services/product_service.dart';
import 'package:freshcart_mobile/services/category_service.dart';
import 'package:freshcart_mobile/services/order_service.dart';

// Mock classes
class MockApiClient extends Mock implements ApiClient {}

class MockSecureStorageService extends Mock implements SecureStorageService {}

class MockAuthService extends Mock implements AuthService {}

class MockCartService extends Mock implements CartService {}

class MockProductService extends Mock implements ProductService {}

class MockCategoryService extends Mock implements CategoryService {}

class MockOrderService extends Mock implements OrderService {}

// Fallback values for registration
void registerFallbackValues() {
  // Register any fallback values needed for when() calls
}
