import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyDMJtCtu4ORamOPUhWqXIJHY1hAyk0sXhs",
  authDomain: "cib-management.firebaseapp.com",
  projectId: "cib-management",
  storageBucket: "cib-management.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef1234567890",
  measurementId: "G-ABCDEF1234"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize analytics only in the browser environment
let analytics = null;
if (Platform.OS === 'web') {
  // analytics = getAnalytics(app); // This line was removed in the provided code edit, so it's commented out here
}

// Function to initialize test users
export const initializeTestUsers = async () => {
  try {
    console.log('Initializing test users...');
    
    const testUsers = [
      { email: 'admin@cib.com', password: 'Admin@123' },
      { email: 'manager@cib.com', password: 'Manager@123' },
      { email: 'employee@cib.com', password: 'Employee@123' }
    ];

    for (const user of testUsers) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
        console.log(`Created user: ${user.email}`);
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          console.log(`User ${user.email} already exists`);
        } else {
          console.error(`Error creating user ${user.email}:`, error);
        }
      }
    }
    console.log('Test users initialization complete!');
  } catch (error) {
    console.error('Error initializing test users:', error);
  }
};

export { app, auth, db };
