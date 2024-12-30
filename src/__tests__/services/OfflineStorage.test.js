import { OfflineStorage } from '../../services/OfflineStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

describe('OfflineStorage', () => {
  beforeEach(() => {
    AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('stores and retrieves data correctly', async () => {
    const testKey = 'test-key';
    const testData = { id: 1, name: 'Test' };

    await OfflineStorage.storeData(testKey, testData);
    const retrieved = await OfflineStorage.getData(testKey);

    expect(retrieved).toEqual(testData);
  });

  it('checks connectivity correctly', async () => {
    NetInfo.fetch.mockResolvedValueOnce({ isConnected: true, isInternetReachable: true });
    const isOnline = await OfflineStorage.checkConnectivity();
    expect(isOnline).toBe(true);

    NetInfo.fetch.mockResolvedValueOnce({ isConnected: false, isInternetReachable: false });
    const isOffline = await OfflineStorage.checkConnectivity();
    expect(isOffline).toBe(false);
  });

  it('queues offline changes', async () => {
    const change = {
      type: 'production',
      data: { id: 1, quantity: 100 }
    };

    await OfflineStorage.queueOfflineChange(change);
    const queue = await OfflineStorage.getData('offlineQueue');

    expect(Array.isArray(queue)).toBe(true);
    expect(queue.length).toBe(1);
    expect(queue[0].type).toBe(change.type);
    expect(queue[0].data).toEqual(change.data);
    expect(queue[0].timestamp).toBeDefined();
  });

  it('syncs offline changes when online', async () => {
    const testQueue = [
      {
        type: 'production',
        data: { id: 1, quantity: 100 },
        timestamp: new Date().toISOString()
      },
      {
        type: 'revenue',
        data: { id: 1, amount: 1000 },
        timestamp: new Date().toISOString()
      }
    ];

    await OfflineStorage.storeData('offlineQueue', testQueue);
    NetInfo.fetch.mockResolvedValueOnce({ isConnected: true, isInternetReachable: true });

    await OfflineStorage.syncOfflineChanges();
    const remainingQueue = await OfflineStorage.getData('offlineQueue');

    expect(remainingQueue).toEqual([]);
  });

  it('stores and retrieves local data with timestamp', async () => {
    const key = 'local-data';
    const data = { id: 1, value: 'test' };

    await OfflineStorage.storeLocalData(key, data);
    const retrieved = await OfflineStorage.getLocalData(key);

    expect(retrieved).toEqual(data);
  });

  it('handles offline storage errors gracefully', async () => {
    AsyncStorage.setItem.mockRejectedValueOnce(new Error('Storage error'));

    await expect(OfflineStorage.storeData('test', {}))
      .resolves.toBe(false);
  });

  it('initializes offline storage correctly', async () => {
    NetInfo.fetch.mockResolvedValueOnce({ isConnected: true, isInternetReachable: true });
    
    await OfflineStorage.initializeOfflineStorage();
    
    expect(NetInfo.addEventListener).toHaveBeenCalled();
  });

  it('refreshes data when online callback provided', async () => {
    const key = 'test-data';
    const oldData = { value: 'old' };
    const newData = { value: 'new' };
    const refreshCallback = jest.fn().mockResolvedValue(newData);

    await OfflineStorage.storeLocalData(key, oldData);
    NetInfo.fetch.mockResolvedValueOnce({ isConnected: true, isInternetReachable: true });

    const result = await OfflineStorage.getLocalData(key, refreshCallback);

    expect(refreshCallback).toHaveBeenCalled();
    expect(result).toEqual(newData);
  });
});
