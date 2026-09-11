# Android Release Signing Setup

## Step 1: Generate Release Keystore

Run this command in the `mobile/android` directory:

```bash
keytool -genkey -v -keystore freshcart-release.keystore \
  -alias freshcart \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**Important:** Keep this keystore file safe! You'll need it for all future updates.

## Step 2: Create key.properties

Create `android/key.properties` (DO NOT commit to git):

```properties
storePassword=<your-store-password>
keyPassword=<your-key-password>
keyAlias=freshcart
storeFile=../freshcart-release.keystore
```

## Step 3: Update build.gradle

In `android/app/build.gradle`, add before `android {`:

```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

Inside `android {`, add:

```gradle
signingConfigs {
    release {
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
        storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
        storePassword keystoreProperties['storePassword']
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

## Step 4: Build Release APK/AAB

```bash
# Build App Bundle (recommended for Play Store)
flutter build appbundle --release

# Or build APK
flutter build apk --release --split-per-abi
```

## Step 5: Upload to Google Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app
3. Go to Release > Production
4. Upload the AAB file from `build/app/outputs/bundle/release/`
5. Complete store listing and submit for review

## Security Notes

- Never commit `key.properties` or `.keystore` files to git
- Add to `.gitignore`:
  ```
  android/key.properties
  *.keystore
  *.jks
  ```
- Store backup of keystore securely (Google Drive, 1Password, etc.)
- Losing the keystore means you cannot update the app!
