import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts, radius, useTheme } from '@/lib/theme';
import { Card, GhostButton, GradientButton } from './ui';

export type SafetyNumberVerifyProps = {
  /** The shared 60-digit safety number. It is identical on both phones. */
  safetyNumber: string | null;
  partnerName: string;
  isVerified: boolean;
  onVerify: (confirmed: boolean) => void;
};

export function SafetyNumberVerify({ safetyNumber, partnerName, isVerified, onVerify }: SafetyNumberVerifyProps) {
  const c = useTheme();
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const groups = safetyNumber?.replace(/\s/g, '').match(/.{1,5}/g) ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Animated.View
          style={[
            styles.halo,
            {
              backgroundColor: isVerified ? c.sageTint : c.roseTint,
              transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }],
            },
          ]}
        />
        <View style={[styles.heroIcon, { backgroundColor: c.surface }]}>
          <Ionicons
            name={isVerified ? 'shield-checkmark' : 'finger-print'}
            size={34}
            color={isVerified ? c.sage : c.rose}
          />
        </View>
      </View>

      <Text style={[styles.body, { color: c.inkSoft }]}>
        Sit together, or call {partnerName}, and check that this number matches the one on their phone. If it matches,
        nobody is listening in.
      </Text>

      <Card style={styles.numberCard}>
        {groups.length > 0 ? (
          <View style={styles.grid}>
            {groups.map((g, i) => (
              <Text key={i} style={[styles.group, { color: c.ink }]}>
                {g}
              </Text>
            ))}
          </View>
        ) : (
          <View style={styles.pending}>
            <Ionicons name="hourglass-outline" size={20} color={c.inkFaint} />
            <Text style={[styles.pendingText, { color: c.inkSoft }]}>
              Waiting for {partnerName}’s key. Once you’ve both connected, your safety number appears here.
            </Text>
          </View>
        )}
      </Card>

      {isVerified ? (
        <View style={[styles.verified, { backgroundColor: c.sageTint }]}>
          <Ionicons name="checkmark-circle" size={18} color={c.sage} />
          <Text style={[styles.verifiedText, { color: c.sage }]}>Verified. Your conversation is private.</Text>
        </View>
      ) : (
        <View style={styles.actions}>
          <GradientButton
            label="They match"
            icon="checkmark"
            disabled={groups.length === 0}
            onPress={() => onVerify(true)}
          />
          <GhostButton label="They don’t match" icon="alert-circle-outline" onPress={() => onVerify(false)} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 22 },
  hero: { alignItems: 'center', justifyContent: 'center', height: 120 },
  halo: { position: 'absolute', width: 116, height: 116, borderRadius: 58 },
  heroIcon: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center' },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 23, textAlign: 'center', paddingHorizontal: 8 },
  numberCard: { padding: 20, borderRadius: radius.xl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 14 },
  group: { width: '25%', textAlign: 'center', fontFamily: 'monospace', fontSize: 18, letterSpacing: 1 },
  pending: { alignItems: 'center', gap: 10, paddingVertical: 12 },
  pendingText: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  actions: { gap: 10 },
  verified: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: radius.md,
  },
  verifiedText: { fontFamily: fonts.bold, fontSize: 14 },
});
