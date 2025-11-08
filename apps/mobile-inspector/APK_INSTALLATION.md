# APK Installation Guide

## ✅ Release APK Built Successfully!

**APK Location:**
```
apps/mobile-inspector/android/app/build/outputs/apk/release/app-release.apk
```

**APK Details:**
- **Package**: `com.afribrok.inspector`
- **Version**: 1.0.0 (versionCode: 1)
- **Signed**: ✅ Production keystore
- **Build Type**: Release (optimized, minified)

## 📱 Install on Real Device

### Method 1: Using ADB (Recommended)

1. **Connect your Android device via USB**
2. **Enable USB Debugging** on your device:
   - Settings → About Phone → Tap "Build Number" 7 times
   - Settings → Developer Options → Enable "USB Debugging"
3. **Install the APK:**
   ```bash
   cd apps/mobile-inspector/android
   adb install app/build/outputs/apk/release/app-release.apk
   ```

### Method 2: Transfer and Install Manually

1. **Copy APK to device:**
   ```bash
   # Copy APK to device storage
   adb push apps/mobile-inspector/android/app/build/outputs/apk/release/app-release.apk /sdcard/Download/
   ```

2. **On your device:**
   - Open File Manager
   - Navigate to Downloads
   - Tap `app-release.apk`
   - Allow installation from unknown sources if prompted
   - Tap "Install"

### Method 3: Email/Cloud Transfer

1. **Upload APK to cloud storage** (Google Drive, Dropbox, etc.)
2. **Download on your device**
3. **Install** (allow unknown sources if needed)

## 🧪 Testing Checklist

### Core Features (No Auth Required):
- [ ] **Terms & Conditions**: First launch shows agreement screen
- [ ] **Home Screen**: Logo banner and 3 cards display correctly
- [ ] **Scan QR Code**: Camera opens and scans QR codes
- [ ] **Broker Verification**: Verifies QR codes via API
- [ ] **View Results**: Shows verification status and broker details
- [ ] **History**: Stores and displays scan history
- [ ] **Settings**: Shows "Sign in for Inspector Mode" (optional)

### Test Scenarios:
- [ ] **Online**: Scan QR code with internet connection
- [ ] **Offline**: Test error handling when offline
- [ ] **History**: View previous scans
- [ ] **Navigation**: Navigate between screens
- [ ] **Permissions**: Camera permission request works
- [ ] **App Icon**: Shows custom icon
- [ ] **Splash Screen**: Shows custom splash screen

## 🔍 Verify Installation

```bash
# Check if app is installed
adb shell pm list packages | grep afribrok

# Check app version
adb shell dumpsys package com.afribrok.inspector | grep versionName

# Launch app
adb shell am start -n com.afribrok.inspector/.MainActivity
```

## 📋 APK Information

- **File Size**: Check with `ls -lh`
- **Signing**: Production keystore (afribrok-inspector-release.keystore)
- **Min SDK**: 24 (Android 7.0)
- **Target SDK**: 36 (Android 14)
- **Permissions**: Camera, Internet, Storage

## ⚠️ Important Notes

1. **First Install**: You may need to allow "Install from Unknown Sources"
2. **Camera Permission**: App will request camera permission on first scan
3. **Internet Required**: Broker verification needs internet connection
4. **Terms & Conditions**: Will show on first launch

## 🐛 Troubleshooting

### "Installation failed"
- Check USB debugging is enabled
- Try: `adb install -r app-release.apk` (reinstall)

### "App not installed"
- Check device has enough storage
- Uninstall previous version first
- Check Android version (needs 7.0+)

### "Permission denied"
- Enable USB debugging
- Allow installation from unknown sources

## ✅ Next Steps

After testing on real device:
1. Test all core features
2. Verify offline functionality
3. Test camera permissions
4. Test API connectivity
5. Report any issues

