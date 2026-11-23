import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { theme } from '@/lib/theme';

export type TypingIndicatorColors = {
  textMuted: string;
};

export function TypingIndicator({ colors }: { colors: TypingIndicatorColors }) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDot = (value: Animated.AnimatedValue, delayMs: number) => {
      setTimeout(() => {
        Animated.timing(value, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start(() => {
          Animated.timing(value, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }).start(() => {
            animateDot(value, delayMs + 1200);
          });
        });
      }, delayMs);
    };

    animateDot(dot1, 0);
    animateDot(dot2, 400);
    animateDot(dot3, 800);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.dot, { transform: [{ scaleY: dot1 }] }]} />
      <Animated.View style={[styles.dot, { transform: [{ scaleY: dot2 }] }]} />
      <Animated.View style={[styles.dot, { transform: [{ scaleY: dot3 }] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9a9a9a',
    transform: [{ scaleY: 0.5 }],
  },
});
