# Mobile Inspector Troubleshooting Guide

## Common Errors and Solutions

### Error: "expected dynamic type 'boolean', but had type 'string'"

This error typically occurs when:
1. **App.json configuration**: Boolean values being read as strings
2. **Barcode Scanner**: Native module configuration issues
3. **Expo Go limitations**: Some native modules don't work in Expo Go

**Solutions:**

#### 1. Clear Cache and Restart
```bash
cd apps/mobile-inspector
npx expo start --clear
```

#### 2. Use Development Build Instead of Expo Go
Expo Go has limitations with native modules. Use a development build:
```bash
# Build development client
npx expo run:ios
# or
npx expo run:android
```

#### 3. Check app.json Configuration
Ensure all boolean values are actual booleans, not strings:
```json
{
  "ios": {
    "supportsTablet": false  // NOT "false"
  }
}
```

#### 4. Fallback to Manual Input
If scanner doesn't work, the app automatically falls back to manual input mode in Expo Go.

### Camera Permission Issues

**Error**: Camera access denied

**Solution:**
1. Grant camera permission in device settings
2. Restart the app
3. On iOS: Settings → Privacy → Camera → Enable for Expo Go/Inspector app
4. On Android: Settings → Apps → Inspector → Permissions → Camera → Enable

### API Connection Errors

**Error**: Unable to connect to verification service

**Solutions:**

1. **Check API URL Configuration**:
   ```bash
   # In app.json or .env
   EXPO_PUBLIC_API_BASE_URL=https://api.afribrok.com
   ```

2. **Test API Endpoint**:
   ```bash
   curl https://api.afribrok.com/v1/verify/AFR-QR-156
   ```

3. **Verify CORS Settings**: Ensure API allows mobile app requests

### QR Code Not Scanning

**Issues:**
- Camera doesn't open
- Scanner doesn't detect QR codes
- Error when scanning

**Solutions:**

1. **Use Development Build**: Expo Go doesn't support camera scanning
   ```bash
   npx expo run:ios
   ```

2. **Use Manual Input**: The app supports manual QR code entry
   - Paste QR code data in the input field
   - Format: `id=AFR-QR-156` or `{"id":"AFR-QR-156"}`

3. **Check QR Code Format**: Ensure QR code contains:
   - QR code ID (e.g., `AFR-QR-156`)
   - Or JSON format: `{"id":"AFR-QR-156"}`

### Metro Bundler Errors

**Error**: Metro bundler connection issues

**Solutions:**

1. **Restart Metro**:
   ```bash
   npx expo start --clear
   ```

2. **Reset Cache**:
   ```bash
   rm -rf node_modules
   pnpm install
   npx expo start --clear
   ```

3. **Kill Existing Processes**:
   ```bash
   # Kill Metro bundler
   lsof -ti:8081 | xargs kill -9
   ```

### TypeScript Errors

**Error**: Type mismatch or type errors

**Solutions:**

1. **Run Type Check**:
   ```bash
   pnpm typecheck
   ```

2. **Fix Type Errors**: Update types in affected files

3. **Restart TS Server**: In your IDE, restart TypeScript server

## Quick Fixes

### Reset Everything
```bash
cd apps/mobile-inspector

# Clear all caches
rm -rf node_modules .expo .turbo
pnpm install
npx expo start --clear
```

### Test Without Camera
Use manual input mode or quick simulate buttons to test verification flow without camera.

### Check Logs
```bash
# View Expo logs
npx expo start

# View device logs (iOS)
xcrun simctl spawn booted log stream

# View device logs (Android)
adb logcat
```

## Environment-Specific Issues

### iOS Simulator
- Camera scanning won't work (no camera)
- Use manual input or quick simulate

### Android Emulator
- Camera might not work properly
- Use development build on real device

### Expo Go
- No camera scanning support
- Use manual input mode
- Build development client for full features

## Still Having Issues?

1. **Check Expo Version**:
   ```bash
   npx expo --version
   ```

2. **Update Dependencies**:
   ```bash
   pnpm update
   ```

3. **Verify App Configuration**:
   - Check `app.json` for correct settings
   - Verify `package.json` dependencies
   - Ensure TypeScript configuration is correct

4. **Create Development Build**:
   For full camera support, always use a development build:
   ```bash
   # iOS
   npx expo run:ios

   # Android
   npx expo run:android
   ```

## Getting Help

- **Expo Documentation**: https://docs.expo.dev
- **React Native Docs**: https://reactnative.dev
- **Expo Forums**: https://forums.expo.dev

