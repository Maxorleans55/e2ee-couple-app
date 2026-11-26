import React from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { fonts, radius, useTheme, elevation } from '@/lib/theme';
import { usePressScale } from './ui';

export type MemoryCardProps = {
  id: string;
  title: string;
  date: string;
  photo: string;
  note: string;
  /** Index used to pick one of the tile colourways. */
  tone?: number;
  onPress?: () => void;
};

const TONES_LIGHT: ReadonlyArray<readonly [string, string]> = [
  ['#FFD9E2', '#FFE9DC'],
  ['#E3E6FF', '#F3E1FF'],
  ['#DDF2E6', '#F0F7D9'],
  ['#FFE6C9', '#FFD8CF'],
];
const TONES_DARK: ReadonlyArray<readonly [string, string]> = [
  ['#4A2333', '#3F2A22'],
  ['#2B2B4D', '#3A2446'],
  ['#203A2D', '#2E3622'],
  ['#45321F', '#45251F'],
];

export function MemoryCard({ title, date, photo, note, tone = 0, onPress }: MemoryCardProps) {
  const c = useTheme();
  const { scale, onPressIn, onPressOut } = usePressScale(0.97);
  const tones = c.mode === 'dark' ? TONES_DARK : TONES_LIGHT;
  const colors = tones[tone % tones.length]!;

  return (
    <Animated.View style={[styles.wrap, { transform: [{ scale }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[styles.card, { backgroundColor: c.surface, borderColor: c.line }, elevation(c, 2)]}
      >
        <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.tile}>
          <Text style={styles.emoji}>{photo}</Text>
          <View style={[styles.lock, { backgroundColor: c.surface + 'CC' }]}>
            <Ionicons name="lock-closed" size={10} color={c.inkSoft} />
          </View>
        </LinearGradient>
        <View style={styles.body}>
          <Text style={[styles.date, { color: c.rose }]}>{date}</Text>
          <Text style={[styles.title, { color: c.ink }]} numberOfLines={2}>
            {title}
          </Text>
          <Text style={[styles.note, { color: c.inkSoft }]} numberOfLines={3}>
            {note}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function AddMemoryCard({ onPress }: { onPress?: () => void }) {
  const c = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.wrap,
        styles.add,
        { borderColor: c.rose + '66', backgroundColor: pressed ? c.roseTint : 'transparent' },
      ]}
    >
      <View style={[styles.addIcon, { backgroundColor: c.roseTint }]}>
        <Ionicons name="add" size={26} color={c.rose} />
      </View>
      <Text style={[styles.addText, { color: c.rose }]}>Add a memory</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '48%' },
  card: { borderRadius: radius.lg, borderWidth: 1, overflow: 'hidden' },
  tile: { height: 118, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 46 },
  lock: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: 14, paddingTop: 12, gap: 4 },
  date: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase' },
  title: { fontFamily: fonts.display, fontSize: 17, lineHeight: 21, letterSpacing: -0.2 },
  note: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18, marginTop: 2 },
  add: {
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    minHeight: 236,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  addIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  addText: { fontFamily: fonts.semibold, fontSize: 14 },
});
