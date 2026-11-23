import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { theme } from '@/lib/theme';

export type MessageBubbleColors = {
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  bubbleReceived: string;
  bubbleSent: string;
  primary: string;
};

export type MessageBubbleProps = {
  text: string;
  mine: boolean;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  timestamp: number;
  onLongPress?: () => void;
  colors: MessageBubbleColors;
};

export function MessageBubble({
  text,
  mine,
  status,
  timestamp,
  onLongPress,
  colors,
}: MessageBubbleProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: theme.motion.fast,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: theme.motion.fast,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const time = new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const bubbleColor = mine ? colors.bubbleSent : colors.bubbleReceived;
  const textColor = mine ? '#ffffff' : colors.text;

  return (
    <View style={[styles.wrap, mine && styles.wrapMine]}>
      <TouchableOpacity
        style={[styles.bubbleTouch]}
        onLongPress={onLongPress}
        activeOpacity={0.9}
      >
        <Animated.View
          style={[
            styles.bubble,
            mine && styles.bubbleMine,
            { backgroundColor: bubbleColor },
            { transform: [{ scale: scaleAnim }] },
            { opacity: opacityAnim },
          ]}
        >
          <Text style={[styles.text, { color: textColor }]}>{text}</Text>
          <View style={styles.statusRow}>
            <Text style={[styles.time, { color: colors.textMuted }]}>
              {time}
            </Text>
            {status === 'sending' && (
              <Animated.Text
                style={[styles.statusDot, { color: colors.primary }]}
              >
                ⟳
              </Animated.Text>
            )}
            {status === 'delivered' && (
              <Text style={[styles.statusDot, { color: colors.textMuted }]}>
                ✓✓
              </Text>
            )}
            {status === 'read' && (
              <Text style={[styles.statusRead, { color: theme.colors.success }]}>
                ✓✓
              </Text>
            )}
          </View>
        </Animated.View>
      </TouchableOpacity>
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
  bubbleTouch: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  bubbleMine: {
    borderBottomRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderTopLeftRadius: 18,
  },
  text: {
    fontSize: 15,
    lineHeight: 21,
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
  },
  statusDot: {
    fontSize: 10,
  },
  statusRead: {
    fontSize: 10,
  },
});
