import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase with retry logic
const initializeFirebase = async (retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      if (!getApps().length) {
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        
        // Set persistence to local
        await setPersistence(auth, browserLocalPersistence);
        
        // Initialize other services
        const db = getFirestore(app);
        const storage = getStorage(app);
        
        console.log('Firebase initialized successfully');
        return { app, auth, db, storage };
      } else {
        const app = getApp();
        const auth = getAuth(app);
        const db = getFirestore(app);
        const storage = getStorage(app);
        return { app, auth, db, storage };
      }
    } catch (error) {
      console.error(`Firebase initialization attempt ${i + 1} failed:`, error);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Initialize services with retry
let app, auth, db, storage;

try {
  const services = await initializeFirebase();
  app = services.app;
  auth = services.auth;
  db = services.db;
  storage = services.storage;
} catch (error) {
  console.error('Failed to initialize Firebase after retries:', error);
  // Initialize with minimal configuration for offline support
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } else {
    app = getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  }
}

export { app, auth, db, storage };
