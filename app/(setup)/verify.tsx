import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafetyNumberVerify } from '@/components/SafetyNumberVerify';
import { useAppStore } from '@/lib/store';
import { theme } from '@/lib/theme';

export default function VerifyScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = {
    background: isDark ? theme.colors.backgroundDark : theme.colors.background,
    surface: isDark ? theme.colors.surfaceDark : theme.colors.surface,
    text: isDark ? theme.colors.textDark : theme.colors.text,
    textMuted: isDark ? theme.colors.textMutedDark : theme.colors.textMuted,
    border: isDark ? theme.colors.borderDark : theme.colors.border,
  };

  const { safetyNumber, isVerified, setIsVerified, partnerName, setPartnerName } =
    useAppStore();

  const [partnerSn, setPartnerSn] = useState('');

  const handleVerify = (confirmed: boolean) => {
    setIsVerified(confirmed);
    if (confirmed) {
      router.replace('/(chat)');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={[styles.backText, { color: colors.textMuted }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          Verify {partnerName}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <SafetyNumberVerify
          safetyNumber={safetyNumber ?? ''}
          partnerSafetyNumber={partnerSn}
          isVerified={isVerified}
          onVerify={handleVerify}
          colors={{
            background: colors.background,
            surface: colors.surface,
            text: colors.text,
            textMuted: colors.textMuted,
            border: colors.border,
          }}
        />
      </View>
    </View>
  );
}

import { useState } from 'react';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 20,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    marginLeft: 4,
  },
  card: {
    margin: 24,
    borderRadius: 28,
    padding: 32,
    borderWidth: 1,
  },
});
