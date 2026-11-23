import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';

export type SafetyNumberVerifyProps = {
  safetyNumber: string;
  partnerSafetyNumber: string;
  isVerified: boolean;
  onVerify: (confirmed: boolean) => void;
};

export function SafetyNumberVerify({
  safetyNumber,
  partnerSafetyNumber,
  isVerified,
  onVerify,
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
    <View style={styles.container}>
      <Text style={styles.title}>Verify Safety Number</Text>
      <Text style={styles.subtitle}>
        Compare these numbers with your partner in person or over a trusted channel.
      </Text>

      <View style={styles.numberCard}>
        <Text style={styles.label}>Your safety number</Text>
        <Text style={styles.number}>{formattedMine}</Text>
      </View>

      <View style={styles.numberCard}>
        <Text style={styles.label}>Partner&rsquo;s safety number</Text>
        <Text style={styles.number}>{formattedTheirs}</Text>
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
          style={[styles.button, styles.buttonConfirm]}
          disabled={!matched}
          onPress={confirm}
        >
          <Text style={styles.buttonText}>I confirm they match</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonCancel} onPress={reject}>
          <Text style={styles.buttonTextCancel}>These don&rsquo;t match</Text>
        </TouchableOpacity>
      </View>

      {isVerified && (
        <View style={styles.verifiedBanner}>
          <Text style={styles.verifiedText}>✓ Identity verified — E2EE session locked</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fdfaf5',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2d2d2d',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b6b6b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  numberCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e8ded4',
  },
  label: {
    fontSize: 11,
    color: '#8a8a8a',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  number: {
    fontSize: 13,
    fontFamily: 'monospace',
    color: '#2d2d2d',
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
    backgroundColor: '#7fb069',
  },
  matchText: {
    fontSize: 14,
    color: '#7fb069',
    fontWeight: '700',
  },
  pendingText: {
    fontSize: 14,
    color: '#8a8a8a',
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
  buttonConfirm: {
    backgroundColor: matched ? '#7fb069' : '#c7c7c7',
  },
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
    color: '#8a8a8a',
    fontSize: 14,
    fontWeight: '600',
  },
  verifiedBanner: {
    marginTop: 16,
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  verifiedText: {
    color: '#2e7d32',
    fontSize: 13,
    fontWeight: '700',
  },
});
