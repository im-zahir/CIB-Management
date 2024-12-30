import { StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { ExpenseScreen } from '../../src/screens/ExpenseScreen';
import { useTheme } from '../../src/context/theme';

export default function ExpensesLayout() {
  const { navigationTheme } = useTheme();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Expenses',
          headerStyle: {
            backgroundColor: navigationTheme.colors.card,
          },
          headerTintColor: navigationTheme.colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <ExpenseScreen />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
