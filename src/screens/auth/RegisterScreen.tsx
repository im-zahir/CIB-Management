import React, { useState } from 'react';
import { View, StyleSheet, Image, Alert, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useTheme } from '@context/theme';
import { router } from 'expo-router';
import { useDispatch } from 'react-redux';
import { setUser, setUserRole } from '@store/auth/authSlice';
import { authService } from '../../services/auth';

export function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const dispatch = useDispatch();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.register(email, password, name);
      
      if (response.success && response.user) {
        const userData = {
          id: response.user.uid,
          email: response.user.email || '',
          name: response.user.displayName || name,
          role: 'user'
        };
        
        dispatch(setUser(userData));
        router.replace('/(app)');
      } else {
        Alert.alert('Error', response.error || 'Registration failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to register. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.logoContainer}>
        <Image 
          source={require('@assets/Chemico 1.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={[styles.formContainer, { backgroundColor: theme.colors.surface }]}>
        <Text 
          variant="headlineMedium" 
          style={[styles.title, { color: theme.colors.primary }]}
        >
          Create Account
        </Text>

        <TextInput
          label="Full Name"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
          autoCapitalize="words"
        />
        
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          style={styles.input}
          secureTextEntry={!showPassword}
          right={
            <TextInput.Icon
              icon={showPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowPassword(!showPassword)}
            />
          }
        />

        <TextInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          mode="outlined"
          style={styles.input}
          secureTextEntry={!showPassword}
        />

        <Button
          mode="contained"
          onPress={handleRegister}
          style={styles.button}
          loading={loading}
          disabled={loading}
        >
          Register
        </Button>

        <Button
          mode="text"
          onPress={() => router.push('/login')}
          style={styles.linkButton}
        >
          Already have an account? Login
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  logo: {
    width: 200,
    height: 80,
  },
  formContainer: {
    padding: 20,
    borderRadius: 10,
    elevation: 2,
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    marginBottom: 16,
  },
  linkButton: {
    marginTop: 8,
  },
});
