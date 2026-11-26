import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  StyleProp,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Palette, fonts, radius, elevation, useTheme } from '@/lib/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

/** Full-screen warm background with two soft colour glows. */
export function Backdrop({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const c = useTheme();
  return (
    <View style={[{ flex: 1, backgroundColor: c.bg, overflow: 'hidden' }, style]}>
      <LinearGradient
        colors={[c.bgGlowA, c.bg, c.bg, c.bgGlowB]}
        locations={[0, 0.42, 0.62, 1]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {children}
    </View>
  );
}

/** Press feedback: a gentle spring scale + light haptic. */
export function usePressScale(to = 0.96) {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () => {
    Animated.spring(scale, { toValue: to, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }).start();
  };
  return { scale, onPressIn, onPressOut };
}

export function tap() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

export function GradientButton({
  label,
  onPress,
  icon,
  loading,
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const c = useTheme();
  const { scale, onPressIn, onPressOut } = usePressScale();
  return (
    <Animated.View style={[{ transform: [{ scale }], opacity: disabled ? 0.5 : 1 }, style]}>
      <Pressable
        onPress={() => {
          tap();
          onPress();
        }}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <LinearGradient
          colors={c.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradientBtn, elevation({ ...c, shadow: c.rose }, 2)]}
        >
          {loading ? (
            <ActivityIndicator color={c.onAccent} />
          ) : (
            <>
              <Text style={[styles.gradientBtnText, { color: c.onAccent }]}>{label}</Text>
              {icon && <Ionicons name={icon} size={18} color={c.onAccent} />}
            </>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

export function GhostButton({ label, onPress, icon }: { label: string; onPress: () => void; icon?: IconName }) {
  const c = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.ghostBtn,
        { borderColor: c.line, backgroundColor: pressed ? c.surfaceAlt : 'transparent' },
      ]}
    >
      {icon && <Ionicons name={icon} size={17} color={c.inkSoft} />}
      <Text style={[styles.ghostBtnText, { color: c.inkSoft }]}>{label}</Text>
    </Pressable>
  );
}

export function IconButton({
  icon,
  onPress,
  label,
  tinted,
}: {
  icon: IconName;
  onPress?: () => void;
  label: string;
  tinted?: boolean;
}) {
  const c = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={({ pressed }) => [
        styles.iconBtn,
        {
          backgroundColor: tinted ? c.roseTint : c.surface,
          borderColor: tinted ? 'transparent' : c.line,
          transform: [{ scale: pressed ? 0.92 : 1 }],
        },
      ]}
    >
      <Ionicons name={icon} size={19} color={tinted ? c.rose : c.ink} />
    </Pressable>
  );
}

export function Avatar({
  name,
  size = 44,
  online,
  ring,
}: {
  name: string;
  size?: number;
  online?: boolean;
  ring?: string;
}) {
  const c = useTheme();
  const initial = (name.trim()[0] ?? '?').toUpperCase();
  return (
    <View style={{ width: size, height: size }}>
      <LinearGradient
        colors={c.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: ring ? 3 : 0,
          borderColor: ring,
        }}
      >
        <Text style={{ color: c.onAccent, fontFamily: fonts.display, fontSize: size * 0.42 }}>{initial}</Text>
      </LinearGradient>
      {online !== undefined && (
        <View
          style={[
            styles.presence,
            {
              width: size * 0.3,
              height: size * 0.3,
              borderRadius: size * 0.15,
              backgroundColor: online ? c.sage : c.inkFaint,
              borderColor: c.surface,
            },
          ]}
        />
      )}
    </View>
  );
}

/** The UsTwo mark: two interlocking rings. */
export function LogoMark({ size = 72 }: { size?: number }) {
  const c = useTheme();
  const ring = size * 0.62;
  const stroke = Math.max(3, size * 0.075);
  return (
    <View style={{ width: size * 1.1, height: size * 0.8, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          position: 'absolute',
          left: 0,
          width: ring,
          height: ring,
          borderRadius: ring / 2,
          borderWidth: stroke,
          borderColor: c.rose,
        }}
      />
      <View
        style={{
          position: 'absolute',
          right: 0,
          width: ring,
          height: ring,
          borderRadius: ring / 2,
          borderWidth: stroke,
          borderColor: c.peach,
        }}
      />
    </View>
  );
}

export function Pill({ icon, label, tone = 'neutral' }: { icon?: IconName; label: string; tone?: 'neutral' | 'rose' | 'sage' }) {
  const c = useTheme();
  const bg = tone === 'rose' ? c.roseTint : tone === 'sage' ? c.sageTint : c.surfaceAlt;
  const fg = tone === 'rose' ? c.rose : tone === 'sage' ? c.sage : c.inkSoft;
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      {icon && <Ionicons name={icon} size={13} color={fg} />}
      <Text style={[styles.pillText, { color: fg }]}>{label}</Text>
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const c = useTheme();
  return (
    <View
      style={[
        { backgroundColor: c.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: c.line },
        elevation(c, 1),
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function SectionLabel({ children }: { children: string }) {
  const c = useTheme();
  return <Text style={[styles.section, { color: c.inkFaint }]}>{children}</Text>;
}

export function makeStyles<T extends StyleSheet.NamedStyles<T>>(fn: (c: Palette) => T) {
  return () => {
    const c = useTheme();
    return React.useMemo(() => StyleSheet.create(fn(c)), [c]);
  };
}

const styles = StyleSheet.create({
  gradientBtn: {
    height: 56,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },
  gradientBtnText: { fontFamily: fonts.bold, fontSize: 16, letterSpacing: 0.2 },
  ghostBtn: {
    height: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  ghostBtnText: { fontFamily: fonts.semibold, fontSize: 15 },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  presence: { position: 'absolute', right: -1, bottom: -1, borderWidth: 2.5 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  pillText: { fontFamily: fonts.semibold, fontSize: 12.5 },
  section: {
    fontFamily: fonts.bold,
    fontSize: 11.5,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginLeft: 4,
  },
});
