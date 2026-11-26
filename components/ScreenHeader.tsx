import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts, useTheme } from '@/lib/theme';
import { IconButton } from './ui';

export function ScreenHeader({
  title,
  eyebrow,
  right,
  close,
}: {
  title: string;
  eyebrow?: string;
  right?: React.ReactNode;
  /** Show a close (×) instead of a back arrow — for modals. */
  close?: boolean;
}) {
  const c = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 8 }]}>
      <View style={styles.bar}>
        <IconButton
          icon={close ? 'close' : 'chevron-back'}
          label={close ? 'Close' : 'Back'}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/chat'))}
        />
        <View style={{ flex: 1 }} />
        {right}
      </View>
      {eyebrow && <Text style={[styles.eyebrow, { color: c.rose }]}>{eyebrow}</Text>}
      <Text style={[styles.title, { color: c.ink }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 20, paddingBottom: 8 },
  bar: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  eyebrow: { fontFamily: fonts.bold, fontSize: 12, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 4 },
  title: { fontFamily: fonts.display, fontSize: 34, letterSpacing: -0.8 },
});
