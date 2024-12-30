import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Avatar, Divider, useTheme } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '@store/store';

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, userRole } = useSelector((state: RootState) => state.auth);

  // Get initials from user's name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Avatar.Text
            size={80}
            label={user?.name ? getInitials(user.name) : '?'}
            style={{ backgroundColor: theme.colors.primary }}
          />
          <View style={styles.headerText}>
            <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
              {user?.name}
            </Text>
            <Text variant="bodyLarge" style={{ color: theme.colors.secondary }}>
              {userRole?.charAt(0).toUpperCase() + userRole?.slice(1)}
            </Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        <Card.Content style={styles.content}>
          <View style={styles.infoSection}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Contact Information
            </Text>
            <View style={styles.infoItem}>
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
                Email:
              </Text>
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                {user?.email}
              </Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Account Details
            </Text>
            <View style={styles.infoItem}>
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
                Role:
              </Text>
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                {userRole?.charAt(0).toUpperCase() + userRole?.slice(1)}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
                Status:
              </Text>
              <Text variant="bodyLarge" style={{ color: theme.colors.primary }}>
                Active
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 16,
    flex: 1,
  },
  divider: {
    marginVertical: 16,
  },
  content: {
    gap: 24,
  },
  infoSection: {
    gap: 12,
  },
  sectionTitle: {
    marginBottom: 8,
    opacity: 0.7,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
});
