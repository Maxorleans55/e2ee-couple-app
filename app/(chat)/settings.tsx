import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { KeyStorageStatus } from '@/components/KeyStorageStatus';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Avatar, Backdrop, Card, SectionLabel, tap } from '@/components/ui';
import { Theme, useAppStore } from '@/lib/store';
import { fonts, radius, useTheme } from '@/lib/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export default function SettingsScreen() {
  const c = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, setTheme, isVerified, partnerName } = useAppStore();
  const [storeAvailable, setStoreAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    SecureStore.isAvailableAsync()
      .then(setStoreAvailable)
      .catch(() => setStoreAvailable(false));
  }, []);

  return (
    <Backdrop>
      <ScreenHeader title="Settings" />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: 8, paddingBottom: insets.bottom + 32, gap: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Couple card */}
        <Card style={styles.couple}>
          <View style={styles.avatars}>
            <Avatar name="You" size={56} ring={c.surface} />
            <View style={{ marginLeft: -16 }}>
              <Avatar name={partnerName} size={56} ring={c.surface} />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.coupleTitle, { color: c.ink }]}>
              You <Text style={{ fontFamily: fonts.displayItalic, color: c.rose }}>&</Text> {partnerName}
            </Text>
            <View style={[styles.statusChip, { backgroundColor: isVerified ? c.sageTint : c.roseTint }]}>
              <Ionicons
                name={isVerified ? 'shield-checkmark' : 'shield-outline'}
                size={12}
                color={isVerified ? c.sage : c.rose}
              />
              <Text style={[styles.statusChipText, { color: isVerified ? c.sage : c.rose }]}>
                {isVerified ? 'Identity verified' : 'Not verified yet'}
              </Text>
            </View>
          </View>
        </Card>

        <View>
          <SectionLabel>Security</SectionLabel>
          <Card style={styles.group}>
            <KeyStorageStatus available={storeAvailable} hardwareBacked={null} />
            <Divider />
            <Row
              icon="finger-print"
              label="Verify safety number"
              value={isVerified ? 'Verified' : 'Pending'}
              valueTone={isVerified ? 'sage' : 'rose'}
              onPress={() => router.push('/verify')}
            />
          </Card>
        </View>

        <View>
          <SectionLabel>Appearance</SectionLabel>
          <Card style={[styles.group, { paddingVertical: 14 }]}>
            <Segmented
              value={theme}
              onChange={setTheme}
              options={[
                { value: 'system', label: 'Auto', icon: 'phone-portrait-outline' },
                { value: 'light', label: 'Light', icon: 'sunny-outline' },
                { value: 'dark', label: 'Dark', icon: 'moon-outline' },
              ]}
            />
          </Card>
        </View>

        <View>
          <SectionLabel>About</SectionLabel>
          <Card style={styles.group}>
            <Row icon="information-circle-outline" label="Version" value={Constants.expoConfig?.version ?? '1.0.0'} />
            <Divider />
            <Row icon="document-text-outline" label="Security model" onPress={() => {}} />
          </Card>
        </View>

        <Text style={[styles.footer, { color: c.inkFaint }]}>
          Made with <Text style={{ color: c.rose }}>♥</Text> for two
        </Text>
      </ScrollView>
    </Backdrop>
  );
}

function Divider() {
  const c = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: c.line, marginLeft: 46 }} />;
}

function Row({
  icon,
  label,
  value,
  valueTone,
  onPress,
}: {
  icon: IconName;
  label: string;
  value?: string;
  valueTone?: 'sage' | 'rose';
  onPress?: () => void;
}) {
  const c = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}
    >
      <View style={[styles.rowIcon, { backgroundColor: c.surfaceAlt }]}>
        <Ionicons name={icon} size={17} color={c.ink} />
      </View>
      <Text style={[styles.rowLabel, { color: c.ink }]}>{label}</Text>
      {value && (
        <Text
          style={[
            styles.rowValue,
            { color: valueTone === 'sage' ? c.sage : valueTone === 'rose' ? c.rose : c.inkSoft },
          ]}
        >
          {value}
        </Text>
      )}
      {onPress && <Ionicons name="chevron-forward" size={16} color={c.inkFaint} />}
    </Pressable>
  );
}

function Segmented({
  value,
  onChange,
  options,
}: {
  value: Theme;
  onChange: (v: Theme) => void;
  options: { value: Theme; label: string; icon: IconName }[];
}) {
  const c = useTheme();
  return (
    <View style={[styles.segment, { backgroundColor: c.surfaceAlt }]}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => {
              tap();
              onChange(o.value);
            }}
            style={[
              styles.segmentItem,
              active && { backgroundColor: c.surface, shadowColor: c.shadow, shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
            ]}
          >
            <Ionicons name={o.icon} size={15} color={active ? c.rose : c.inkSoft} />
            <Text style={[styles.segmentText, { color: active ? c.ink : c.inkSoft }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  couple: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 18, borderRadius: radius.xl },
  avatars: { flexDirection: 'row' },
  coupleTitle: { fontFamily: fonts.display, fontSize: 21, letterSpacing: -0.3 },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 6,
  },
  statusChipText: { fontFamily: fonts.bold, fontSize: 12 },
  group: { paddingHorizontal: 14, paddingVertical: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  rowIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, fontFamily: fonts.medium, fontSize: 15 },
  rowValue: { fontFamily: fonts.semibold, fontSize: 14 },
  segment: { flexDirection: 'row', borderRadius: 14, padding: 4 },
  segmentItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 11,
  },
  segmentText: { fontFamily: fonts.semibold, fontSize: 14 },
  footer: { fontFamily: fonts.medium, fontSize: 13, textAlign: 'center' },
});
