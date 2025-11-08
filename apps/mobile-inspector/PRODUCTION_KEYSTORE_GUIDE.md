# Production Keystore Guide for Android

## Generate Production Keystore

### Step 1: Generate the Keystore

```bash
cd apps/mobile-inspector/android/app
keytool -genkeypair -v -storetype PKCS12 -keystore afribrok-inspector-release.keystore -alias afribrok-inspector-key -keyalg RSA -keysize 2048 -validity 10000
```

**Important Information to Provide:**
- **Keystore password**: Choose a strong password (save it securely!)
- **Key password**: Can be same as keystore password
- **Name**: Your name or organization name
- **Organizational Unit**: Department or team
- **Organization**: AfriBrok
- **City**: Your city
- **State**: Your state/province
- **Country Code**: Two-letter country code (e.g., ET, US)

### Step 2: Create `keystore.properties` file

Create a file at `apps/mobile-inspector/android/keystore.properties`:

```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=afribrok-inspector-key
storeFile=afribrok-inspector-release.keystore
```

**⚠️ IMPORTANT**: 
- Add `keystore.properties` to `.gitignore` (never commit passwords!)
- Store the keystore file securely (backup in multiple locations)
- If you lose the keystore, you cannot update the app on Google Play!

### Step 3: Update `build.gradle`

Update `apps/mobile-inspector/android/app/build.gradle`:

```gradle
// Load keystore properties
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    // ... existing config ...
    
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            if (keystorePropertiesFile.exists()) {
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
            }
        }
    }
    
    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro"
        }
    }
}
```

### Step 4: Build Release APK

```bash
cd apps/mobile-inspector/android
./gradlew assembleRelease
```

The signed APK will be at:
`apps/mobile-inspector/android/app/build/outputs/apk/release/app-release.apk`

## Security Best Practices

1. **Never commit keystore files or passwords to Git**
2. **Backup keystore in multiple secure locations**
3. **Use a password manager for keystore passwords**
4. **Limit access to keystore files**
5. **Use different keystores for different apps**

## Troubleshooting

### Error: "Keystore file not found"
- Check that `keystore.properties` path is correct
- Verify `storeFile` path in `keystore.properties` is relative to `android/app/`

### Error: "Wrong password"
- Double-check passwords in `keystore.properties`
- Ensure no extra spaces or special characters

### Error: "Key alias not found"
- Verify `keyAlias` matches the alias used when creating the keystore
- List aliases: `keytool -list -v -keystore afribrok-inspector-release.keystore`

