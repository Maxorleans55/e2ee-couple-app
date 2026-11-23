import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { theme } from '@/lib/theme';

export type SafetyNumberVerifyColors = {
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
};

export type SafetyNumberVerifyProps = {
  safetyNumber: string;
  partnerSafetyNumber: string;
  isVerified: boolean;
  onVerify: (confirmed: boolean) => void;
  colors: SafetyNumberVerifyColors;
};

export function SafetyNumberVerify({
  safetyNumber,
  partnerSafetyNumber,
  isVerified,
  onVerify,
  colors,
}: SafetyNumberVerifyProps) {
  const [matched, setMatched] = useState(false);
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const formattedMine = safetyNumber.match(/.{1,5}/g)?.join(' ') ?? '';
  const formattedTheirs = partnerSafetyNumber.match(/.{1,5}/g)?.join(' ') ?? '';

  const confirm = () => {
    setMatched(true);
    onVerify(true);
  };

  const reject = () => {
    onVerify(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Verify Safety Number
      </Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        Compare these numbers with your partner in person or over a trusted channel.
      </Text>

      <View style={[styles.numberCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.textMuted }]}>
          Your safety number
        </Text>
        <Text style={[styles.number, { color: colors.text }]}>
          {formattedMine}
        </Text>
      </View>

      <View style={[styles.numberCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.textMuted }]}>
          Partner&rsquo;s safety number
        </Text>
        <Text style={[styles.number, { color: colors.text }]}>
          {formattedTheirs}
        </Text>
      </View>

      <View style={styles.matchIndicator}>
        <Animated.View
          style={[
            styles.matchDot,
            {
              opacity: pulseAnim,
              transform: [{ scale: matched ? 1.2 : 1 }],
            },
          ]}
        />
        <Text style={matched ? styles.matchText : styles.pendingText}>
          {matched ? 'Numbers match' : 'Compare the numbers above'}
        </Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.buttonConfirm,
            { backgroundColor: matched ? theme.colors.success : '#c7c7c7' },
          ]}
          disabled={!matched}
          onPress={confirm}
        >
          <Text style={styles.buttonText}>I confirm they match</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonCancel} onPress={reject}>
          <Text style={[styles.buttonTextCancel, { color: colors.textMuted }]}>
            These don&rsquo;t match
          </Text>
        </TouchableOpacity>
      </View>

      {isVerified && (
        <View style={[styles.verifiedBanner, { backgroundColor: '#1b4332', borderColor: '#2d6a4f' }]}>
          <Text style={[styles.verifiedText, { color: '#a7dba4' }]}>
            ✓ Identity verified — E2EE session locked
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  numberCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  label: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  number: {
    fontSize: 13,
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  matchIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  matchDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.success,
  },
  matchText: {
    fontSize: 14,
    fontWeight: '700',
  },
  pendingText: {
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonConfirm: {},
  buttonCancel: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#c7c7c7',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  buttonTextCancel: {
    fontSize: 14,
    fontWeight: '600',
  },
  verifiedBanner: {
    marginTop: 16,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  verifiedText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
