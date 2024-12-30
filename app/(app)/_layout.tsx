import { Stack } from 'expo-router';
import { useSelector } from 'react-redux';
import { useTheme } from '@context/theme';
import { RootState } from '@store/store';

export default function TabLayout() {
  const { theme } = useTheme();
  const userRole = useSelector((state: RootState) => state.auth.userRole);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="expenses" />
      {(userRole === 'admin' || userRole === 'manager') && (
        <Stack.Screen name="employees" />
      )}
      {(userRole === 'admin' || userRole === 'manager') && (
        <Stack.Screen name="reports" />
      )}
      <Stack.Screen name="profile" />
    </Stack>
  );
}
