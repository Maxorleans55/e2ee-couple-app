import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const PREFIX = 'e2ee_couple_';

export const secureStore = {
  async get(key: string): Promise<string | null> {
    return SecureStore.getItemAsync(`${PREFIX}${key}`);
  },
  async set(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(`${PREFIX}${key}`, value);
  },
  async delete(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(`${PREFIX}${key}`);
  },
  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  },
};

export const storageOptions = {
  ...(Platform.OS === 'ios'
    ? { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY }
    : {}),
};

export type IdentityKeys = {
  identityPublicKey: string;
  identityPrivateKey: string;
  registrationId: number;
};

export const KEYS_STORAGE_KEY = 'identity_keys';
export const PREKEYS_STORAGE_KEY = 'prekeys';
export const SESSIONS_STORAGE_KEY = 'sessions';
