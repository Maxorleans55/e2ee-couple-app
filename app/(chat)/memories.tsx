import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function MemoriesScreen() {
  const router = useRouter();
  const [memories, setMemories] = useState<Array<{
    id: string;
    title: string;
    date: string;
    photo: string;
    note: string;
  }>>([]);

  useEffect(() => {
    setMemories([
      {
        id: '1',
        title: 'First coffee together',
        date: 'Mar 14, 2024',
        photo: '☕',
        note: 'The morning we decided to build this app.',
      },
      {
        id: '2',
        title: 'Rainy afternoon',
        date: 'Apr 3, 2024',
        photo: '🌧️',
        note: 'Stayed in and watched movies all day.',
      },
    ]);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Shared Memories</Text>
        <View style={styles.spacer} />
      </View>

      <View style={styles.grid}>
        {memories.map((m) => (
          <MemoryCard key={m.id} memory={m} />
        ))}
      </View>
    </View>
  );
}

function MemoryCard({ memory }: { memory: { id: string; title: string; date: string; photo: string; note: string } }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85}>
      <View style={styles.photo}>{memory.photo}</View>
      <Text style={styles.title}>{memory.title}</Text>
      <Text style={styles.date}>{memory.date}</Text>
      <Text style={styles.note}>{memory.note}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdfaf5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e8ded4',
    backgroundColor: '#ffffff',
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 20,
    color: '#8a8a8a',
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: '#2d2d2d',
    marginLeft: 4,
  },
  spacer: {},
  grid: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e8ded4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  photo: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2d2d2d',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#8a8a8a',
    marginBottom: 8,
  },
  note: {
    fontSize: 13,
    color: '#5a5a5a',
    lineHeight: 18,
  },
});
