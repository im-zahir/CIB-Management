# CIB-Management Database Schema

## Collections

### Users
```javascript
{
  id: string,              // Firebase Auth UID
  email: string,           // User's email
  role: string,            // 'admin' | 'manager' | 'employee'
  name: string,            // Full name
  createdAt: timestamp,    // Account creation date
  lastLogin: timestamp,    // Last login timestamp
  settings: {              // User preferences
    darkMode: boolean,
    notifications: boolean
  }
}
```

### Productions
```javascript
{
  id: string,              // Auto-generated
  date: timestamp,         // Production date
  product: string,         // Product name
  quantity: number,        // Quantity produced
  createdBy: string,       // User ID who created
  createdAt: timestamp,    // Creation timestamp
  updatedAt: timestamp,    // Last update timestamp
  notes: string,           // Optional notes
  status: string          // 'completed' | 'in-progress' | 'planned'
}
```

### Revenues
```javascript
{
  id: string,              // Auto-generated
  date: timestamp,         // Revenue date
  product: string,         // Product name
  quantity: number,        // Quantity sold
  amount: number,          // Revenue amount
  status: string,          // 'paid' | 'pending' | 'overdue'
  customer: {              // Customer details
    name: string,
    contact: string
  },
  paymentMethod: string,   // Payment method used
  createdBy: string,       // User ID who created
  createdAt: timestamp,    // Creation timestamp
  updatedAt: timestamp     // Last update timestamp
}
```

### Expenses
```javascript
{
  id: string,              // Auto-generated
  date: timestamp,         // Expense date
  category: string,        // Expense category
  description: string,     // Expense description
  amount: number,          // Expense amount
  paymentMethod: string,   // Payment method used
  receipt: string,         // Receipt URL (optional)
  createdBy: string,       // User ID who created
  createdAt: timestamp,    // Creation timestamp
  updatedAt: timestamp     // Last update timestamp
}
```

### Employees
```javascript
{
  id: string,              // Auto-generated
  name: string,            // Full name
  designation: string,     // Job title
  salary: number,          // Monthly salary
  joiningDate: timestamp,  // Start date
  contact: {               // Contact information
    email: string,
    phone: string,
    address: string
  },
  documents: [{            // Employee documents
    type: string,          // Document type
    url: string,           // Document URL
    uploadedAt: timestamp  // Upload date
  }],
  loans: [{                // Loan records
    id: string,            // Loan ID
    amount: number,        // Loan amount
    date: timestamp,       // Loan date
    reason: string,        // Loan reason
    status: string,        // 'active' | 'paid'
    payments: [{           // Repayment records
      amount: number,
      date: timestamp
    }]
  }],
  createdAt: timestamp,    // Record creation date
  updatedAt: timestamp     // Last update date
}
```

### Settings
```javascript
{
  id: string,              // 'app_settings'
  notifications: {         // Notification settings
    paymentReminders: boolean,
    inventoryAlerts: boolean,
    salaryReminders: boolean
  },
  inventory: {             // Inventory settings
    lowStockThreshold: number
  },
  backup: {                // Backup settings
    lastBackup: timestamp,
    autoBackup: boolean,
    frequency: string      // 'daily' | 'weekly' | 'monthly'
  },
  updatedAt: timestamp     // Last update timestamp
}
```

### OfflineQueue
```javascript
{
  id: string,              // Auto-generated
  type: string,            // 'production' | 'revenue' | 'expense' | 'employee'
  action: string,          // 'create' | 'update' | 'delete'
  data: object,            // Changed data
  timestamp: timestamp,    // When change was made
  synced: boolean,         // Whether synced to server
  retryCount: number,      // Number of sync attempts
  error: string           // Last error message (if any)
}
```

## Indexes

### Productions
- date (ascending)
- product (ascending)
- createdAt (descending)

### Revenues
- date (ascending)
- status (ascending)
- createdAt (descending)

### Expenses
- date (ascending)
- category (ascending)
- createdAt (descending)

### Employees
- name (ascending)
- designation (ascending)
- joiningDate (ascending)

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Authentication check
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Role check
    function hasRole(role) {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == role;
    }
    
    // Admin check
    function isAdmin() {
      return hasRole('admin');
    }
    
    // Manager check
    function isManager() {
      return hasRole('manager') || isAdmin();
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
      allow write: if isAdmin();
    }
    
    // Productions collection
    match /productions/{productionId} {
      allow read: if isAuthenticated();
      allow write: if isManager();
    }
    
    // Revenues collection
    match /revenues/{revenueId} {
      allow read: if isAuthenticated();
      allow write: if isManager();
    }
    
    // Expenses collection
    match /expenses/{expenseId} {
      allow read: if isAuthenticated();
      allow write: if isManager();
    }
    
    // Employees collection
    match /employees/{employeeId} {
      allow read: if isAuthenticated();
      allow write: if isManager();
    }
    
    // Settings collection
    match /settings/{document=**} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
  }
}
