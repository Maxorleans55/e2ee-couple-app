import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(0, Animated.timing(dot1, { toValue: 1, duration: 400, useNativeDriver: true })),
      Animated.delay(200, Animated.timing(dot2, { toValue: 1, duration: 400, useNativeDriver: true })),
      Animated.delay(400, Animated.timing(dot3, { toValue: 1, duration: 400, useNativeDriver: true })),
      Animated.delay(600, Animated.timing(dot1, { toValue: 0, duration: 400, useNativeDriver: true })),
      Animated.delay(800, Animated.timing(dot2, { toValue: 0, duration: 400, useNativeDriver: true })),
      Animated.delay(1000, Animated.timing(dot3, { toValue: 0, duration: 400, useNativeDriver: true })),
    ]).start(() => {
      // loop
    });
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
