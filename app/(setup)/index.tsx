import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { secureStore, KEYS_STORAGE_KEY } from '@/lib/secureStore';
import { getSignalClient } from '@/lib/crypto';
import { RELAY_URL } from '@/lib/relay';
import { fonts, radius, useTheme } from '@/lib/theme';
import { Backdrop, Card, GhostButton, GradientButton, LogoMark, Pill } from '@/components/ui';

type Status = 'idle' | 'generating' | 'ready' | 'error';

export default function SetupScreen() {
  const router = useRouter();
  const c = useTheme();
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);

  const enter = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 2600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    secureStore
      .get(KEYS_STORAGE_KEY)
      .then((existing) => {
        if (existing) {
          setPublicKey(JSON.parse(existing).identityPublicKey);
          setStatus('ready');
        }
      })
      .catch(() => {
        // Secure storage isn't available (e.g. web preview) — stay on the intro.
      });
  }, [enter, float]);

  const generateKeys = async () => {
    setStatus('generating');
    setError(null);
    try {
      // NOTE: identity assertion is still a placeholder — see SECURITY_AUDIT.md.
      const getIdentityAssertion = async () => `device-identity-${Date.now()}`;
      await getSignalClient(RELAY_URL, getIdentityAssertion);
      const existing = await secureStore.get(KEYS_STORAGE_KEY);
      if (existing) setPublicKey(JSON.parse(existing).identityPublicKey);
      setStatus('ready');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong while creating your keys.');
      setStatus('error');
    }
  };

  const translateY = enter.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });
  const floatY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });

  return (
    <Backdrop>
      <SafeAreaView style={styles.safe}>
        <Animated.View style={[styles.hero, { opacity: enter, transform: [{ translateY }] }]}>
          <Animated.View style={{ transform: [{ translateY: floatY }] }}>
            <LogoMark size={84} />
          </Animated.View>

          <Text style={[styles.title, { color: c.ink }]}>
            Us<Text style={[styles.titleAccent, { color: c.rose }]}>Two</Text>
          </Text>
          <Text style={[styles.tagline, { color: c.inkSoft }]}>
            A quiet little place for{'\n'}just the two of you.
          </Text>

          <View style={styles.pills}>
            <Pill icon="lock-closed" label="End-to-end encrypted" tone="rose" />
            <Pill icon="people" label="Only two keys" />
            <Pill icon="call-outline" label="No phone number" />
          </View>
        </Animated.View>

        <Animated.View style={[styles.bottom, { opacity: enter }]}>
          {status === 'ready' && publicKey ? (
            <Card style={styles.keyCard}>
              <View style={styles.keyHeader}>
                <View style={[styles.keyIcon, { backgroundColor: c.sageTint }]}>
                  <Ionicons name="shield-checkmark" size={18} color={c.sage} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.keyTitle, { color: c.ink }]}>Your identity is ready</Text>
                  <Text style={[styles.keySub, { color: c.inkSoft }]}>Stored only on this device</Text>
                </View>
              </View>
              <View style={[styles.keyBox, { backgroundColor: c.surfaceAlt }]}>
                <Text style={[styles.keyLabel, { color: c.inkFaint }]}>PUBLIC KEY</Text>
                <Text style={[styles.keyValue, { color: c.ink }]} numberOfLines={2}>
                  {publicKey.match(/.{1,4}/g)?.slice(0, 8).join(' ')} …
                </Text>
              </View>
              <GradientButton
                label="Continue to chat"
                icon="arrow-forward"
                onPress={() => router.replace('/chat')}
              />
            </Card>
          ) : status === 'error' ? (
            <Card style={styles.keyCard}>
              <View style={styles.keyHeader}>
                <View style={[styles.keyIcon, { backgroundColor: c.dangerTint }]}>
                  <Ionicons name="alert-circle" size={18} color={c.danger} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.keyTitle, { color: c.ink }]}>Couldn’t create your keys</Text>
                  <Text style={[styles.keySub, { color: c.inkSoft }]} numberOfLines={3}>
                    {error}
                  </Text>
                </View>
              </View>
              <GradientButton label="Try again" icon="refresh" onPress={generateKeys} />
            </Card>
          ) : (
            <>
              <GradientButton
                label={status === 'generating' ? 'Creating your keys…' : 'Set up my identity'}
                icon="sparkles"
                loading={status === 'generating'}
                onPress={generateKeys}
              />
              <GhostButton label="How does this work?" icon="help-circle-outline" onPress={() => {}} />
              <Text style={[styles.fineprint, { color: c.inkFaint }]}>
                Your keys are created on this phone and never leave it.
              </Text>
            </>
          )}
        </Animated.View>
      </SafeAreaView>
    </Backdrop>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: 24, justifyContent: 'space-between' },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 24 },
  title: { fontFamily: fonts.display, fontSize: 52, letterSpacing: -1.5, marginTop: 28 },
  titleAccent: { fontFamily: fonts.displayItalic },
  tagline: { fontFamily: fonts.body, fontSize: 17, lineHeight: 26, textAlign: 'center', marginTop: 8 },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 28,
    maxWidth: 340,
  },
  bottom: { gap: 12, paddingBottom: 16 },
  fineprint: { fontFamily: fonts.medium, fontSize: 12.5, textAlign: 'center', marginTop: 4 },
  keyCard: { padding: 18, gap: 16, borderRadius: radius.xl },
  keyHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  keyIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  keyTitle: { fontFamily: fonts.bold, fontSize: 16 },
  keySub: { fontFamily: fonts.body, fontSize: 13, marginTop: 2 },
  keyBox: { borderRadius: radius.md, padding: 14 },
  keyLabel: { fontFamily: fonts.bold, fontSize: 10.5, letterSpacing: 1.4, marginBottom: 6 },
  keyValue: { fontFamily: 'monospace', fontSize: 14, letterSpacing: 0.5, lineHeight: 21 },
});

