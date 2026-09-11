# iOS Release Setup

## Prerequisites

1. Apple Developer Account ($99/year) - [developer.apple.com](https://developer.apple.com)
2. Mac with Xcode installed (latest version recommended)
3. Valid Apple ID with developer enrollment

## Step 1: Configure Bundle Identifier

In Xcode, open `ios/Runner.xcworkspace`:

1. Select Runner project in navigator
2. Select Runner target
3. Under "Signing & Capabilities":
   - Team: Select your Apple Developer Team
   - Bundle Identifier: `com.freshcart.app`
   - Enable "Automatically manage signing"

## Step 2: Update App Information

Edit `ios/Runner/Info.plist`:

```xml
<key>CFBundleDisplayName</key>
<string>FreshCart</string>

<key>CFBundleName</key>
<string>FreshCart</string>

<key>CFBundleIdentifier</key>
<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>

<key>CFBundleVersion</key>
<string>1</string>

<key>CFBundleShortVersionString</key>
<string>1.0.0</string>
```

## Step 3: Add Required Permissions

Add to `Info.plist` if not present:

```xml
<!-- Location for delivery address -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>FreshCart needs your location to show nearby stores and delivery options.</string>

<!-- Camera for profile photo -->
<key>NSCameraUsageDescription</key>
<string>FreshCart needs camera access to take profile photos.</string>

<!-- Photo library for profile photo -->
<key>NSPhotoLibraryUsageDescription</key>
<string>FreshCart needs photo library access to select profile photos.</string>
```

## Step 4: Configure App Icons

1. Prepare 1024x1024 app icon (no transparency)
2. Use [App Icon Generator](https://appicon.co/) or Xcode Assets
3. Replace icons in `ios/Runner/Assets.xcassets/AppIcon.appiconset/`

## Step 5: Build Release

```bash
cd mobile

# Get dependencies
flutter pub get

# Build iOS release
flutter build ios --release

# Open in Xcode
open ios/Runner.xcworkspace
```

## Step 6: Archive in Xcode

1. Select "Any iOS Device" as build destination
2. Product → Archive
3. Wait for archive to complete
4. Organizer window opens automatically

## Step 7: Upload to App Store Connect

1. In Organizer, select the archive
2. Click "Distribute App"
3. Select "App Store Connect"
4. Select "Upload"
5. Follow prompts (leave defaults)
6. Wait for upload to complete

## Step 8: App Store Connect Configuration

Go to [App Store Connect](https://appstoreconnect.apple.com):

1. **Create New App**
   - Platform: iOS
   - Name: FreshCart - Grocery Delivery
   - Primary Language: English
   - Bundle ID: Select `com.freshcart.app`
   - SKU: `freshcart-ios-001`

2. **App Information**
   - Category: Food & Drink
   - Content Rights: Does not contain third-party content
   - Age Rating: Complete questionnaire

3. **Pricing and Availability**
   - Price: Free
   - Availability: All territories

4. **App Privacy**
   - Privacy Policy URL: https://freshcart.io/privacy
   - Data collection: Complete questionnaire

5. **Version Information**
   - Screenshots: Upload for required device sizes
   - Description: Copy from APP_STORE_METADATA.md
   - Keywords: Add relevant keywords
   - Support URL: https://freshcart.io/support
   - What's New: Add release notes

6. **Build**
   - Select the uploaded build
   - Add export compliance info

7. **Submit for Review**

## TestFlight (Beta Testing)

Before production release, test via TestFlight:

1. In App Store Connect, go to TestFlight tab
2. Add internal testers (up to 100)
3. Add external testers (up to 10,000)
4. Wait for beta review (usually faster)

## Common Issues

### Signing Issues
- Ensure certificates are valid in Keychain
- Check provisioning profiles in Xcode
- Try: Xcode → Preferences → Accounts → Download Manual Profiles

### Build Failures
```bash
# Clean build
flutter clean
cd ios && pod deintegrate && pod install
flutter build ios --release
```

### Upload Issues
- Check internet connection
- Verify bundle ID matches App Store Connect
- Ensure all required metadata is filled
