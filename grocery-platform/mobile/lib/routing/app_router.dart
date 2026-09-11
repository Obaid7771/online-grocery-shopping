import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../features/auth/presentation/splash_screen.dart';
import '../features/auth/presentation/onboarding_screen.dart';
import '../features/auth/presentation/login_screen.dart';
import '../features/auth/presentation/register_screen.dart';
import '../features/auth/presentation/forgot_password_screen.dart';
import '../features/auth/presentation/otp_verification_screen.dart';
import '../features/home/presentation/home_screen.dart';
import '../features/categories/presentation/categories_screen.dart';
import '../features/categories/presentation/category_products_screen.dart';
import '../features/cart/presentation/cart_screen.dart';
import '../features/orders/presentation/orders_screen.dart';
import '../features/profile/presentation/profile_screen.dart';
import '../features/products/presentation/product_detail_screen.dart';
import '../features/products/presentation/search_screen.dart';
import '../features/checkout/presentation/checkout_screen.dart';
import '../features/checkout/presentation/order_confirmation_screen.dart';
import '../features/orders/presentation/order_detail_screen.dart';
import '../features/orders/presentation/live_tracking_screen.dart';
import '../features/notifications/presentation/notifications_screen.dart';
import '../features/profile/presentation/edit_profile_screen.dart';
import '../features/profile/presentation/saved_addresses_screen.dart';
import '../features/profile/presentation/change_password_screen.dart';
import '../features/profile/presentation/notification_preferences_screen.dart';
import '../shared/models/order_model.dart';
import '../features/main_scaffold.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _homeNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'homeNav');
final _categoriesNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'categoriesNav');
final _cartNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'cartNav');
final _ordersNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'ordersNav');
final _profileNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'profileNav');

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/splash',
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/onboarding',
        builder: (context, state) => const OnboardingScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/forgot-password',
        builder: (context, state) => const ForgotPasswordScreen(),
      ),
      GoRoute(
        path: '/verify-otp',
        builder: (context, state) {
          final email = state.extra as String? ?? '';
          return OtpVerificationScreen(email: email);
        },
      ),

      // Root Modals & Sub-Screens
      GoRoute(
        path: '/products/:slug',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) {
          final slug = state.pathParameters['slug'] ?? '';
          return ProductDetailScreen(slug: slug);
        },
      ),
      GoRoute(
        path: '/categories/:slug',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) {
          final slug = state.pathParameters['slug'] ?? '';
          return CategoryProductsScreen(slug: slug);
        },
      ),
      GoRoute(
        path: '/search',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const SearchScreen(),
      ),
      GoRoute(
        path: '/checkout',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const CheckoutScreen(),
      ),
      GoRoute(
        path: '/order-confirmation',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) {
          final order = state.extra as OrderModel;
          return OrderConfirmationScreen(order: order);
        },
      ),
      GoRoute(
        path: '/orders/:id',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) {
          final id = state.pathParameters['id'] ?? '';
          return OrderDetailScreen(orderId: id);
        },
      ),
      GoRoute(
        path: '/orders/:id/track',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) {
          final id = state.pathParameters['id'] ?? '';
          return LiveTrackingScreen(orderId: id);
        },
      ),
      GoRoute(
        path: '/notifications',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const NotificationsScreen(),
      ),
      GoRoute(
        path: '/profile/edit',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const EditProfileScreen(),
      ),
      GoRoute(
        path: '/profile/addresses',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const SavedAddressesScreen(),
      ),
      GoRoute(
        path: '/profile/change-password',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const ChangePasswordScreen(),
      ),
      GoRoute(
        path: '/profile/preferences',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const NotificationPreferencesScreen(),
      ),

      // Persistent Bottom Navigation Stateful Shell
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return MainScaffold(navigationShell: navigationShell);
        },
        branches: [
          // Branch 0: Home
          StatefulShellBranch(
            navigatorKey: _homeNavigatorKey,
            routes: [
              GoRoute(
                path: '/home',
                builder: (context, state) => const HomeScreen(),
              ),
            ],
          ),

          // Branch 1: Categories
          StatefulShellBranch(
            navigatorKey: _categoriesNavigatorKey,
            routes: [
              GoRoute(
                path: '/categories',
                builder: (context, state) => const CategoriesScreen(),
              ),
            ],
          ),

          // Branch 2: Cart
          StatefulShellBranch(
            navigatorKey: _cartNavigatorKey,
            routes: [
              GoRoute(
                path: '/cart',
                builder: (context, state) => const CartScreen(),
              ),
            ],
          ),

          // Branch 3: Orders
          StatefulShellBranch(
            navigatorKey: _ordersNavigatorKey,
            routes: [
              GoRoute(
                path: '/orders',
                builder: (context, state) => const OrdersScreen(),
              ),
            ],
          ),

          // Branch 4: Profile
          StatefulShellBranch(
            navigatorKey: _profileNavigatorKey,
            routes: [
              GoRoute(
                path: '/profile',
                builder: (context, state) => const ProfileScreen(),
              ),
            ],
          ),
        ],
      ),
    ],
  );
});
