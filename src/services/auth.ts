import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  User as FirebaseUser,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { auth, db } from './firebase';

interface AuthResponse {
  success: boolean;
  user?: FirebaseUser;
  error?: string;
  token?: string;
  role?: string;
}

class AuthService {
  private static instance: AuthService;
  private isOnline: boolean = true;
  private isInitialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;
  private unsubscribeNetInfo: (() => void) | null = null;

  private constructor() {
    this.initializationPromise = this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      // Set persistence based on platform
      if (Platform.OS === 'web') {
        try {
          await setPersistence(auth, browserLocalPersistence);
        } catch (error) {
          console.warn('Failed to set local persistence, falling back to session:', error);
          await setPersistence(auth, browserSessionPersistence);
        }
      }
      
      // Setup network status monitoring based on platform
      if (Platform.OS === 'web') {
        // Web platform
        if (typeof window !== 'undefined') {
          this.isOnline = window.navigator?.onLine ?? true;
          window.addEventListener('online', this.handleOnline);
          window.addEventListener('offline', this.handleOffline);
        }
      } else {
        // React Native platform
        const netInfo = await NetInfo.fetch();
        this.isOnline = netInfo.isConnected ?? true;
        
        // Subscribe to network state updates
        this.unsubscribeNetInfo = NetInfo.addEventListener(state => {
          this.isOnline = state.isConnected ?? true;
          if (state.isConnected) {
            console.log('Online status: Connected');
          } else {
            console.log('Online status: Disconnected');
          }
        });
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Auth service initialization error:', error);
      // Still mark as initialized even if there's an error
      this.isInitialized = true;
      throw error;
    }
  }

  private handleOnline = () => {
    console.log('Online status: Connected');
    this.isOnline = true;
  };

  private handleOffline = () => {
    console.log('Online status: Disconnected');
    this.isOnline = false;
  };

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initializationPromise) {
      try {
        await this.initializationPromise;
      } catch (error) {
        console.warn('Auth service initialization failed:', error);
      }
    }
  }

  private async getCachedUserData(): Promise<any> {
    try {
      const userData = await AsyncStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting cached user data:', error);
      return null;
    }
  }

  private async clearLocalData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['user', 'authToken']);
    } catch (error) {
      console.error('Error clearing local data:', error);
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    await this.ensureInitialized();

    try {
      // First try to sign in
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();

      // Try to get user data from Firestore
      try {
        const userDocRef = doc(db, 'users', userCredential.user.uid);
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.data();
        const role = userData?.role || (email.toLowerCase() === 'admin@example.com' ? 'admin' : 'user');

        // Cache the user data
        const userToCache = {
          id: userCredential.user.uid,
          email: userCredential.user.email,
          name: userCredential.user.displayName,
          role
        };
        await AsyncStorage.setItem('user', JSON.stringify(userToCache));
        await AsyncStorage.setItem('authToken', token);

        return {
          success: true,
          user: userCredential.user,
          token,
          role
        };
      } catch (firestoreError) {
        console.warn('Firestore error, using cached/fallback data:', firestoreError);
        const cachedUser = await this.getCachedUserData();
        const role = cachedUser?.role || (email.toLowerCase() === 'admin@example.com' ? 'admin' : 'user');

        return {
          success: true,
          user: userCredential.user,
          token,
          role
        };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.code === 'auth/network-request-failed' || !this.isOnline) {
        const cachedUser = await this.getCachedUserData();
        if (cachedUser && cachedUser.email === email) {
          return {
            success: true,
            user: cachedUser as any,
            role: cachedUser.role
          };
        }
      }

      return {
        success: false,
        error: this.isOnline ? error.message : 'Network error. Please check your connection.'
      };
    }
  }

  async signOut(): Promise<void> {
    await this.ensureInitialized();

    try {
      // First, clear local data
      await this.clearLocalData();
      console.log('Local data cleared');

      // Try to sign out from Firebase only if online
      if (this.isOnline) {
        try {
          await firebaseSignOut(auth);
          console.log('Firebase sign out successful');
        } catch (firebaseError) {
          console.warn('Firebase sign out failed:', firebaseError);
        }
      } else {
        console.log('Offline mode: Skipping Firebase sign out');
      }

      // Clean up event listeners
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.removeEventListener('online', this.handleOnline);
        window.removeEventListener('offline', this.handleOffline);
      } else if (this.unsubscribeNetInfo) {
        this.unsubscribeNetInfo();
      }
    } catch (error) {
      console.error('Sign out error:', error);
      // Make sure local data is cleared even if there's an error
      await this.clearLocalData();
      throw error;
    }
  }

  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    await this.ensureInitialized();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      
      // Update user profile with name
      await updateProfile(userCredential.user, {
        displayName: name
      });

      // Determine role
      const role = email.toLowerCase() === 'admin@example.com' ? 'admin' : 'user';

      // Store user data in Firestore
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userData = {
        email: email,
        name: name,
        role: role,
        createdAt: new Date().toISOString()
      };
      await setDoc(userDocRef, userData);
      
      // Store auth data
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('user', JSON.stringify({
        id: userCredential.user.uid,
        email: email,
        name: name,
        role
      }));
      
      return {
        success: true,
        user: userCredential.user,
        token,
        role
      };
    } catch (error: any) {
      console.error('Register error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async checkBiometrics(): Promise<boolean> {
    await this.ensureInitialized();

    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) return false;

      const enrolled = await LocalAuthentication.isEnrolledAsync();
      return enrolled;
    } catch (error) {
      console.error('Biometric check error:', error);
      return false;
    }
  }

  async authenticateWithBiometrics(): Promise<boolean> {
    await this.ensureInitialized();

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to continue',
        fallbackLabel: 'Use password',
      });
      return result.success;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return false;
    }
  }

  async getCurrentUser(): Promise<FirebaseUser | null> {
    await this.ensureInitialized();

    return auth.currentUser;
  }
}

export const authService = AuthService.getInstance();
