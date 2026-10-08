import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'pulseflow_secure_auth_token';
const USER_KEY = 'pulseflow_secure_user_data';

// Helper for SecureStorage (Android Keystore / iOS Keychain)
export const storage = {
  async saveToken(token: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        await SecureStore.setItemAsync(TOKEN_KEY, token, {
          keychainAccessible: SecureStore.WHEN_UNLOCKED,
        });
      }
    } catch (e) {
      console.warn('SecureStore save error:', e);
    }
  },

  async getToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(TOKEN_KEY);
      }
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (e) {
      console.warn('SecureStore get error:', e);
      return null;
    }
  },

  async removeToken(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(TOKEN_KEY);
      } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      }
    } catch (e) {
      console.warn('SecureStore delete error:', e);
    }
  },

  async saveUser(user: any): Promise<void> {
    try {
      const json = JSON.stringify(user);
      if (Platform.OS === 'web') {
        localStorage.setItem(USER_KEY, json);
      } else {
        await SecureStore.setItemAsync(USER_KEY, json);
      }
    } catch (e) {
      console.warn('User store error:', e);
    }
  },

  async getUser(): Promise<any | null> {
    try {
      const data = Platform.OS === 'web'
        ? localStorage.getItem(USER_KEY)
        : await SecureStore.getItemAsync(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  async removeUser(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(USER_KEY);
      } else {
        await SecureStore.deleteItemAsync(USER_KEY);
      }
    } catch (e) {
      console.warn('User remove error:', e);
    }
  },
};

