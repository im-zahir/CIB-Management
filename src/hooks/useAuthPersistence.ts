import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setUser } from '@/redux/slices/authSlice';

export function useAuthPersistence(): void {
  const dispatch = useDispatch();

  useEffect(() => {
    const loadUser = async (): Promise<void> => {
      try {
        const userJson = await AsyncStorage.getItem('user');
        if (userJson) {
          const user = JSON.parse(userJson);
          dispatch(setUser(user));
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
      }
    };

    loadUser();
  }, [dispatch]);
}
