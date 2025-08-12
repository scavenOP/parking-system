# 📱 Smart Parking Mobile App

Ionic Angular mobile application for the Smart Parking System with QR ticket integration.

## 🚀 Quick Start

### Development Server
```bash
npm install
npm start
```
App runs on `http://localhost:8100`

### Build for Production
```bash
npm run build --prod
```

## 📱 Mobile App Deployment

### Android APK Build

#### Prerequisites
- Install [Android Studio](https://developer.android.com/studio)
- Install Android SDK and build tools
- Set up environment variables:
  ```bash
  export ANDROID_HOME=$HOME/Android/Sdk
  export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
  ```

#### Build Steps
```bash
# 1. Add Android platform
npx cap add android

# 2. Build the web app
npm run build --prod

# 3. Copy web assets to native project
npx cap copy android

# 4. Sync native dependencies
npx cap sync android

# 5. Open in Android Studio
npx cap open android

# 6. In Android Studio:
#    - Build > Generate Signed Bundle/APK
#    - Choose APK
#    - Create/select keystore
#    - Build release APK
```

#### Direct APK Build (Command Line)
```bash
# Build debug APK
cd android
./gradlew assembleDebug

# Build release APK (requires keystore)
./gradlew assembleRelease
```

### iOS App Build

#### Prerequisites
- macOS with Xcode installed
- Apple Developer Account
- iOS device or simulator

#### Build Steps
```bash
# 1. Add iOS platform
npx cap add ios

# 2. Build the web app
npm run build --prod

# 3. Copy web assets to native project
npx cap copy ios

# 4. Sync native dependencies
npx cap sync ios

# 5. Open in Xcode
npx cap open ios

# 6. In Xcode:
#    - Select your team and bundle identifier
#    - Choose target device/simulator
#    - Product > Archive (for App Store)
#    - Product > Build (for testing)
```

## 🔧 Configuration

### API Configuration
The app uses Azure hosted backend:
- **Development**: `https://smart-parking.azurewebsites.net`
- **Production**: `https://smart-parking.azurewebsites.net`

Update in `src/environments/environment.ts` and `src/environments/environment.prod.ts`

### Capacitor Configuration
Update `capacitor.config.ts`:
```typescript
import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'com.smartparking.app',
  appName: 'Smart Parking',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Camera: {
      permissions: ['camera']
    }
  }
};

export default config;
```

## 📋 Features

### 🔐 Authentication
- User login/signup
- Session management
- Auto-logout on token expiry

### 🚗 Vehicle Management
- Add/manage vehicles
- Vehicle validation

### 🅿️ Parking System
- Real-time space availability
- Interactive floor selection
- Booking management

### 💳 Payment Integration
- Razorpay payment gateway
- Secure payment processing
- Payment history

### 🎫 QR Ticket System
- Digital ticket generation
- QR code scanning
- Ticket validation

### 📱 Mobile Features
- Touch-friendly interface
- Responsive design
- Offline capability
- Push notifications (future)

## 🛠️ Development

### Project Structure
```
src/
├── app/
│   ├── pages/           # App pages
│   ├── tabs/            # Tab navigation
│   ├── services/        # API services
│   ├── guards/          # Route guards
│   └── interceptors/    # HTTP interceptors
├── assets/              # Static assets
├── environments/        # Environment configs
└── theme/              # App styling
```

### Available Scripts
- `npm start` - Development server
- `npm run build` - Production build
- `npm run lint` - Code linting
- `npm test` - Run tests
- `npx cap sync` - Sync native projects
- `npx cap run android` - Run on Android
- `npx cap run ios` - Run on iOS

## 🔒 Security

- HTTPS API communication
- JWT token authentication
- Secure storage for sensitive data
- Input validation and sanitization

## 📦 Dependencies

### Core
- **Ionic Framework 8.0** - Mobile UI components
- **Angular 20** - Application framework
- **Capacitor 7.4** - Native bridge

### Plugins
- `@capacitor/camera` - Camera access
- `@capacitor/device` - Device information
- `@capacitor/network` - Network status
- `@capacitor/toast` - Native toasts
- `@capacitor/browser` - In-app browser

### Libraries
- `@zxing/ngx-scanner` - QR code scanning
- `js-cookie` - Cookie management
- `rxjs` - Reactive programming

## 🚀 Deployment

### Web Deployment
```bash
npm run build --prod
# Deploy www/ folder to web server
```

### App Store Deployment

#### Google Play Store
1. Build signed APK/AAB
2. Create Play Console account
3. Upload to Play Console
4. Complete store listing
5. Submit for review

#### Apple App Store
1. Archive in Xcode
2. Upload to App Store Connect
3. Complete app information
4. Submit for review

## 🔧 Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Ionic cache
npx ionic cache clear
```

#### Android Build Issues
```bash
# Clean and rebuild
cd android
./gradlew clean
./gradlew build
```

#### iOS Build Issues
```bash
# Clean derived data in Xcode
# Product > Clean Build Folder
```

### Performance Optimization
- Enable production mode
- Use lazy loading for routes
- Optimize images and assets
- Implement virtual scrolling for large lists

## 📱 Testing

### Device Testing
```bash
# Android
npx cap run android --target=device

# iOS
npx cap run ios --target=device
```

### Browser Testing
```bash
npm start
# Test in Chrome DevTools mobile view
```

## 🎯 Future Enhancements

- Push notifications
- Offline data sync
- Biometric authentication
- Dark mode support
- Multi-language support
- Analytics integration

---

**Ready for mobile deployment!** 📱🚗✨