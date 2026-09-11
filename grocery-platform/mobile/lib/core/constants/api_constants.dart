import 'dart:io';
import 'package:flutter/foundation.dart';

enum Environment { development, staging, production }

class ApiConstants {
  // Change this for different builds or use --dart-define
  static const Environment environment = Environment.development;

  // Production API URL
  static const String productionBaseUrl = 'https://api.freshcart.io/api/v1';
  static const String stagingBaseUrl = 'https://staging-api.freshcart.io/api/v1';

  // Configured dynamically for Android Emulator, iOS Simulator, and Web
  static String get baseUrl {
    // Check for compile-time environment override
    const envOverride = String.fromEnvironment('API_URL', defaultValue: '');
    if (envOverride.isNotEmpty) {
      return envOverride;
    }

    // Use environment-based URL for production/staging
    if (environment == Environment.production) {
      return productionBaseUrl;
    }
    if (environment == Environment.staging) {
      return stagingBaseUrl;
    }

    // Development: use local server
    if (kIsWeb) {
      return 'http://localhost:4000/api/v1';
    }
    if (Platform.isAndroid) {
      return 'http://10.0.2.2:4000/api/v1';
    }
    return 'http://localhost:4000/api/v1';
  }

  static bool get isProduction => environment == Environment.production;

  static const Duration connectTimeout = Duration(seconds: 15);
  static const Duration receiveTimeout = Duration(seconds: 15);

  // Auth Endpoints
  static const String register = '/auth/register';
  static const String login = '/auth/login';
  static const String refreshToken = '/auth/refresh-token';
  static const String logout = '/auth/logout';
  static const String forgotPassword = '/auth/forgot-password';
  static const String resetPassword = '/auth/reset-password';
  static const String verifyOtp = '/auth/verify-otp';

  // User Endpoints
  static const String userProfile = '/users/me';
  static const String updateProfile = '/users/profile';
  static const String addresses = '/users/addresses';

  // Catalog Endpoints
  static const String categories = '/categories';
  static const String products = '/products';
  static const String productSearch = '/products/search';
  static const String featuredProducts = '/products/featured';
  static const String popularProducts = '/products/popular';
  static const String recommendedProducts = '/products/recommended';

  // Cart Endpoints
  static const String cart = '/cart';
  static const String cartItems = '/cart/items';
  static const String clearCart = '/cart/clear';

  // Delivery & Slots Endpoints
  static const String deliveryZonesLookup = '/delivery/zones/lookup';
  static const String deliveryZones = '/delivery/zones';
  static const String deliverySlots = '/delivery/slots';

  // Coupons
  static const String validateCoupon = '/coupons/validate';

  // Orders
  static const String orders = '/orders';
  static const String myOrders = '/orders/my-orders';

  // Payments
  static const String createPaymentIntent = '/payments/create-intent';
  static const String confirmPayment = '/payments/confirm';
  static const String createPaypalOrder = '/payments/paypal/create';
  static const String capturePaypalOrder = '/payments/paypal/capture';

  // Notifications
  static const String notifications = '/notifications';
  static const String fcmToken = '/notifications/fcm-token';
  static const String readAllNotifications = '/notifications/read-all';

  // Storage Keys
  static const String accessTokenKey = 'freshcart_access_token';
  static const String refreshTokenKey = 'freshcart_refresh_token';
  static const String userKey = 'freshcart_user_data';
  static const String cartIdKey = 'freshcart_cart_id';
}
