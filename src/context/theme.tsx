import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { MD3Theme } from 'react-native-paper';
import { lightTheme, darkTheme } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MD3LightTheme, adaptNavigationTheme } from 'react-native-paper';
import { DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import { Colors } from '../constants/Colors';

interface ThemeContextType {
  theme: MD3Theme;
  navigationTheme: any;
  isDark: boolean;
  toggleTheme: () => void;
}

const defaultTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.primary,
    primaryContainer: Colors.primaryLight,
    secondary: Colors.secondary,
    secondaryContainer: Colors.secondaryLight,
    tertiary: Colors.accent,
    tertiaryContainer: Colors.accentLight,
    surface: Colors.surface,
    surfaceVariant: Colors.surfaceVariant,
    background: Colors.background,
    error: Colors.error,
    errorContainer: Colors.errorLight,
    onPrimary: Colors.textInverse,
    onPrimaryContainer: Colors.textPrimary,
    onSecondary: Colors.textInverse,
    onSecondaryContainer: Colors.textPrimary,
    onTertiary: Colors.textInverse,
    onTertiaryContainer: Colors.textPrimary,
    onSurface: Colors.textPrimary,
    onSurfaceVariant: Colors.textSecondary,
    onError: Colors.textInverse,
    onErrorContainer: Colors.error,
    outline: Colors.border,
  },
};

const { LightTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  materialLight: defaultTheme,
});

const navigationTheme = {
  ...LightTheme,
  colors: {
    ...LightTheme.colors,
    primary: Colors.primary,
    background: Colors.background,
    card: Colors.surface,
    text: Colors.textPrimary,
    border: Colors.border,
    notification: Colors.accent,
  },
};

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  navigationTheme,
  isDark: false,
  toggleTheme: () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  // Load saved theme preference
  useEffect(() => {
    async function loadThemePreference() {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme !== null) {
          setIsDark(savedTheme === 'dark');
        } else {
          setIsDark(systemColorScheme === 'dark');
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
        setIsDark(systemColorScheme === 'dark');
      } finally {
        setIsLoading(false);
      }
    }
    loadThemePreference();
  }, [systemColorScheme]);

  // Save theme preference when it changes
  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem('theme', isDark ? 'dark' : 'light').catch(error => {
        console.error('Error saving theme preference:', error);
      });
    }
  }, [isDark, isLoading]);

  const theme = React.useMemo(() => {
    return isDark ? darkTheme : lightTheme;
  }, [isDark]);

  const toggleTheme = React.useCallback(() => {
    setIsDark(prev => !prev);
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, navigationTheme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
