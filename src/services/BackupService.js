import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ref, uploadBytes, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';
import { encryptionService } from './EncryptionService';

interface BackupSettings {
  autoBackup: boolean;
  encryptBackups: boolean;
  retentionDays: number;
  maxBackups: number;
  backupSchedule: 'daily' | 'weekly' | 'monthly';
  lastBackupDate?: string;
}

interface BackupMetadata {
  timestamp: string;
  version: string;
  size: number;
  encrypted: boolean;
  checksum: string;
}

class BackupService {
  private static instance: BackupService;
  private readonly backupDir: string;
  private settings: BackupSettings = {
    autoBackup: true,
    encryptBackups: true,
    retentionDays: 30,
    maxBackups: 10,
    backupSchedule: 'daily',
  };

  private constructor() {
    this.backupDir = FileSystem.documentDirectory + 'backups/';
    this.loadSettings();
  }

  static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  private async loadSettings() {
    try {
      const savedSettings = await AsyncStorage.getItem('backupSettings');
      if (savedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
      }
    } catch (error) {
      console.error('Error loading backup settings:', error);
    }
  }

  async initialize(): Promise<void> {
    try {
      await FileSystem.makeDirectoryAsync(this.backupDir, { intermediates: true });
      await this.cleanupOldBackups();
    } catch (error) {
      console.error('Error initializing backup service:', error);
      throw new Error('Failed to initialize backup service');
    }
  }

  async updateSettings(newSettings: Partial<BackupSettings>): Promise<void> {
    this.settings = { ...this.settings, ...newSettings };
    await AsyncStorage.setItem('backupSettings', JSON.stringify(this.settings));
  }

  private async generateChecksum(data: string): Promise<string> {
    return await encryptionService.generateHash(data);
  }

  async createBackup(data: any): Promise<string> {
    try {
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const filename = `backup_${timestamp}.json`;
      const filePath = this.backupDir + filename;

      // Prepare backup data with metadata
      const backupContent = JSON.stringify(data);
      const checksum = await this.generateChecksum(backupContent);
      
      const metadata: BackupMetadata = {
        timestamp,
        version: '1.0',
        size: backupContent.length,
        encrypted: this.settings.encryptBackups,
        checksum
      };

      let finalContent = backupContent;
      if (this.settings.encryptBackups) {
        finalContent = await encryptionService.encrypt(backupContent);
      }

      const fullBackup = JSON.stringify({
        metadata,
        content: finalContent
      });

      await FileSystem.writeAsStringAsync(filePath, fullBackup);

      // Handle cloud backup if enabled
      if (this.settings.autoBackup) {
        await this.uploadToCloud(filePath, filename);
      }

      await this.updateLastBackupDate();
      await this.cleanupOldBackups();

      return filePath;
    } catch (error) {
      console.error('Backup creation error:', error);
      throw new Error('Failed to create backup');
    }
  }

  private async uploadToCloud(filePath: string, filename: string): Promise<string> {
    try {
      const storageRef = ref(storage, `backups/${filename}`);
      const fileContent = await FileSystem.readAsStringAsync(filePath);
      const blob = new Blob([fileContent], { type: 'application/json' });
      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Cloud backup error:', error);
      throw new Error('Failed to upload backup to cloud');
    }
  }

  async restoreBackup(backupPath: string): Promise<any> {
    try {
      const backupContent = await FileSystem.readAsStringAsync(backupPath);
      const { metadata, content } = JSON.parse(backupContent);

      // Verify backup integrity
      if (metadata.encrypted && !this.settings.encryptBackups) {
        throw new Error('Backup is encrypted but encryption is not enabled');
      }

      let restoredContent = content;
      if (metadata.encrypted) {
        restoredContent = await encryptionService.decrypt(content);
      }

      // Verify checksum
      const checksum = await this.generateChecksum(restoredContent);
      if (checksum !== metadata.checksum) {
        throw new Error('Backup integrity check failed');
      }

      return JSON.parse(restoredContent);
    } catch (error) {
      console.error('Restore error:', error);
      throw new Error('Failed to restore backup');
    }
  }

  async shareBackup(backupPath: string): Promise<void> {
    try {
      if (!(await Sharing.isAvailableAsync())) {
        throw new Error('Sharing is not available on this device');
      }

      await Sharing.shareAsync(backupPath, {
        mimeType: 'application/json',
        dialogTitle: 'Share Backup File'
      });
    } catch (error) {
      console.error('Share error:', error);
      throw new Error('Failed to share backup');
    }
  }

  private async updateLastBackupDate(): Promise<void> {
    const now = new Date().toISOString();
    await this.updateSettings({ lastBackupDate: now });
  }

  async listBackups(): Promise<{ local: string[]; cloud: string[] }> {
    try {
      // Get local backups
      const localFiles = await FileSystem.readDirectoryAsync(this.backupDir);
      const localBackups = localFiles.filter(file => file.endsWith('.json'));

      // Get cloud backups
      const cloudBackups: string[] = [];
      const storageRef = ref(storage, 'backups');
      const cloudFiles = await listAll(storageRef);
      cloudFiles.items.forEach(item => {
        cloudBackups.push(item.name);
      });

      return { local: localBackups, cloud: cloudBackups };
    } catch (error) {
      console.error('Error listing backups:', error);
      throw new Error('Failed to list backups');
    }
  }

  private async cleanupOldBackups(): Promise<void> {
    try {
      const { local, cloud } = await this.listBackups();

      // Clean local backups
      for (const backup of local) {
        const filePath = this.backupDir + backup;
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        const fileDate = new Date(backup.split('_')[1].split('.')[0]);
        const daysSinceBackup = (Date.now() - fileDate.getTime()) / (1000 * 60 * 60 * 24);

        if (daysSinceBackup > this.settings.retentionDays) {
          await FileSystem.deleteAsync(filePath);
        }
      }

      // Clean cloud backups
      if (this.settings.autoBackup) {
        for (const backup of cloud) {
          const fileDate = new Date(backup.split('_')[1].split('.')[0]);
          const daysSinceBackup = (Date.now() - fileDate.getTime()) / (1000 * 60 * 60 * 24);

          if (daysSinceBackup > this.settings.retentionDays) {
            const fileRef = ref(storage, `backups/${backup}`);
            await deleteObject(fileRef);
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up old backups:', error);
    }
  }

  async shouldPerformBackup(): Promise<boolean> {
    if (!this.settings.lastBackupDate) return true;

    const lastBackup = new Date(this.settings.lastBackupDate);
    const now = new Date();
    const daysSinceLastBackup = (now.getTime() - lastBackup.getTime()) / (1000 * 60 * 60 * 24);

    switch (this.settings.backupSchedule) {
      case 'daily':
        return daysSinceLastBackup >= 1;
      case 'weekly':
        return daysSinceLastBackup >= 7;
      case 'monthly':
        return daysSinceLastBackup >= 30;
      default:
        return false;
    }
  }

  async verifyBackup(backupPath: string): Promise<boolean> {
    try {
      const backupContent = await FileSystem.readAsStringAsync(backupPath);
      const { metadata, content } = JSON.parse(backupContent);

      let verifiedContent = content;
      if (metadata.encrypted) {
        verifiedContent = await encryptionService.decrypt(content);
      }

      const checksum = await this.generateChecksum(verifiedContent);
      return checksum === metadata.checksum;
    } catch (error) {
      console.error('Backup verification error:', error);
      return false;
    }
  }
}

export const backupService = BackupService.getInstance();
