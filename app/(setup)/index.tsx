import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { useRouter } from 'expo-router';
import { secureStore, KEYS_STORAGE_KEY } from '@/lib/secureStore';
import { getSignalClient } from '@/lib/crypto';

const RELAY_URL = 'ws://localhost:8787';

export default function SetupScreen() {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'generating' | 'ready' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const existing = await secureStore.get(KEYS_STORAGE_KEY);
      if (existing) {
        const keys = JSON.parse(existing);
        setPublicKey(keys.identityPublicKey);
        setStatus('ready');
      }
    })();
  }, []);

  const generateKeys = async () => {
    setStatus('generating');
    setError(null);
    try {
      const getIdentityAssertion = async () => {
        return `device-identity-${Date.now()}`;
      };
      const keys = await getSignalClient(RELAY_URL, getIdentityAssertion);
      // registerIdentity is handled internally; we just need the client initialized
      const existing = await secureStore.get(KEYS_STORAGE_KEY);
      if (existing) {
        const parsed = JSON.parse(existing);
        setPublicKey(parsed.identityPublicKey);
      }
      setStatus('ready');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize');
      setStatus('error');
    }
  };

  const continueToChat = () => {
    router.replace('/(chat)');
  };

  if (status === 'generating') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#d46a6a" />
        <Text style={styles.loadingText}>Generating your identity keys…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Us<span style={styles.accent}>Two</span></Text>
        <Text style={styles.subtitle}>
          End-to-end encrypted. Just the two of you.
        </Text>
        {status === 'idle' && (
          <TouchableOpacity
            style={styles.button}
            onPress={generateKeys}
            disabled={status === 'generating'}
          >
            <Text style={styles.buttonText}>Set Up My Identity</Text>
          </TouchableOpacity>
        )}
        {status === 'ready' && publicKey && (
          <View style={styles.keyPanel}>
            <Text style={styles.keyLabel}>Your identity public key</Text>
            <Text style={styles.keyValue}>{publicKey.slice(0, 24)}…</Text>
            <TouchableOpacity style={styles.pairButton} onPress={continueToChat}>
              <Text style={styles.pairButtonText}>I&rsquo;ve paired with my partner</Text>
            </TouchableOpacity>
          </View>
        )}
        {status === 'error' && error && (
          <View style={styles.errorPanel}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={generateKeys}>
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#fdfaf5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    padding: 32,
    borderRadius: 28,
    backgroundColor: '#f5efe4',
    borderWidth: 1,
    borderColor: '#e8ded4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#2d2d2d',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  accent: {
    color: '#d46a6a',
  },
  subtitle: {
    fontSize: 15,
    color: '#6b6b6b',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  loadingText: {
    fontSize: 15,
    color: '#6b6b6b',
    marginTop: 12,
  },
  button: {
    backgroundColor: '#d46a6a',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#d46a6a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  keyPanel: {
    marginTop: 16,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e8ded4',
  },
  keyLabel: {
    fontSize: 12,
    color: '#8a8a8a',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  keyValue: {
    fontSize: 13,
    fontFamily: 'monospace',
    color: '#2d2d2d',
    marginBottom: 16,
  },
  pairButton: {
    backgroundColor: '#f5efe4',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d4c9b8',
  },
  pairButtonText: {
    color: '#d46a6a',
    fontSize: 15,
    fontWeight: '700',
  },
  errorPanel: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#fdeeea',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f4c2b8',
  },
  errorText: {
    fontSize: 13,
    color: '#b3402a',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#b3402a',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  retryText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
};
