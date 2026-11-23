import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { KeyStorageStatus } from '@/components/KeyStorageStatus';
import { useAppStore } from '@/lib/store';

export default function SettingsScreen() {
  const { theme, setTheme, isVerified, setIsVerified } = useAppStore();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Security</Text>
        <KeyStorageStatus available={true} hardwareBacked={true} />
        <TouchableOpacity
          style={styles.row}
          onPress={() => setIsVerified(!isVerified)}
        >
          <Text style={styles.rowLabel}>Verify partner identity</Text>
          <Text style={styles.rowValue}>{isVerified ? 'Verified' : 'Pending'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <TouchableOpacity style={styles.row} onPress={() => setTheme('light')}>
          <Text style={styles.rowLabel}>Light theme</Text>
          <Text style={styles.rowValue}>{theme === 'light' ? 'Active' : ''}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={() => setTheme('dark')}>
          <Text style={styles.rowLabel}>Dark theme</Text>
          <Text style={styles.rowValue}>{theme === 'dark' ? 'Active' : ''}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdfaf5',
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e8ded4',
  },
  sectionTitle: {
    fontSize: 13,
    color: '#8a8a8a',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0e7da',
  },
  rowLabel: {
    fontSize: 15,
    color: '#2d2d2d',
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#7fb069',
  },
});
