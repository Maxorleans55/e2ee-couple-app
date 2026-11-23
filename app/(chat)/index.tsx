import { View, Text, TouchableOpacity, FlatList, TextInput, KeyboardAvoidingView, Platform, Keyboard, StyleSheet } from 'react-native';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Animated } from 'react-native';

export default function ChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Array<{
    id: string;
    text: string;
    mine: boolean;
    timestamp: number;
    status: 'sending' | 'sent' | 'delivered' | 'read';
  }>>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [partnerOnline, setPartnerOnline] = useState(false);
  const listRef = useRef<FlashList<any>>(null);
  const inputRef = useRef<TextInput>(null);

  const scrollToBottom = useCallback(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg = {
      id: crypto.randomUUID?.() || Math.random().toString(36).slice(2),
      text: input,
      mine: true,
      timestamp: Date.now(),
      status: 'sending' as const,
    };
    setMessages((prev) => [...prev, msg]);
    setInput('');
    setTyping(false);
    // Simulate delivery
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, status: 'delivered' } : m))
      );
    }, 1200);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.partnerStatus}>
          <View
            style={[
              styles.presenceDot,
              partnerOnline ? styles.online : styles.offline,
            ]}
          />
          <Text style={styles.partnerName}>
            Partner {partnerOnline ? '· online' : '· offline'}
          </Text>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuText}>⋮</Text>
        </TouchableOpacity>
      </View>

      <FlashList
        ref={listRef}
        data={messages}
        renderItem={({ item }) => (
          <MessageBubble
            text={item.text}
            mine={item.mine}
            status={item.status}
            timestamp={item.timestamp}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      </View>

      <View style={styles.typingRow}>
        {typing && <Text style={styles.typingText}>Partner is typing…</Text>}
      </View>

      <View style={styles.inputBar}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={input}
          onChangeText={setInput}
          onFocus={() => setTyping(true)}
          onBlur={() => setTyping(false)}
          placeholder="Write something…"
          placeholderTextColor="#9a9a9a"
          multiline
          maxHeight={80}
          numberOfLines={4}
          selectionColor="#d46a6a"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={!input.trim()}>
          <Text style={styles.sendText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function MessageBubble({
  text,
  mine,
  status,
  timestamp,
}: {
  text: string;
  mine: boolean;
  status: string;
  timestamp: number;
}) {
  const time = new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={[styles.bubbleWrap, mine && styles.bubbleWrapMine]}>
      <Animated.View style={[styles.bubble, mine && styles.bubbleMine]}>
        <Text style={[styles.bubbleText, mine && styles.bubbleTextMine]}>
          {text}
        </Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusText}>{time}</Text>
          {status === 'sending' && (
            <Animated.Text style={styles.statusText}>⟳</Animated.Text>
          )}
          {status === 'delivered' && <Text style={styles.statusText}>✓✓</Text>}
        </View>
      </Animated.View>
    </View>
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
  partnerStatus: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  presenceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#b3402a',
  },
  online: {
    backgroundColor: '#7fb069',
  },
  offline: {
    backgroundColor: '#c7c7c7',
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2d2d2d',
  },
  menuButton: {
    padding: 8,
  },
  menuText: {
    fontSize: 20,
    color: '#8a8a8a',
  },
  listContent: {
    padding: 12,
    paddingBottom: 100,
    gap: 10,
  },
  bubbleWrap: {
    alignItems: 'flex-end',
  },
  bubbleWrapMine: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
    backgroundColor: '#f5efe4',
    borderBottomRightRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  bubbleMine: {
    backgroundColor: '#ffe3d6',
    borderBottomRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    color: '#2d2d2d',
    lineHeight: 21,
  },
  bubbleTextMine: {
    color: '#4a4a4a',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    color: '#9a9a9a',
  },
  typingRow: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  typingText: {
    fontSize: 13,
    color: '#8a8a8a',
    fontStyle: 'italic',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#e8ded4',
    backgroundColor: '#ffffff',
    paddingBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: '#f5efe4',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#2d2d2d',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e8ded4',
    minHeight: 44,
  },
  sendButton: {
    backgroundColor: '#d46a6a',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#d46a6a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  sendText: {
    color: '#ffffff',
    fontSize: 20,
    lineHeight: 20,
  },
});
