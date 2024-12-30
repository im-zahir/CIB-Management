import { StyleSheet, View, Platform } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { Stack } from 'expo-router';
import { useTheme } from '../../src/context/theme';

export default function HomeScreen() {
  const { theme } = useTheme();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Dashboard',
          headerStyle: {
            backgroundColor: theme.colors.surface,
          },
          headerTintColor: theme.colors.onSurface,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Card style={styles.welcomeCard}>
          <Card.Content>
            <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
              Welcome to CIB Management
            </Text>
            <Text variant="bodyLarge" style={{ color: theme.colors.secondary, marginTop: 8 }}>
              Manage your business efficiently
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.statsContainer}>
          <Card style={[styles.statsCard, { marginRight: 8 }]}>
            <Card.Content>
              <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
                Today's Revenue
              </Text>
              <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
                $12,450
              </Text>
            </Card.Content>
          </Card>
          <Card style={[styles.statsCard, { marginLeft: 8 }]}>
            <Card.Content>
              <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
                Today's Orders
              </Text>
              <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
                24
              </Text>
            </Card.Content>
          </Card>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  welcomeCard: {
    marginBottom: 24,
    borderRadius: 12,
    elevation: Platform.select({
      android: 2,
      default: 0
    }),
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statsCard: {
    flex: 1,
    borderRadius: 12,
    elevation: Platform.select({
      android: 2,
      default: 0
    }),
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
});
