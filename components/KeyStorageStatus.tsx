import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts, useTheme } from '@/lib/theme';

export type KeyStorageStatusProps = {
  /** null = still checking */
  available: boolean | null;
  /** null = not detectable on this platform yet */
  hardwareBacked: boolean | null;
};

export function KeyStorageStatus({ available, hardwareBacked }: KeyStorageStatusProps) {
  return (
    <View style={styles.container}>
      <StatusRow
        icon="key-outline"
        label="Secure key storage"
        state={available === null ? 'pending' : available ? 'ok' : 'bad'}
        value={available === null ? 'Checking…' : available ? 'Available' : 'Unavailable'}
      />
      <StatusRow
        icon="hardware-chip-outline"
        label="Hardware-backed"
        state={hardwareBacked === null ? 'pending' : hardwareBacked ? 'ok' : 'warn'}
        value={hardwareBacked === null ? 'Not checked' : hardwareBacked ? 'Yes' : 'Software only'}
      />
    </View>
  );
}

function StatusRow({
  icon,
  label,
  value,
  state,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  state: 'ok' | 'warn' | 'bad' | 'pending';
}) {
  const c = useTheme();
  const tone = {
    ok: { fg: c.sage, bg: c.sageTint },
    warn: { fg: c.peach, bg: c.roseTint },
    bad: { fg: c.danger, bg: c.dangerTint },
    pending: { fg: c.inkSoft, bg: c.surfaceAlt },
  }[state];
  return (
    <View style={styles.row}>
      <View style={[styles.icon, { backgroundColor: c.surfaceAlt }]}>
        <Ionicons name={icon} size={17} color={c.ink} />
      </View>
      <Text style={[styles.label, { color: c.ink }]}>{label}</Text>
      <View style={[styles.badge, { backgroundColor: tone.bg }]}>
        <Text style={[styles.badgeText, { color: tone.fg }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  icon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  label: { flex: 1, fontFamily: fonts.medium, fontSize: 15 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontFamily: fonts.bold, fontSize: 12 },
});
