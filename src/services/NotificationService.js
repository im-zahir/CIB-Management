import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface NotificationSettings {
  notificationsEnabled: boolean;
  paymentReminders: boolean;
  inventoryAlerts: boolean;
  salaryReminders: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface PaymentNotification {
  id: string;
  amount: number;
  description: string;
  dueDate: string;
}

export interface InventoryNotification {
  productId: string;
  productName: string;
  currentStock: number;
  threshold: number;
}

export interface SalaryNotification {
  employeeId: string;
  employeeName: string;
  amount: number;
  paymentDate: string;
}

// Configure default notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  private static instance: NotificationService;
  private settings: NotificationSettings = {
    notificationsEnabled: true,
    paymentReminders: true,
    inventoryAlerts: true,
    salaryReminders: true,
    soundEnabled: true,
    vibrationEnabled: true,
  };

  private constructor() {
    this.loadSettings();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async loadSettings() {
    try {
      const savedSettings = await AsyncStorage.getItem('notificationSettings');
      if (savedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  }

  async saveSettings(settings: Partial<NotificationSettings>) {
    try {
      this.settings = { ...this.settings, ...settings };
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }

  async initialize() {
    try {
      if (this.settings.notificationsEnabled) {
        await this.requestPermissions();
      }

      if (Platform.OS === 'ios') {
        await Notifications.setNotificationCategoryAsync('PAYMENT', [
          {
            identifier: 'VIEW',
            buttonTitle: 'View Details',
            options: {
              opensAppToForeground: true,
            },
          },
        ]);
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  async requestPermissions() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        throw new Error('Permission not granted for notifications');
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  async schedulePaymentReminder(payment: PaymentNotification) {
    if (!this.settings.paymentReminders) return;

    try {
      const dueDate = new Date(payment.dueDate);
      const trigger = dueDate.getTime() - (24 * 60 * 60 * 1000); // 1 day before

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Payment Reminder',
          body: `Payment of $${payment.amount} is due tomorrow for ${payment.description}`,
          data: { type: 'payment', paymentId: payment.id },
          sound: this.settings.soundEnabled,
          vibrate: this.settings.vibrationEnabled ? [0, 250, 250, 250] : undefined,
          categoryIdentifier: 'PAYMENT',
        },
        trigger: new Date(trigger),
      });
    } catch (error) {
      console.error('Error scheduling payment reminder:', error);
    }
  }

  async scheduleSalaryReminder(salary: SalaryNotification) {
    if (!this.settings.salaryReminders) return;

    try {
      const paymentDate = new Date(salary.paymentDate);
      const trigger = paymentDate.getTime() - (2 * 24 * 60 * 60 * 1000); // 2 days before

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Salary Payment Reminder',
          body: `Salary payment of $${salary.amount} for ${salary.employeeName} is due in 2 days`,
          data: { type: 'salary', employeeId: salary.employeeId },
          sound: this.settings.soundEnabled,
          vibrate: this.settings.vibrationEnabled ? [0, 250, 250, 250] : undefined,
        },
        trigger: new Date(trigger),
      });
    } catch (error) {
      console.error('Error scheduling salary reminder:', error);
    }
  }

  async checkInventoryLevels(inventory: InventoryNotification) {
    if (!this.settings.inventoryAlerts) return;

    try {
      if (inventory.currentStock <= inventory.threshold) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Low Inventory Alert',
            body: `${inventory.productName} is running low (${inventory.currentStock} units remaining)`,
            data: { type: 'inventory', productId: inventory.productId },
            sound: this.settings.soundEnabled,
            vibrate: this.settings.vibrationEnabled ? [0, 250, 250, 250] : undefined,
          },
          trigger: null, // Send immediately
        });
      }
    } catch (error) {
      console.error('Error sending inventory alert:', error);
    }
  }

  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  }

  async getScheduledNotifications() {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  async getBadgeCount() {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('Error getting badge count:', error);
      return 0;
    }
  }

  async setBadgeCount(count: number) {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }
}

export const notificationService = NotificationService.getInstance();
