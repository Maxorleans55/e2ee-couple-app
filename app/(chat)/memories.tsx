import { ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/ScreenHeader';
import { AddMemoryCard, MemoryCard } from '@/components/MemoryCard';
import { Backdrop, IconButton } from '@/components/ui';
import { fonts, useTheme } from '@/lib/theme';

type Memory = { id: string; title: string; date: string; photo: string; note: string };

// Placeholder content until memories are stored in the encrypted local DB.
const MEMORIES: Memory[] = [
  { id: '1', title: 'First coffee together', date: 'Mar 14, 2024', photo: '☕', note: 'The morning we decided to build this app.' },
  { id: '2', title: 'Rainy afternoon', date: 'Apr 3, 2024', photo: '🌧️', note: 'Stayed in and watched movies all day.' },
  { id: '3', title: 'Beach at sunset', date: 'Jun 21, 2024', photo: '🌅', note: 'Sand everywhere. Worth it.' },
];

export default function MemoriesScreen() {
  const c = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Backdrop>
      <ScreenHeader
        eyebrow="Just for us"
        title="Shared memories"
        right={<IconButton icon="add" label="Add memory" tinted />}
      />
      <Text style={[styles.count, { color: c.inkSoft }]}>
        {MEMORIES.length} moments · encrypted on both phones
      </Text>
      <ScrollView contentContainerStyle={[styles.grid, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        {MEMORIES.map((m, i) => (
          <MemoryCard key={m.id} {...m} tone={i} />
        ))}
        <AddMemoryCard />
      </ScrollView>
    </Backdrop>
  );
}

const styles = StyleSheet.create({
  count: { fontFamily: fonts.medium, fontSize: 14, paddingHorizontal: 20, marginBottom: 16 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
    paddingHorizontal: 20,
  },
});
