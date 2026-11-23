import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';

export type MemoryCardProps = {
  id: string;
  title: string;
  date: string;
  photo: string;
  note: string;
  onPress?: () => void;
};

export function MemoryCard({ id, title, date, photo, note, onPress }: MemoryCardProps) {
  const tiltX = useSharedValue(0);
  const tiltY = useSharedValue(0);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotateX: tiltX.value },
      { rotateY: tiltY.value },
      { scale: scale.value },
    ],
  }));

  useEffect(() => {
    scale.value = withTiming(1, { duration: 300 });
  }, []);

  return (
    <TouchableOpacity
      style={[styles.card, animatedStyle]}
      onPressIn={() => {
        scale.value = withTiming(0.96, { duration: 100 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 100 });
        if (onPress) onPress();
      }}
      activeOpacity={1}
    >
      <View style={styles.photo}>{photo}</View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.date}>{date}</Text>
      <Text style={styles.note}>{note}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e8ded4',
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
    fontWeight: '800',
    color: '#2d2d2d',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#8a8a8a',
    marginBottom: 8,
  },
  note: {
    fontSize: 13,
    color: '#5a5a5a',
    lineHeight: 18,
  },
});
