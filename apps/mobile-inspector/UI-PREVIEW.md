# Mobile Inspector UI Preview Guide

## Quick Start - Preview the UI

### Option 1: Expo Web Preview (Fastest)
```bash
cd apps/mobile-inspector
npx expo start --web
```
Opens the app in your browser for quick UI preview.

### Option 2: Expo Go App (Best Experience)
1. Install Expo Go on your phone:
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Start the dev server:
   ```bash
   cd apps/mobile-inspector
   npx expo start
   ```

3. Scan the QR code with:
   - iOS: Camera app
   - Android: Expo Go app

### Option 3: iOS Simulator / Android Emulator
```bash
# iOS Simulator (Mac only)
npx expo start --ios

# Android Emulator
npx expo start --android
```

## UI Screens Overview

### 1. Home Screen
**Location**: `src/screens/HomeScreen.tsx`

**Features**:
- **Header Section**:
  - "AfriBrok Inspector" badge (accent color)
  - Large title: "Verify brokers with QR"
  - Subtitle explaining functionality
  - Primary "Scan QR" button

- **Today Summary Card**:
  - Three pill badges showing stats:
    - ✅ Verified count (green)
    - ⚠️ Warnings count (yellow)
    - ❌ Invalid count (red)
  - Each with colored dot indicator

- **Recent Scans Card**:
  - List of recent verification scans
  - Each item shows:
    - Avatar with initials
    - Broker name
    - License number
    - Status badge
    - Time ago ("5m ago", "2h ago")
  - Tap to view details

- **Quick Simulate Card**:
  - Three buttons for testing:
    - "Verified" button
    - "Warning" button
    - "Invalid" button
  - Instantly shows results without scanning

### 2. Scan Screen
**Location**: `src/screens/ScanScreen.tsx`

**Features**:
- **Camera View** (Development Build):
  - Full-screen barcode scanner
  - Dashed border frame for alignment
  - Auto-scans QR codes
  - Haptic feedback on scan

- **Manual Input** (Expo Go):
  - Text input for QR code data
  - Placeholder: "id=BR-123;name=Jane;license=LIC-001;approved=true"
  - "Verify" button
  - Quick simulate buttons:
    - Verified (green)
    - Warning (yellow)
    - Invalid (red)

### 3. Result Screen
**Location**: `src/screens/ResultScreen.tsx`

**Features**:
- **Status Header**:
  - Large emoji (✅/⚠️/⛔️)
  - Status text (VERIFIED/WARNING/INVALID)
  - Status message

- **Broker Details Card**:
  - Avatar with initials
  - Broker name
  - License number
  - Broker ID

- **Actions Card**:
  - "Call broker" button
  - "Email broker" button
  - "Report issue" button

## Design System

### Colors
- **Primary**: `#184C8C` (Trust Blue)
- **Accent**: `#16A34A` (Verification Green)
- **Warning**: `#F59E0B` (Amber)
- **Danger**: `#EF4444` (Red)

### Typography
- **Headings**: Bold, 26px for titles
- **Body**: Regular, 15px for descriptions
- **Small**: 12px for metadata

### Spacing
- **XS**: 6px
- **SM**: 10px
- **MD**: 14px
- **LG**: 20px
- **XL**: 24px

### Components
- **Card**: White background, rounded corners (16px), shadow
- **Button**: Primary (filled) or Ghost (outlined)
- **Badge**: Rounded pill with colored background

## Visual Hierarchy

1. **Primary Action**: "Scan QR" button (prominent, primary color)
2. **Stats**: Color-coded pills for quick overview
3. **Content**: Cards with clear sections
4. **Actions**: Secondary buttons in ghost style

## Status Colors

- **Verified**: Green (`#16A34A`)
  - Background: `#ECFDF5`
  - Text: `#16A34A`

- **Warning**: Amber (`#F59E0B`)
  - Background: `#FFFBEB`
  - Text: `#F59E0B`

- **Invalid**: Red (`#EF4444`)
  - Background: `#FEF2F2`
  - Text: `#EF4444`

## Responsive Design

- Optimized for mobile portrait orientation
- Touch-friendly button sizes (min 44px height)
- Scrollable content for long lists
- Proper spacing on all screen sizes

## Navigation Flow

```
Home Screen
    ↓
[Scan QR Button]
    ↓
Scan Screen
    ↓
[Scan/Verify]
    ↓
Result Screen
    ↓
[Back to Home]
```

## Preview Tips

1. **Quick Test**: Use "Quick Simulate" buttons on Home screen
2. **Manual Input**: Use manual input in Scan screen when in Expo Go
3. **Navigation**: Swipe back or use header back button
4. **Colors**: Notice the consistent color scheme throughout

## Screenshots Locations

When you run the app, you'll see:
- Clean, modern design
- Clear visual hierarchy
- Intuitive navigation
- Professional color scheme
- Consistent branding with web apps

## Running the Preview

The dev server should now be starting. Once it's ready:
- Check terminal for QR code and URL
- Open in browser or scan with Expo Go
- Navigate through all screens to see the full UI

