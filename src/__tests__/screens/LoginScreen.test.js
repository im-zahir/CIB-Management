import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../../screens/auth/LoginScreen';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useDispatch } from 'react-redux';
import '../setup/react-native-setup';
import { auth } from '../../config/firebase';

jest.mock('firebase/auth');
jest.mock('react-redux');
jest.mock('../../config/firebase', () => ({
  auth: {}
}));

describe('LoginScreen', () => {
  const mockDispatch = jest.fn();
  const mockNavigation = {
    navigate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useDispatch.mockReturnValue(mockDispatch);
  });

  it('renders login form correctly', () => {
    const { getByTestId } = render(<LoginScreen navigation={mockNavigation} />);
    
    expect(getByTestId('email-input')).toBeTruthy();
    expect(getByTestId('password-input')).toBeTruthy();
    expect(getByTestId('login-button')).toBeTruthy();
  });

  it('validates email format', async () => {
    const { getByTestId, getByText } = render(
      <LoginScreen navigation={mockNavigation} />
    );
    
    fireEvent.changeText(getByTestId('password-input'), 'password123');
    fireEvent.changeText(getByTestId('email-input'), 'invalid-email');
    fireEvent.press(getByTestId('login-button'));

    await waitFor(() => {
      expect(getByText('Please enter a valid email')).toBeTruthy();
    });
  });

  it('validates password length', async () => {
    const { getByTestId, getByText } = render(
      <LoginScreen navigation={mockNavigation} />
    );
    
    fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
    fireEvent.changeText(getByTestId('password-input'), '123');
    fireEvent.press(getByTestId('login-button'));

    await waitFor(() => {
      expect(getByText('Password must be at least 6 characters')).toBeTruthy();
    });
  });

  it('handles successful login', async () => {
    const mockUser = { uid: 'test-uid' };
    signInWithEmailAndPassword.mockResolvedValueOnce({ user: mockUser });
    
    const { getByTestId } = render(
      <LoginScreen navigation={mockNavigation} />
    );
    
    fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
    fireEvent.changeText(getByTestId('password-input'), 'password123');
    fireEvent.press(getByTestId('login-button'));

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        auth,
        'test@example.com',
        'password123'
      );
      expect(mockDispatch).toHaveBeenCalledWith(expect.any(Object));
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Main');
    });
  });

  it('handles login error', async () => {
    const errorMessage = 'Invalid credentials';
    signInWithEmailAndPassword.mockRejectedValueOnce(new Error(errorMessage));
    
    const { getByTestId, getByText } = render(
      <LoginScreen navigation={mockNavigation} />
    );
    
    fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
    fireEvent.changeText(getByTestId('password-input'), 'password123');
    fireEvent.press(getByTestId('login-button'));

    await waitFor(() => {
      expect(getByText(errorMessage)).toBeTruthy();
    });
  });
});
