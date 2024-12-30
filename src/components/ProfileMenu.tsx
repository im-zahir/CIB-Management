import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Menu, IconButton, useTheme, Avatar, Snackbar } from 'react-native-paper';
import { useRouter, useSegments } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { authService } from '../services/auth';
import { logoutUser } from '../store/slices/authSlice';

export const ProfileMenu = () => {
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const segments = useSegments();
  const dispatch = useDispatch();
  const theme = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleProfile = () => {
    closeMenu();
    router.push('/(app)/profile');
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    try {
      setIsLoggingOut(true);
      closeMenu();
      
      console.log('Starting logout process...');
      
      // First dispatch logout action to clear Redux state
      dispatch(logoutUser());
      console.log('Redux state cleared');
      
      // Then try to sign out from Firebase
      try {
        await authService.signOut();
        console.log('Firebase signOut successful');
      } catch (firebaseError) {
        console.warn('Firebase signOut failed:', firebaseError);
        // Continue with logout even if Firebase fails
      }

      // Finally navigate to login screen
      if (segments[0] !== '(auth)') {
        console.log('Navigating to login screen...');
        router.replace('/(auth)/login');
      }
      
    } catch (error: any) {
      console.error('Logout error:', error);
      setError('Failed to logout completely. Some data may remain cached.');
      
      // Ensure we still navigate to login screen
      if (segments[0] !== '(auth)') {
        router.replace('/(auth)/login');
      }
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Get initials from user's name
  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View style={styles.container}>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <IconButton
            icon={() => (
              <Avatar.Text
                size={40}
                label={getInitials(user?.name)}
                style={{ backgroundColor: theme.colors.primary }}
              />
            )}
            onPress={openMenu}
          />
        }
        contentStyle={{ backgroundColor: theme.colors.surface }}
      >
        <Menu.Item
          leadingIcon="account"
          onPress={handleProfile}
          title="Profile"
          titleStyle={{ color: theme.colors.onSurface }}
        />
        <Menu.Item
          leadingIcon="logout"
          onPress={handleLogout}
          title={isLoggingOut ? 'Logging out...' : 'Logout'}
          titleStyle={{ color: theme.colors.error }}
          disabled={isLoggingOut}
        />
      </Menu>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError(null)}
        duration={3000}
        action={{
          label: 'OK',
          onPress: () => setError(null),
        }}
      >
        {error}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 8,
  },
});
