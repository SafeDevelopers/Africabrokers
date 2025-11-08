# Android Production Readiness Checklist

## ✅ Completed Features

### Core Functionality
- [x] **App Icon & Splash Screen**: Configured with custom assets
- [x] **QR Code Scanning**: Full camera integration with expo-camera
- [x] **API Integration**: Connected to AfriBrok Core API
- [x] **Authentication**: Keycloak OIDC integration
- [x] **History Storage**: AsyncStorage for scan history
- [x] **Terms & Conditions**: First-launch agreement screen
- [x] **Deep Linking**: Configured (afribrokinspector://)
- [x] **Offline Support**: Error handling and fallback mechanisms

### Android Configuration
- [x] **Package Name**: `com.afribrok.inspector`
- [x] **Permissions**: Camera, Internet, Storage configured
- [x] **Adaptive Icon**: Configured with brand colors
- [x] **Portrait Orientation**: Locked to portrait mode
- [x] **Min SDK**: 24 (Android 7.0)
- [x] **Target SDK**: 36 (Android 14)

## ⚠️ Required for Production

### 1. Android Camera Permission Description
**Status**: Missing  
**Action**: Add camera permission description in `app.json`

### 2. Production Keystore
**Status**: Using debug keystore  
**Action**: Generate production keystore for release builds

### 3. ProGuard Rules
**Status**: Basic rules exist  
**Action**: Add custom ProGuard rules for React Native/Expo

### 4. Version Management
**Status**: Basic versioning  
**Action**: Set up version code increment strategy

### 5. Network Security Configuration
**Status**: Not configured  
**Action**: Add network security config for HTTPS

### 6. Release Build Configuration
**Status**: Using debug signing  
**Action**: Configure release signing with production keystore

## 📋 Testing Checklist

- [ ] Test on Android 7.0+ (API 24+)
- [ ] Test on Android 14 (API 34)
- [ ] Test camera permissions flow
- [ ] Test QR code scanning on real devices
- [ ] Test API connectivity
- [ ] Test offline functionality
- [ ] Test authentication flow
- [ ] Test deep linking
- [ ] Test Terms & Conditions flow
- [ ] Test history storage
- [ ] Test app icon and splash screen
- [ ] Test on different screen sizes

## 🔧 Build Commands

### Development Build
```bash
cd apps/mobile-inspector
npx expo run:android
```

### Release Build (After keystore setup)
```bash
cd apps/mobile-inspector/android
./gradlew assembleRelease
```

### Install APK
```bash
adb install app/build/outputs/apk/release/app-release.apk
```

## 📱 App Store Preparation

### Google Play Store Requirements
- [ ] App icon (1024x1024)
- [ ] Feature graphic (1024x500)
- [ ] Screenshots (at least 2)
- [ ] Privacy policy URL
- [ ] App description
- [ ] Category selection
- [ ] Content rating

## 🔐 Security Checklist

- [ ] API keys secured (not in code)
- [ ] HTTPS only for API calls
- [ ] ProGuard enabled for release
- [ ] No debug logging in production
- [ ] Secure storage for sensitive data
- [ ] Certificate pinning (optional)

