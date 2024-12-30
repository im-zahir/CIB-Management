import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, List, Switch, Button, Portal, Modal, TextInput } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

interface SettingsOption {
  title: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

interface SettingsScreenProps {
  navigation: any;
}

interface AppSettings {
  darkMode: boolean;
  notificationsEnabled: boolean;
  paymentReminders: boolean;
  inventoryAlerts: boolean;
  salaryReminders: boolean;
  lowStockThreshold: number;
}

export function SettingsScreen({ navigation }: SettingsScreenProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [paymentReminders, setPaymentReminders] = useState(false);
  const [inventoryAlerts, setInventoryAlerts] = useState(false);
  const [salaryReminders, setSalaryReminders] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [lowStockThreshold, setLowStockThreshold] = useState('10');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('appSettings');
      if (settings) {
        const parsedSettings: AppSettings = JSON.parse(settings);
        setDarkMode(parsedSettings.darkMode);
        setNotificationsEnabled(parsedSettings.notificationsEnabled);
        setPaymentReminders(parsedSettings.paymentReminders);
        setInventoryAlerts(parsedSettings.inventoryAlerts);
        setSalaryReminders(parsedSettings.salaryReminders);
        setLowStockThreshold(parsedSettings.lowStockThreshold.toString());
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      const settings: AppSettings = {
        darkMode,
        notificationsEnabled,
        paymentReminders,
        inventoryAlerts,
        salaryReminders,
        lowStockThreshold: parseInt(lowStockThreshold),
      };
      await AsyncStorage.setItem('appSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const requestNotificationPermission = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        setNotificationsEnabled(true);
        await saveSettings();
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const handleNotificationToggle = async (value) => {
    if (value) {
      await requestNotificationPermission();
    } else {
      setNotificationsEnabled(false);
      setPaymentReminders(false);
      setInventoryAlerts(false);
      setSalaryReminders(false);
      await saveSettings();
    }
  };

  const settings: SettingsOption[] = [
    {
      title: 'Dark Mode',
      description: 'Toggle dark mode theme',
      value: darkMode,
      onValueChange: async (value) => {
        setDarkMode(value);
        await saveSettings();
      },
    },
    {
      title: 'Enable Notifications',
      description: 'Enable push notifications',
      value: notificationsEnabled,
      onValueChange: handleNotificationToggle,
    },
    {
      title: 'Payment Reminders',
      description: 'Enable payment reminders',
      value: paymentReminders,
      onValueChange: async (value) => {
        setPaymentReminders(value);
        await saveSettings();
      },
    },
    {
      title: 'Inventory Alerts',
      description: 'Enable inventory alerts',
      value: inventoryAlerts,
      onValueChange: async (value) => {
        setInventoryAlerts(value);
        await saveSettings();
      },
    },
    {
      title: 'Salary Payment Reminders',
      description: 'Enable salary payment reminders',
      value: salaryReminders,
      onValueChange: async (value) => {
        setSalaryReminders(value);
        await saveSettings();
      },
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <List.Section>
            <List.Subheader>Preferences</List.Subheader>
            {settings.map((setting, index) => (
              <List.Item
                key={index}
                title={setting.title}
                description={setting.description}
                right={() => (
                  <Switch
                    value={setting.value}
                    onValueChange={setting.onValueChange}
                  />
                )}
              />
            ))}
          </List.Section>

          {inventoryAlerts && (
            <Button
              mode="outlined"
              onPress={() => setModalVisible(true)}
              style={styles.thresholdButton}
            >
              Set Low Stock Threshold
            </Button>
          )}
        </Card.Content>
      </Card>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <TextInput
            label="Low Stock Threshold"
            value={lowStockThreshold}
            onChangeText={setLowStockThreshold}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
          />
          <Button
            mode="contained"
            onPress={async () => {
              await saveSettings();
              setModalVisible(false);
            }}
          >
            Save
          </Button>
        </Modal>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  card: {
    marginBottom: 10,
  },
  thresholdButton: {
    marginTop: 10,
    marginHorizontal: 16,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  input: {
    marginBottom: 20,
  },
});
