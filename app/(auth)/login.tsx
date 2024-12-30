import { Redirect } from 'expo-router';
import LoginScreen from '../../src/screens/auth/LoginScreen';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store/store';

export default function Login() {
  const { user, isLoading } = useSelector((state: RootState) => state.auth);

  if (!isLoading && user) {
    return <Redirect href="/(tabs)" />;
  }

  return <LoginScreen />;
}
