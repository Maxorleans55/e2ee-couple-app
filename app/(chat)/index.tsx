import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { MessageBubble } from '@/components/MessageBubble';
import { TypingIndicator } from '@/components/TypingIndicator';
import { initSignalClient, sendEncryptedMessage, getClient } from '@/lib/crypto';
import { secureStore } from '@/lib/secureStore';
import { RelayClient } from '@/lib/relay';

const RELAY_URL = 'ws://localhost:8787';
const PARTNER_USER_ID = 'partner-device-1';

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
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<FlatList<any>>(null);
  const inputRef = useRef<TextInput>(null);
  const relayRef = useRef<RelayClient | null>(null);

  const scrollToBottom = useCallback(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    let mounted = true;

    const start = async () => {
      try {
        const getIdentityAssertion = async () => {
          return `device-identity-${Date.now()}`;
        };

        await initSignalClient({
          relayUrl: RELAY_URL,
          getIdentityAssertion,
          onMessage: (envelope) => {
            if (!mounted) return;
            setMessages((prev) => [
              ...prev,
              {
                id: envelope.conversationId,
                text: envelope.content,
                mine: false,
                timestamp: envelope.timestamp,
                status: 'delivered',
              },
            ]);
          },
        });

        const relay = new RelayClient();
        relayRef.current = relay;

        relay.onMessage((msg) => {
          if (!mounted) return;
          if (msg.type === 'message' && msg.from !== 'self') {
            // Message will be delivered via Signal Protocol hook
            console.log('[relay] incoming message envelope');
          }
          if (msg.type === 'auth_ok') {
            setPartnerOnline(true);
          }
        });

        relay.onConnect(() => {
          if (!mounted) return;
        });

        await relay.connect('device-identity');

        setInitialized(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize');
      }
    };

    start();

    return () => {
      mounted = false;
      relayRef.current?.disconnect();
    };
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const optimisticId = `opt-${Date.now()}`;
    const optimisticMsg = {
      id: optimisticId,
      text: input,
      mine: true,
      timestamp: Date.now(),
      status: 'sending' as const,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInput('');

    try {
      const client = getClient();
      const { type, body } = await sendEncryptedMessage(PARTNER_USER_ID, input);

      // Send via relay as envelope
      relayRef.current?.send({
        type: 'message',
        from: 'self',
        to: PARTNER_USER_ID,
        payload: JSON.stringify({ type, body }),
      });

      setMessages((prev) =>
        prev.map((m) =>
          m.id === optimisticId ? { ...m, status: 'delivered' } : m
        )
      );
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === optimisticId ? { ...m, status: 'sent' } : m
        )
      );
      setError(err instanceof Error ? err.message : 'Send failed');
    }
  };

  if (error && !initialized) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            setInitialized(false);
          }}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!initialized) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View style={[styles.pulse, { opacity: 1 }]}>
          <Text style={styles.loadingText}>Establishing secure session…</Text>
        </Animated.View>
      </View>
    );
  }

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
          <View style={[styles.presenceDot, styles.online]} />
          <Text style={styles.partnerName}>
            Partner · online
          </Text>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuText}>⋮</Text>
        </TouchableOpacity>
      </View>

      <FlatList
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
      </FlatList>

      <View style={styles.typingRow}>
        <TypingIndicator />
      </View>

      <View style={styles.inputBar}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={input}
          onChangeText={setInput}
          onFocus={() => {}}
          onBlur={() => {}}
          placeholder="Write something…"
          placeholderTextColor="#9a9a9a"
          multiline
          maxHeight={80}
          numberOfLines={4}
          selectionColor="#d46a6a"
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendMessage}
          disabled={!input.trim()}
        >
          <Text style={styles.sendText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdfaf5',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fdfaf5',
  },
  errorText: {
    fontSize: 15,
    color: '#b3402a',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#b3402a',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fdfaf5',
  },
  loadingText: {
    fontSize: 15,
    color: '#6b6b6b',
  },
  pulse: {
    animationDuration: '1.5s',
    animationIterationCount: 'infinite',
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
    backgroundColor: '#c7c7c7',
  },
  online: {
    backgroundColor: '#7fb069',
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
  typingRow: {
    paddingHorizontal: 16,
    paddingTop: 4,
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
