# TextoHRMS Mobile - Field Workforce Companion

TextoHRMS Mobile is a robust React Native application built with Expo, designed for field employees to manage their attendance and synchronize their real-time location with the organization's central dashboard.

## ✨ Features

- **Dynamic Attendance**: Intelligent check-in/out system that validates proximity to designated office zones.
- **Background Location Sync**: Uses `expo-task-manager` and `expo-location` to reliably track staff movement even when the app is in the background or the screen is off.
- **Geofence Awareness**: Automatic detection of workplace boundaries with visual feedback.
- **Attendance History**: Visualized historical records of work sessions grouped by date.
- **Optimized Data Usage**: Intelligent throttling of location updates (syncing every 2 minutes) to preserve battery and data.
- **Secure Persistence**: Uses `react-native-mmkv` for high-performance, encrypted local storage of session data.

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- Expo Go app on your mobile device (or an Android/iOS emulator)

### 2. Environment Configuration
Ensure your API endpoint is correctly configured in `services/api.ts`:
```typescript
const API_URL = 'http://YOUR_LOCAL_IP:3000/api'; // Or your deployed Vercel URL
```

### 3. Installation
```bash
npm install
```

### 4. Running the App
```bash
npx expo start
```
Scan the QR code with your Expo Go app or press `a` for Android / `i` for iOS to open in an emulator.

## 🛠️ Tech Stack
- **Framework**: [Expo](https://expo.dev/) / [React Native](https://reactnative.dev/)
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based)
- **State Management**: React Context API
- **Storage**: [react-native-mmkv](https://github.com/mrousavy/react-native-mmkv)
- **Networking**: [Axios](https://axios-http.com/)
- **Tracking**: `expo-location`, `expo-task-manager`

## 📁 Directory Structure
```text
texto-client/
├── app/              # Application screens and routing
├── components/       # Reusable UI components
├── context/          # State providers (Attendance, Auth)
├── services/         # API clients and background task definitions
└── assets/           # Images, fonts, and static resources
```

## 📄 License
This project is licensed under the MIT License.
