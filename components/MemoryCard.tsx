import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  useColorScheme,
} from 'react-native';
import { theme } from '@/lib/theme';

export type MemoryCardColors = {
  surface: string;
  text: string;
  textMuted: string;
  border: string;
};

export type MemoryCardProps = {
  id: string;
  title: string;
  date: string;
  photo: string;
  note: string;
  colors: MemoryCardColors;
  onPress?: () => void;
};

export function MemoryCard({
  id,
  title,
  date,
  photo,
  note,
  colors,
  onPress,
}: MemoryCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        { transform: [{ scale: scaleAnim }] },
      ]}
      onPressIn={() => {
        Animated.timing(scaleAnim, {
          toValue: 0.96,
          duration: 100,
          useNativeDriver: true,
        }).start();
      }}
      onPressOut={() => {
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }).start();
        if (onPress) onPress();
      }}
      activeOpacity={1}
    >
      <View style={styles.photo}>{photo}</View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.date, { color: colors.textMuted }]}>{date}</Text>
      <Text style={[styles.note, { color: colors.text }]}>{note}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  photo: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '800' as any,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    marginBottom: 8,
  },
  note: {
    fontSize: 13,
    lineHeight: 18,
  },
});
