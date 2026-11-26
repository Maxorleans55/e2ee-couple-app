import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { fonts, useTheme, elevation } from '@/lib/theme';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export type MessageBubbleProps = {
  text: string;
  mine: boolean;
  status: MessageStatus;
  timestamp: number;
  /** First message in a run from the same sender. */
  first?: boolean;
  /** Last message in a run from the same sender (gets the tail + meta). */
  last?: boolean;
  onLongPress?: () => void;
};

const R = 22;
const TAIL = 6;

export function MessageBubble({
  text,
  mine,
  status,
  timestamp,
  first = true,
  last = true,
  onLongPress,
}: MessageBubbleProps) {
  const c = useTheme();
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(enter, { toValue: 1, useNativeDriver: true, speed: 16, bounciness: 7 }).start();
  }, [enter]);

  const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Grouped corners: the side facing the sender tightens between consecutive bubbles.
  const corners = mine
    ? {
        borderTopLeftRadius: R,
        borderBottomLeftRadius: R,
        borderTopRightRadius: first ? R : TAIL,
        borderBottomRightRadius: TAIL,
      }
    : {
        borderTopRightRadius: R,
        borderBottomRightRadius: R,
        borderTopLeftRadius: first ? R : TAIL,
        borderBottomLeftRadius: TAIL,
      };

  const animated = {
    opacity: enter,
    transform: [
      { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) },
      { scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) },
    ],
  };

  const meta = (
    <View style={styles.meta}>
      <Text style={[styles.time, { color: mine ? 'rgba(255,255,255,0.82)' : c.inkFaint }]}>{time}</Text>
      {mine && <StatusIcon status={status} />}
    </View>
  );

  return (
    <Animated.View
      style={[
        styles.row,
        { justifyContent: mine ? 'flex-end' : 'flex-start', marginTop: first ? 10 : 2 },
        animated,
      ]}
    >
      <Pressable onLongPress={onLongPress} style={{ maxWidth: '78%' }}>
        {mine ? (
          <LinearGradient
            colors={c.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.bubble, corners, last && elevation({ ...c, shadow: c.rose }, 1)]}
          >
            <Text style={[styles.text, { color: c.onAccent }]}>{text}</Text>
            {last && meta}
          </LinearGradient>
        ) : (
          <View
            style={[
              styles.bubble,
              corners,
              { backgroundColor: c.bubbleTheirs, borderWidth: c.mode === 'light' ? 1 : 0, borderColor: c.line },
              last && elevation(c, 1),
            ]}
          >
            <Text style={[styles.text, { color: c.ink }]}>{text}</Text>
            {last && meta}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

function StatusIcon({ status }: { status: MessageStatus }) {
  const color = 'rgba(255,255,255,0.9)';
  switch (status) {
    case 'sending':
      return <Ionicons name="time-outline" size={12} color={color} />;
    case 'sent':
      return <Ionicons name="checkmark" size={13} color={color} />;
    case 'delivered':
      return <Ionicons name="checkmark-done" size={14} color={color} />;
    case 'read':
      return <Ionicons name="heart" size={12} color="#FFFFFF" />;
  }
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', paddingHorizontal: 16 },
  bubble: { paddingHorizontal: 15, paddingTop: 10, paddingBottom: 9 },
  text: { fontFamily: fonts.body, fontSize: 15.5, lineHeight: 22 },
  meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 3 },
  time: { fontFamily: fonts.medium, fontSize: 10.5 },
});
