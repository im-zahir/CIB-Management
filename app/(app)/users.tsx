import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Text, Card, ActivityIndicator, useTheme, Button } from 'react-native-paper';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../src/services/firebase';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function UsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();

  const fetchUsers = useCallback(async (retryCount = 0) => {
    try {
      const usersCollection = collection(db, 'users');
      const querySnapshot = await getDocs(usersCollection);
      const usersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));
      setUsers(usersList);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      // Retry up to 3 times with exponential backoff
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        setTimeout(() => fetchUsers(retryCount + 1), delay);
      } else {
        setError('Failed to fetch users. Pull down to refresh.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        {users.map(user => (
          <Card key={user.id} style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium">{user.name || 'No Name'}</Text>
              <Text variant="bodyMedium">Email: {user.email}</Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.primary }}>
                Role: {user.role || 'user'}
              </Text>
            </Card.Content>
          </Card>
        ))}
        
        {users.length === 0 && !loading && !error && (
          <Text style={styles.emptyText}>No users found</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginBottom: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
  }
});
