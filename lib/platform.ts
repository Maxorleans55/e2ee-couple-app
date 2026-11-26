import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

export type KeySupport =
  | { ok: true }
  | { ok: false; reason: 'web' | 'expo-go' };

/**
 * The Signal SDK keeps its state in an SQLCipher-encrypted database.
 * That needs a native development or release build: browsers and Expo Go
 * don't ship SQLCipher, so key setup can't run there.
 */
export function keySupport(): KeySupport {
  if (Platform.OS === 'web') return { ok: false, reason: 'web' };
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    return { ok: false, reason: 'expo-go' };
  }
  return { ok: true };
}

/** Turn SDK errors into something a person can act on. */
export function friendlyKeyError(err: unknown): { title: string; body: string; detail: string } {
  const detail = err instanceof Error ? err.message : String(err);
  if (/encrypt|cipher|sqlcipher/i.test(detail)) {
    return {
      title: 'Secure storage isn’t available',
      body: 'This build can’t create an encrypted database for your keys. Use a development build with SQLCipher turned on.',
      detail,
    };
  }
  if (/relay|network|websocket|fetch|connect/i.test(detail)) {
    return {
      title: 'Couldn’t reach the relay',
      body: 'Check that the relay is running and that this phone can reach it, then try again.',
      detail,
    };
  }
  return { title: 'Couldn’t create your keys', body: 'Something went wrong while setting up your identity.', detail };
}
