import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

jest.mock('expo-file-system', () => ({
  documentDirectory: 'file://test/',
  makeDirectoryAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
  readAsStringAsync: jest.fn(),
}));
jest.mock('expo-sharing');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('firebase/storage');
jest.mock('../../config/firebase', () => ({
  storage: {}
}));

import BackupService from '../../services/BackupService';
import { storage } from '../../config/firebase';

describe('BackupService', () => {
  const mockBackupDir = 'file://test/backups/';
  const mockBackupData = { test: 'data' };
  const mockBackupFile = mockBackupDir + 'backup_20240101.json';

  beforeEach(() => {
    jest.clearAllMocks();
    FileSystem.makeDirectoryAsync.mockResolvedValue(undefined);
    FileSystem.writeAsStringAsync.mockResolvedValue(undefined);
    FileSystem.readAsStringAsync.mockResolvedValue(JSON.stringify(mockBackupData));
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.setItem.mockResolvedValue(undefined);
    ref.mockReturnValue({});
    uploadBytes.mockResolvedValue({});
    getDownloadURL.mockResolvedValue('https://test.com/backup.json');
  });

  describe('initialize', () => {
    it('creates backup directory if it does not exist', async () => {
      await BackupService.initialize();
      
      expect(FileSystem.makeDirectoryAsync).toHaveBeenCalledWith(
        mockBackupDir,
        { intermediates: true }
      );
    });
  });

  describe('createBackup', () => {
    it('creates a backup file with current data', async () => {
      const data = { test: 'data' };
      
      await BackupService.createBackup(data);

      expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
        expect.stringContaining(mockBackupDir),
        JSON.stringify(data)
      );
    });

    it('uploads backup to cloud if enabled', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify({
        autoBackup: true
      }));
      const mockStorageRef = {};
      ref.mockReturnValue(mockStorageRef);
      const data = { test: 'data' };

      await BackupService.createBackup(data);

      expect(ref).toHaveBeenCalled();
      expect(uploadBytes).toHaveBeenCalledWith(
        mockStorageRef,
        expect.any(Blob)
      );
    });
  });

  describe('restoreBackup', () => {
    it('restores data from a valid backup file', async () => {
      const result = await BackupService.restoreBackup(mockBackupFile);
      expect(result).toEqual(mockBackupData);
    });

    it('throws error for invalid backup data', async () => {
      FileSystem.readAsStringAsync.mockResolvedValue('invalid json');

      await expect(BackupService.restoreBackup(mockBackupFile))
        .rejects.toThrow('Invalid backup file');
    });
  });

  describe('checkBackupNeeded', () => {
    it('returns true if no recent backup exists', async () => {
      const oldDate = '2024-01-01';
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify({
        lastBackup: oldDate,
        autoBackup: true,
        frequency: 'daily'
      }));

      const result = await BackupService.checkBackupNeeded();
      expect(result).toBe(true);
    });

    it('returns false if recent backup exists', async () => {
      const today = new Date().toISOString().split('T')[0];
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify({
        lastBackup: today,
        autoBackup: true,
        frequency: 'daily'
      }));

      const result = await BackupService.checkBackupNeeded();
      expect(result).toBe(false);
    });
  });
});
