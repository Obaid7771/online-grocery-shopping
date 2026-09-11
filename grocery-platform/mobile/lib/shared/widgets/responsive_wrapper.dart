import 'package:flutter/material.dart';

/// A responsive wrapper that centers content and adds appropriate margins
/// based on screen width for web/desktop layouts.
class ResponsiveWrapper extends StatelessWidget {
  final Widget child;
  final double maxWidth;
  final double mobileBreakpoint;
  final double tabletBreakpoint;

  const ResponsiveWrapper({
    super.key,
    required this.child,
    this.maxWidth = 1000,
    this.mobileBreakpoint = 800,
    this.tabletBreakpoint = 1200,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final screenWidth = constraints.maxWidth;

        // Calculate horizontal padding based on screen width
        double horizontalPadding;
        if (screenWidth > tabletBreakpoint) {
          // Large screens: center with max width
          horizontalPadding = (screenWidth - maxWidth) / 2;
        } else if (screenWidth > mobileBreakpoint) {
          // Tablet: use percentage-based padding
          horizontalPadding = screenWidth * 0.08;
        } else {
          // Mobile: minimal padding
          horizontalPadding = 16;
        }

        return Padding(
          padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
          child: child,
        );
      },
    );
  }

  /// Get responsive horizontal padding for use in Slivers or other contexts
  static double getHorizontalPadding(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    if (screenWidth > 1200) {
      return (screenWidth - 1000) / 2;
    } else if (screenWidth > 800) {
      return screenWidth * 0.08;
    }
    return 16;
  }
}
