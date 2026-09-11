class RouteNames {
  static const String splash = '/splash';
  static const String onboarding = '/onboarding';
  static const String login = '/login';
  static const String register = '/register';
  static const String forgotPassword = '/forgot-password';
  static const String verifyOtp = '/verify-otp';

  // Bottom Navigation Tabs
  static const String home = '/home';
  static const String categories = '/categories';
  static const String cart = '/cart';
  static const String orders = '/orders';
  static const String profile = '/profile';

  // Deep Sub-Routes
  static const String productDetail = '/products/:slug';
  static const String search = '/search';
  static const String categoryProducts = '/categories/:slug';
  static const String checkout = '/checkout';
  static const String orderConfirmation = '/order-confirmation';
  static const String orderDetail = '/orders/:id';
  static const String liveTracking = '/orders/:id/track';
  static const String notifications = '/notifications';
  static const String editProfile = '/profile/edit';
  static const String savedAddresses = '/profile/addresses';
  static const String changePassword = '/profile/change-password';
  static const String notificationPreferences = '/profile/preferences';
}
