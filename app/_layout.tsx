import { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { PaperProvider, Appbar, IconButton } from 'react-native-paper';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { ThemeProvider, useTheme } from '../src/context/theme';
import { store } from '../src/store/store';
import { RootState } from '../src/store/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setUser, setLoading } from '../src/store/auth/authSlice';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Sidebar } from '../src/components/Sidebar';
import { ProfileMenu } from '../src/components/ProfileMenu';

// Ensure navigation only happens after layout is mounted
const useProtectedRoute = (isAuthenticated: boolean, isLoading: boolean) => {
  const segments = useSegments();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (isLoading || isNavigating) return;

    const inAuthGroup = segments[0] === '(auth)';
    let shouldNavigate = false;
    let path = '';

    if (isAuthenticated && inAuthGroup) {
      shouldNavigate = true;
      path = '/(app)';
    } else if (!isAuthenticated && !inAuthGroup) {
      shouldNavigate = true;
      path = '/(auth)/login';
    }

    if (shouldNavigate && path) {
      setIsNavigating(true);
      // Use requestAnimationFrame to ensure navigation happens after render
      requestAnimationFrame(() => {
        router.replace(path);
        setIsNavigating(false);
      });
    }
  }, [isAuthenticated, isLoading, segments, router, isNavigating]);
};

export default function Layout() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <PaperProvider>
          <RootLayoutContent />
        </PaperProvider>
      </ThemeProvider>
    </Provider>
  );
}

function RootLayoutContent() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const segments = useSegments();
  const [isInitialized, setIsInitialized] = useState(false);

  useProtectedRoute(isAuthenticated, isLoading || !isInitialized);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          dispatch(setUser(JSON.parse(userData)));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsInitialized(true);
        dispatch(setLoading(false));
      }
    };

    if (!isInitialized && !isLoading) {
      dispatch(setLoading(true));
      loadUser();
    }
  }, [dispatch, isInitialized, isLoading]);

  if (!isInitialized || isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const showHeader = isAuthenticated && segments[0] !== '(auth)';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {showHeader && (
        <>
          <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
            <IconButton
              icon="menu"
              onPress={() => setSidebarVisible(true)}
            />
            <Appbar.Content title="CIB Management" />
            <IconButton
              icon={isDark ? 'white-balance-sunny' : 'moon-waning-crescent'}
              onPress={toggleTheme}
            />
            <ProfileMenu />
          </Appbar.Header>
          
          <Sidebar
            visible={sidebarVisible}
            onClose={() => setSidebarVisible(false)}
          />
        </>
      )}
      
      <View style={styles.content}>
        <Slot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
