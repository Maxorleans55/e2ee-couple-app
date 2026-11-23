import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';

export type MessageBubbleProps = {
  text: string;
  mine: boolean;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  timestamp: number;
  onLongPress?: () => void;
};

export function MessageBubble({
  text,
  mine,
  status,
  timestamp,
  onLongPress,
}: MessageBubbleProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const time = new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={[styles.wrap, mine && styles.wrapMine]}>
      <Animated.View
        style={[
          styles.bubble,
          mine && styles.bubbleMine,
          { transform: [{ scale: scaleAnim }] },
          { opacity: opacityAnim },
        ]}
      >
        <Text style={[styles.text, mine && styles.textMine]}>{text}</Text>
        <View style={styles.statusRow}>
          <Text style={styles.time}>{time}</Text>
          {status === 'sending' && (
            <Animated.Text style={styles.statusDot} animate>
              ⟳
            </Animated.Text>
          )}
          {status === 'delivered' && <Text style={styles.statusDot}>✓✓</Text>}
          {status === 'read' && (
            <Text style={styles.statusRead}>✓✓</Text>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'flex-end',
    marginVertical: 6,
  },
  wrapMine: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
    backgroundColor: '#f5efe4',
    borderBottomRightRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  bubbleMine: {
    backgroundColor: '#ffe3d6',
    borderBottomRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderTopLeftRadius: 18,
  },
  text: {
    fontSize: 15,
    color: '#2d2d2d',
    lineHeight: 21,
  },
  textMine: {
    color: '#4a4a4a',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  time: {
    fontSize: 10,
    color: '#9a9a9a',
  },
  statusDot: {
    fontSize: 10,
    color: '#d46a6a',
  },
  statusRead: {
    fontSize: 10,
    color: '#7fb069',
  },
});
