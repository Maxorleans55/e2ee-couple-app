import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type KeyStorageStatusProps = {
  available: boolean;
  hardwareBacked: boolean;
};

export function KeyStorageStatus({ available, hardwareBacked }: KeyStorageStatusProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.dot} />
        <Text style={styles.label}>Secure Store available</Text>
        <Text style={styles.value}>{available ? 'Yes' : 'No'}</Text>
      </View>
      <View style={styles.row}>
        <View style={styles.dot} />
        <Text style={styles.label}>Hardware-backed (Keychain/Keystore)</Text>
        <Text style={styles.value}>{hardwareBacked ? 'Yes' : 'Software fallback'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e8ded4',
    margin: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#7fb069',
  },
  label: {
    flex: 1,
    fontSize: 13,
    color: '#5a5a5a',
  },
  value: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2d2d2d',
  },
});
