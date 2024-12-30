# CIB Management System

A comprehensive business management system built with React Native and Expo, designed to help businesses manage their operations efficiently.

## Features

- **Dashboard**: Real-time overview of business metrics
  - Total Revenue, Expenses, and Net Profit tracking
  - Revenue trends visualization
  - Expense breakdown analysis
  - Quick actions for common tasks

- **Production Management**
  - Track production quantities
  - Monitor production status
  - Record production dates
  - Manage product inventory

- **Revenue Management**
  - Record sales and revenue
  - Track payment status
  - Generate revenue reports
  - View revenue trends

- **Expense Tracking**
  - Categorize expenses
  - Track expense dates
  - Monitor expense trends
  - Generate expense reports

- **Employee Management**
  - Employee information tracking
  - Salary management
  - Loan tracking
  - Employee performance monitoring

- **Reports Generation**
  - Customizable reports
  - Export functionality
  - Data visualization
  - Period-wise analysis

## User Roles & Access Levels

The system supports multiple user roles with different access levels:

### Admin
- Full system access
- User management
- System configuration
- Access to all reports and analytics
- Can create/modify all user roles

### Manager
- Access to dashboard and reports
- Employee management
- Production oversight
- Revenue and expense tracking
- Limited system configuration

### Accountant
- Revenue management
- Expense tracking
- Financial reports
- Employee salary management
- Loan processing

### Production Supervisor
- Production management
- Inventory tracking
- Production reports
- Basic employee oversight
- Quality control records

### Employee
- Personal profile access
- View assigned tasks
- Submit production records
- Request loans
- View personal reports

### Default Access Restrictions
- Sensitive financial data limited to Admin and Accountant
- User management restricted to Admin
- System configuration limited to Admin
- Report generation based on role permissions
- Data modification tracked with user stamps

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router with file-based routing
- **State Management**: Redux with Redux Toolkit
- **UI Components**: React Native Paper
- **Charts**: react-native-chart-kit
- **Authentication**: Firebase Auth
- **Storage**: AsyncStorage for local persistence
- **Type Safety**: TypeScript

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/CIB-Management.git
   cd CIB-Management
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Run on your preferred platform:
   - Press `i` to run on iOS Simulator
   - Press `a` to run on Android Emulator
   - Scan QR code with Expo Go app on your device

## Project Structure

```
CIB-Management/
├── app/                    # File-based routing directory
│   ├── (auth)/            # Authentication routes
│   └── (tabs)/            # Main app tabs
├── src/
│   ├── components/        # Reusable components
│   ├── constants/         # App constants and theme
│   ├── context/          # React Context providers
│   ├── hooks/            # Custom React hooks
│   ├── redux/            # Redux store and slices
│   ├── screens/          # Screen components
│   └── services/         # API and service functions
├── assets/               # Static assets
└── docs/                # Documentation
```

## Development

- **TypeScript**: The project uses TypeScript for type safety
- **Code Style**: ESLint and Prettier for consistent code formatting
- **Testing**: Jest for unit testing
- **State Management**: Redux for global state, Context for theme
- **Navigation**: File-based routing with Expo Router

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter)
Project Link: [https://github.com/yourusername/CIB-Management](https://github.com/yourusername/CIB-Management)
