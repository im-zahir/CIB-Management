import React, { useState } from 'react';
import { View, StyleSheet, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { setUser, setLoading, setError } from '@/store/auth/authSlice';
import { authService } from '@/services/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLocalLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      dispatch(setError('Please fill in all fields'));
      return;
    }

    setLocalLoading(true);
    dispatch(setLoading(true));

    try {
      const response = await authService.login(email, password);
      if (response.success && response.user) {
        const userData = {
          id: response.user.uid,
          email: response.user.email || '',
          name: response.user.displayName || 'User',
          role: response.role
        };
        
        dispatch(setUser(userData));
        router.replace('/(app)');
      } else {
        // Handle specific Firebase auth errors
        let errorMessage = 'Login failed';
        if (response.error?.includes('auth/user-not-found')) {
          errorMessage = 'No account found with this email';
        } else if (response.error?.includes('auth/wrong-password')) {
          errorMessage = 'Incorrect password';
        } else if (response.error?.includes('auth/invalid-email')) {
          errorMessage = 'Invalid email address';
        }
        dispatch(setError(errorMessage));
      }
    } catch (error) {
      console.error('Login error:', error);
      dispatch(setError('An error occurred during login'));
    } finally {
      setLocalLoading(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text variant="headlineMedium" style={styles.title}>
          CIB Management
        </Text>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          left={<TextInput.Icon icon="email" />}
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry={!showPassword}
          style={styles.input}
          left={<TextInput.Icon icon="lock" />}
          right={
            <TextInput.Icon
              icon={showPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowPassword(!showPassword)}
            />
          }
        />

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          style={styles.button}
        >
          Login
        </Button>

        <Button
          mode="text"
          onPress={() => {/* TODO: Implement forgot password */}}
          style={styles.forgotButton}
        >
          Forgot Password?
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    paddingVertical: 6,
  },
  forgotButton: {
    marginTop: 8,
  },
});
