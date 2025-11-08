# Mobile Inspector App (Expo)

React Native/Expo app for street enforcement officers to verify broker QR codes.

## Features

- **QR Code Scanning**: Scan broker QR codes using device camera
- **API Integration**: Verifies brokers via AfriBrok Core API
- **Offline Support**: Falls back to local parsing when API is unavailable
- **Real-time Verification**: Instant broker status checking
- **Audit Trail**: Track verification history

## API Configuration

The app connects to the AfriBrok Core API for broker verification.

### Environment Variables

Create a `.env` file in the mobile-inspector directory:

```bash
# Production API URL (CapRover deployment)
EXPO_PUBLIC_API_BASE_URL=https://api.afribrok.com

# Or for local development
# EXPO_PUBLIC_API_BASE_URL=http://localhost:4000
```

### App Configuration

The API URL can also be set in `app.json`:

```json
{
  "extra": {
    "apiBaseUrl": "https://api.afribrok.com"
  }
}
```

## QR Code Format

The app supports multiple QR code formats:

1. **QR Code ID Format**: `AFR-QR-156`
2. **JSON Format**: `{"id":"AFR-QR-156","code":"AFR-QR-156"}`
3. **Key-Value Format**: `id=AFR-QR-156;code=AFR-QR-156`

The app will:
1. Extract the QR code ID from the scanned data
2. Call the API endpoint: `GET /v1/verify/{qrCodeId}`
3. Display broker verification status
4. Fall back to local parsing if API is unavailable

## API Endpoint

The app uses the following API endpoint:

```
GET /v1/verify/{qrCodeId}
```

**Response:**
```json
{
  "valid": true,
  "broker": {
    "id": "broker-123",
    "licenseNumber": "LIC-AB-0001",
    "status": "approved",
    "rating": 4.8,
    "approvedAt": "2025-01-15T10:00:00Z",
    "strikeCount": 0
  },
  "tenant": {
    "name": "Ethiopia - Addis Ababa",
    "key": "ethiopia-addis",
    "brandConfig": {...}
  },
  "verifiedAt": "2025-01-20T12:00:00Z",
  "qrCodeId": "AFR-QR-156"
}
```

## Alignment with Web Verify Page

The mobile app uses the same verification logic as the web marketplace verify page:

- **Web**: `/verify` page in `apps/web-marketplace/app/verify/page.tsx`
- **Mobile**: Verification via API in `src/utils/verify.ts`

Both use the same API endpoint: `/v1/verify/{qrCodeId}`

## Development

### Prerequisites

- Node.js 20+
- pnpm 8.15.0+
- Expo CLI or EAS CLI
- iOS Simulator / Android Emulator (for testing)

### Setup

```bash
cd apps/mobile-inspector
pnpm install
```

### Running Locally

```bash
# Start Expo dev server
pnpm dev

# Or with Expo Go
expo start

# For development build
expo run:ios
expo run:android
```

### Environment Variables

Set your API URL:
```bash
export EXPO_PUBLIC_API_BASE_URL=http://localhost:4000
```

## Camera Scanning

### Expo Go Limitations

In Expo Go, native camera modules are not available. The app falls back to manual QR code input.

### Development Build

For real camera scanning:
1. Build a development client: `eas build --profile development`
2. Install on device
3. Camera scanning will work with real device camera

### Production Build

```bash
# iOS
eas build --platform ios --profile production

# Android
eas build --platform android --profile production
```

## CapRover Deployment Configuration

When deploying to CapRover:

1. **Update API URL in app.json:**
   ```json
   {
     "extra": {
       "apiBaseUrl": "https://api.afribrok.com"
     }
   }
   ```

2. **Or use environment variable:**
   ```bash
   EXPO_PUBLIC_API_BASE_URL=https://api.afribrok.com
   ```

3. **Build and deploy:**
   ```bash
   # Build with production API URL
   eas build --platform ios --profile production
   eas build --platform android --profile production
   ```

## API Verification Flow

1. **User scans QR code** → Extracts QR code ID
2. **Calls API** → `GET /v1/verify/{qrCodeId}`
3. **API responds** → Returns broker verification status
4. **App displays result** → Verified/Warning/Invalid

### Fallback Behavior

If API call fails:
- Falls back to local QR parsing
- Still displays verification results
- Shows "(Local verification)" indicator

## Integration with Admin Panel

The mobile inspector app works with:
- **Admin Panel**: Creates and manages QR codes for brokers
- **Core API**: Provides verification endpoint
- **Web Verify**: Uses same verification logic

## Troubleshooting

### API Connection Issues

1. **Check API URL:**
   ```bash
   # Verify the API URL is correct
   echo $EXPO_PUBLIC_API_BASE_URL
   ```

2. **Test API endpoint:**
   ```bash
   curl https://api.afribrok.com/v1/verify/AFR-QR-156
   ```

3. **Check CORS settings** in core-api (should allow mobile app requests)

### QR Code Not Scanning

1. **Check camera permissions** in device settings
2. **Use development build** (Expo Go doesn't support camera)
3. **Try manual input** to test verification flow

### Verification Always Fails

1. **Verify QR code format** matches expected format
2. **Check API endpoint** is accessible
3. **Review API logs** for error messages
4. **Test with web verify page** to isolate issues

## Security Considerations

- API requests should use HTTPS in production
- QR codes should be signed/verified to prevent tampering
- Rate limiting should be implemented on verification endpoint
- Mobile app should validate QR code format before API call

## Next Steps

- [ ] Add offline sync for verification history
- [ ] Implement QR code signing/verification
- [ ] Add geolocation tracking for inspections
- [ ] Implement photo capture for violations
- [ ] Add sync with backend for audit trail
