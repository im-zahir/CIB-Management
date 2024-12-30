import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'your-secret-key'; // In production, this should be stored securely

// Encrypt data before storing
const encryptData = (data) => {
  try {
    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(data),
      ENCRYPTION_KEY
    ).toString();
    return encryptedData;
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
};

// Decrypt stored data
const decryptData = (encryptedData) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decryptedData;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

// Store data with encryption
const storeData = async (key, value) => {
  try {
    const encryptedData = encryptData(value);
    if (encryptedData) {
      await AsyncStorage.setItem(key, encryptedData);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Storage error:', error);
    return false;
  }
};

// Retrieve and decrypt data
const getData = async (key) => {
  try {
    const encryptedData = await AsyncStorage.getItem(key);
    if (encryptedData) {
      return decryptData(encryptedData);
    }
    return null;
  } catch (error) {
    console.error('Retrieval error:', error);
    return null;
  }
};

// Check network status
const checkConnectivity = async () => {
  try {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected && netInfo.isInternetReachable;
  } catch (error) {
    console.error('Network check error:', error);
    return false;
  }
};

// Queue for storing offline changes
const queueOfflineChange = async (change) => {
  try {
    const queue = await getData('offlineQueue') || [];
    queue.push({
      ...change,
      timestamp: new Date().toISOString(),
    });
    await storeData('offlineQueue', queue);
  } catch (error) {
    console.error('Queue error:', error);
  }
};

// Sync offline changes when back online
const syncOfflineChanges = async () => {
  try {
    const queue = await getData('offlineQueue') || [];
    if (queue.length === 0) return;

    const isOnline = await checkConnectivity();
    if (!isOnline) return;

    // Process each queued change
    for (const change of queue) {
      try {
        // Implement your API calls here based on change type
        switch (change.type) {
          case 'production':
            // await api.updateProduction(change.data);
            break;
          case 'revenue':
            // await api.updateRevenue(change.data);
            break;
          case 'expense':
            // await api.updateExpense(change.data);
            break;
          case 'employee':
            // await api.updateEmployee(change.data);
            break;
        }
      } catch (error) {
        console.error('Sync error for change:', change, error);
        // Keep failed changes in queue
        continue;
      }
    }

    // Clear successfully synced changes
    await storeData('offlineQueue', []);
  } catch (error) {
    console.error('Sync error:', error);
  }
};

// Store local data for offline access
const storeLocalData = async (key, data) => {
  try {
    await storeData(key, {
      data,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Local storage error:', error);
  }
};

// Get local data with optional online refresh
const getLocalData = async (key, onlineRefreshCallback) => {
  try {
    const localData = await getData(key);
    const isOnline = await checkConnectivity();

    if (isOnline && onlineRefreshCallback) {
      // Refresh data from server
      const onlineData = await onlineRefreshCallback();
      if (onlineData) {
        await storeLocalData(key, onlineData);
        return onlineData;
      }
    }

    return localData?.data || null;
  } catch (error) {
    console.error('Local data retrieval error:', error);
    return null;
  }
};

// Initialize offline storage
const initializeOfflineStorage = async () => {
  try {
    // Set up network change listener
    NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        syncOfflineChanges();
      }
    });

    // Initial sync attempt
    const isOnline = await checkConnectivity();
    if (isOnline) {
      await syncOfflineChanges();
    }
  } catch (error) {
    console.error('Initialization error:', error);
  }
};

export const OfflineStorage = {
  storeData,
  getData,
  checkConnectivity,
  queueOfflineChange,
  syncOfflineChanges,
  storeLocalData,
  getLocalData,
  initializeOfflineStorage,
};
