# CIB Management System

A comprehensive business management system built with React Native and Expo, designed to help businesses manage their operations efficiently with features like production tracking, expense management, and employee management.

## Key Features

- **Authentication & Security**
  - Secure login and registration
  - Role-based access control
  - Encrypted data storage
  - Offline capabilities
  - Biometric authentication support

- **Production Management**
  - Real-time production tracking
  - Production analytics and charts
  - Batch management
  - Production history
  - Performance metrics

- **Financial Management**
  - Expense tracking and categorization
  - Revenue management
  - Financial reports generation
  - Budget monitoring
  - Transaction history

- **Employee Management**
  - Employee profiles
  - Attendance tracking
  - Performance monitoring
  - Role management
  - Access control

- **Reports & Analytics**
  - Custom report generation
  - Data visualization
  - Export to PDF
  - Chart-based analytics
  - Period-wise analysis

- **System Features**
  - Offline-first architecture
  - Data backup and restore
  - Push notifications
  - Dark/Light theme
  - Responsive design

## Tech Stack

- **Frontend Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Redux Toolkit
- **UI Components**: React Native Paper
- **Authentication**: Firebase Auth
- **Local Storage**: 
  - AsyncStorage
  - Expo SecureStore
  - React Native FS
- **Data Visualization**: react-native-chart-kit
- **Type Safety**: TypeScript
- **Date Handling**: date-fns
- **Security**: crypto-js for encryption

## Prerequisites

- Node.js >= 14
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd CIB-Management
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env file in the root directory with the following variables:
   ```
   FIREBASE_API_KEY=your_api_key
   FIREBASE_AUTH_DOMAIN=your_auth_domain
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_storage_bucket
   FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   FIREBASE_APP_ID=your_app_id
   ```

4. Start the development server:
   ```bash
   npm start
   ```

## Project Structure

```
CIB-Management/
├── app/                    # Expo Router directory
│   ├── (app)/             # Main app routes
│   ├── (auth)/            # Authentication routes
│   └── _layout.tsx        # Root layout
├── src/
│   ├── components/        # Reusable UI components
│   ├── context/           # React Context (theme, etc.)
│   ├── hooks/             # Custom React hooks
│   ├── screens/           # Screen components
│   ├── services/          # Business logic services
│   │   ├── auth.ts        # Authentication service
│   │   ├── BackupService.js
│   │   ├── EncryptionService.js
│   │   ├── NotificationService.js
│   │   └── OfflineStorage.js
│   └── store/             # Redux store and slices
├── assets/                # Static assets
└── scripts/              # Utility scripts
```

## Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web browser
- `npm test` - Run tests
- `npm run lint` - Run linting
- `npm run reset-project` - Reset project state
- `npm run initialize-users` - Initialize default users

## Security Features

- Encrypted data storage using crypto-js
- Secure authentication with Firebase
- Protected routes
- Biometric authentication support
- Secure async storage
- Offline data encryption

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository or contact the development team.
