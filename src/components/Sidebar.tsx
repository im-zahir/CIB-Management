import React from 'react';
import { View, StyleSheet, Dimensions, Modal, Animated, TouchableWithoutFeedback } from 'react-native';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const { width } = Dimensions.get('window');

export const Sidebar = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const router = useRouter();
  const theme = useTheme();
  const { user, userRole } = useSelector((state: RootState) => state.auth);
  const [slideAnim] = React.useState(new Animated.Value(-width));

  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const menuItems = [
    {
      label: 'Dashboard',
      icon: 'view-dashboard',
      onPress: () => {
        router.push('/');
        onClose();
      },
    },
    {
      label: 'Revenue',
      icon: 'cash-plus',
      onPress: () => {
        router.push('/revenue');
        onClose();
      },
    },
    {
      label: 'Expenses',
      icon: 'cash-minus',
      onPress: () => {
        router.push('/expenses');
        onClose();
      },
    },
    {
      label: 'Production',
      icon: 'factory',
      onPress: () => {
        router.push('/production');
        onClose();
      },
    },
    {
      label: 'Employees',
      icon: 'account-group',
      onPress: () => {
        router.push('/employees');
        onClose();
      },
    },
    {
      label: 'Reports',
      icon: 'chart-bar',
      onPress: () => {
        router.push('/reports');
        onClose();
      },
    },
    {
      label: 'Settings',
      icon: 'cog',
      onPress: () => {
        router.push('/settings');
        onClose();
      },
    },
  ];

  if (userRole === 'admin') {
    menuItems.push({
      label: 'Users',
      icon: 'account-key',
      onPress: () => {
        router.push('/(app)/users');
        onClose();
      },
    });
  }

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        
        <Animated.View 
          style={[
            styles.container,
            { 
              backgroundColor: theme.colors.background,
              transform: [{ translateX: slideAnim }]
            }
          ]}
        >
          <View style={styles.header}>
            <Text variant="titleLarge" style={styles.title}>CIB Management</Text>
            {user && (
              <Text variant="bodyMedium" style={styles.subtitle}>
                {user.email}
              </Text>
            )}
          </View>

          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
              <TouchableRipple
                key={index}
                onPress={item.onPress}
                style={styles.menuItem}
              >
                <View style={styles.menuItemContent}>
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={24}
                    color={theme.colors.onSurface}
                    style={styles.menuIcon}
                  />
                  <Text variant="bodyLarge">{item.label}</Text>
                </View>
              </TouchableRipple>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: width * 0.75,
    maxWidth: 300,
    height: '100%',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontWeight: 'bold',
  },
  subtitle: {
    opacity: 0.7,
  },
  menuContainer: {
    flex: 1,
    paddingTop: 8,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 16,
  },
});
