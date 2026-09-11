#!/bin/bash

# FreshCart Mobile App Build Script
# Usage: ./scripts/build-mobile.sh [ios|android|all]

set -e

MOBILE_DIR="$(dirname "$0")/../mobile"
cd "$MOBILE_DIR"

echo "🛒 FreshCart Mobile Build Script"
echo "================================"

# Check Flutter installation
if ! command -v flutter &> /dev/null; then
    echo "❌ Flutter is not installed. Please install Flutter first."
    exit 1
fi

# Get dependencies
echo "📦 Getting dependencies..."
flutter pub get

# Run tests
echo "🧪 Running tests..."
flutter test || echo "⚠️ Some tests failed, continuing with build..."

build_ios() {
    echo ""
    echo "🍎 Building iOS..."
    echo "=================="

    # Check if on macOS
    if [[ "$OSTYPE" != "darwin"* ]]; then
        echo "❌ iOS builds require macOS"
        return 1
    fi

    # Build iOS release
    flutter build ios --release --no-codesign

    echo "✅ iOS build complete!"
    echo "📁 Output: build/ios/iphoneos/Runner.app"
    echo ""
    echo "Next steps:"
    echo "1. Open ios/Runner.xcworkspace in Xcode"
    echo "2. Select 'Any iOS Device' as target"
    echo "3. Product → Archive"
    echo "4. Distribute to App Store Connect"
}

build_android() {
    echo ""
    echo "🤖 Building Android..."
    echo "======================"

    # Check for signing configuration
    if [ ! -f "android/key.properties" ]; then
        echo "⚠️ Warning: android/key.properties not found"
        echo "Building debug APK instead of release..."
        flutter build apk --debug
        echo "📁 Debug APK: build/app/outputs/flutter-apk/app-debug.apk"
    else
        # Build release App Bundle (recommended for Play Store)
        echo "Building App Bundle (AAB)..."
        flutter build appbundle --release
        echo "📁 AAB: build/app/outputs/bundle/release/app-release.aab"

        # Also build APK for testing
        echo "Building APK..."
        flutter build apk --release --split-per-abi
        echo "📁 APKs: build/app/outputs/flutter-apk/"
    fi

    echo "✅ Android build complete!"
}

case "${1:-all}" in
    ios)
        build_ios
        ;;
    android)
        build_android
        ;;
    all)
        build_android
        build_ios
        ;;
    *)
        echo "Usage: $0 [ios|android|all]"
        exit 1
        ;;
esac

echo ""
echo "🎉 Build process complete!"
echo ""
echo "📚 For detailed release instructions, see:"
echo "   - iOS: mobile/ios_release_setup.md"
echo "   - Android: mobile/android_signing_setup.md"
