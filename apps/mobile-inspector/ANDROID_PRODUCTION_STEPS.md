# Android Production Readiness - Complete Steps

## ✅ What's Already Done

### Core Features
1. ✅ **App Icon & Splash Screen** - Configured with custom assets
2. ✅ **QR Code Scanning** - Full camera integration working
3. ✅ **API Integration** - Connected to AfriBrok Core API
4. ✅ **Authentication** - Keycloak OIDC integration
5. ✅ **History Storage** - AsyncStorage working
6. ✅ **Terms & Conditions** - First-launch screen implemented
7. ✅ **Deep Linking** - Configured (afribrokinspector://)
8. ✅ **Permissions** - Camera, Internet, Storage configured

### Android Configuration
1. ✅ **Package Name** - `com.afribrok.inspector`
2. ✅ **Min SDK** - 24 (Android 7.0)
3. ✅ **Target SDK** - 36 (Android 14)
4. ✅ **Adaptive Icon** - Configured
5. ✅ **Portrait Orientation** - Locked
6. ✅ **ProGuard Rules** - Updated with React Native/Expo rules

## ⚠️ Required Steps for Production

### Step 1: Generate Production Keystore ⚠️ CRITICAL

**Why**: Google Play requires signed APKs. Without a production keystore, you cannot publish updates.

**Action**: Follow `PRODUCTION_KEYSTORE_GUIDE.md` to:
1. Generate production keystore
2. Create `keystore.properties` file
3. Update `build.gradle` to use production keystore
4. **BACKUP THE KEYSTORE** - If lost, you cannot update the app!

**Command**:
```bash
cd apps/mobile-inspector/android/app
keytool -genkeypair -v -storetype PKCS12 -keystore afribrok-inspector-release.keystore -alias afribrok-inspector-key -keyalg RSA -keysize 2048 -validity 10000
```

### Step 2: Update Version Management

**Current**: `versionCode 1`, `versionName "1.0.0"`

**Action**: Update `android/app/build.gradle`:
```gradle
defaultConfig {
    versionCode 1  // Increment for each release
    versionName "1.0.0"  // Semantic versioning
}
```

**Best Practice**: 
- Increment `versionCode` for each release (required by Google Play)
- Use semantic versioning for `versionName` (e.g., 1.0.1, 1.1.0)

### Step 3: Test on Real Devices

**Action**: Test on:
- [ ] Android 7.0+ (API 24)
- [ ] Android 14 (API 34)
- [ ] Different screen sizes
- [ ] Different manufacturers (Samsung, Google, etc.)

**Test Checklist**:
- [ ] Camera permissions flow
- [ ] QR code scanning
- [ ] API connectivity
- [ ] Offline functionality
- [ ] Authentication flow
- [ ] History storage
- [ ] Terms & Conditions flow
- [ ] Deep linking
- [ ] App icon and splash screen

### Step 4: Network Security Configuration (Optional but Recommended)

**Why**: Ensures secure HTTPS connections and prevents man-in-the-middle attacks.

**Action**: Create `android/app/src/main/res/xml/network_security_config.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">api.afribrok.com</domain>
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </domain-config>
</network-security-config>
```

Then add to `AndroidManifest.xml`:
```xml
<application
    android:networkSecurityConfig="@xml/network_security_config"
    ...>
```

### Step 5: Build Release APK

**After keystore setup**:
```bash
cd apps/mobile-inspector/android
./gradlew assembleRelease
```

**Output**: `app/build/outputs/apk/release/app-release.apk`

### Step 6: Test Release Build

**Action**:
1. Install release APK on test device
2. Test all functionality
3. Verify app icon and splash screen
4. Test camera permissions
5. Test API connectivity

**Command**:
```bash
adb install app/build/outputs/apk/release/app-release.apk
```

### Step 7: Google Play Store Preparation

**Required Assets**:
- [ ] App icon (512x512 PNG)
- [ ] Feature graphic (1024x500 PNG)
- [ ] Screenshots (at least 2, max 8)
  - Phone: 16:9 or 9:16, min 320px, max 3840px
  - Tablet: 16:9 or 9:16, min 320px, max 3840px
- [ ] App description (4000 chars max)
- [ ] Short description (80 chars max)
- [ ] Privacy policy URL
- [ ] Content rating

**Store Listing Checklist**:
- [ ] App name: "AfriBrok Inspector"
- [ ] Category: Business or Productivity
- [ ] Content rating: Everyone or Teen
- [ ] Privacy policy URL
- [ ] Support email
- [ ] Website URL

### Step 8: Final Testing

**Before Publishing**:
- [ ] Test on multiple devices
- [ ] Test on different Android versions
- [ ] Test offline functionality
- [ ] Test camera permissions
- [ ] Test API connectivity
- [ ] Test authentication flow
- [ ] Test deep linking
- [ ] Verify app icon and splash screen
- [ ] Check for crashes (use Firebase Crashlytics or similar)

## 📋 Current Status Summary

### ✅ Completed (Ready)
- Core functionality
- Android configuration
- Permissions
- ProGuard rules
- App assets (icon, splash)

### ⚠️ Required Before Production
1. **Production keystore** (CRITICAL)
2. **Version management** (Update version codes)
3. **Testing on real devices**
4. **Release build testing**

### 📝 Optional Enhancements
- Network security configuration
- Crash reporting (Firebase Crashlytics)
- Analytics (Firebase Analytics)
- Push notifications
- App update mechanism

## 🚀 Quick Start for Production

1. **Generate keystore** (see `PRODUCTION_KEYSTORE_GUIDE.md`)
2. **Update build.gradle** with keystore configuration
3. **Test on real devices**
4. **Build release APK**: `./gradlew assembleRelease`
5. **Test release APK**
6. **Prepare Google Play assets**
7. **Upload to Google Play Console**

## 📞 Support

If you encounter issues:
1. Check `TROUBLESHOOTING.md`
2. Review `ANDROID_PRODUCTION_CHECKLIST.md`
3. Check Android logs: `adb logcat`

