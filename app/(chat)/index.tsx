import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { MessageBubble } from '@/components/MessageBubble';
import { TypingIndicator } from '@/components/TypingIndicator';
import { initSignalClient, sendEncryptedMessage, getClient } from '@/lib/crypto';
import { secureStore } from '@/lib/secureStore';
import { RelayClient } from '@/lib/relay';
import { theme } from '@/lib/theme';

const RELAY_URL = 'ws://localhost:8787';
const PARTNER_USER_ID = 'partner-device-1';

export type MessageBubbleColors = {
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  bubbleReceived: string;
  bubbleSent: string;
  primary: string;
};

export default function ChatScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors: MessageBubbleColors = {
    background: isDark ? theme.colors.backgroundDark : theme.colors.background,
    surface: isDark ? theme.colors.surfaceDark : theme.colors.surface,
    primary: isDark ? theme.colors.primaryDark : theme.colors.primary,
    text: isDark ? theme.colors.textDark : theme.colors.text,
    textMuted: isDark ? theme.colors.textMutedDark : theme.colors.textMuted,
    border: isDark ? theme.colors.borderDark : theme.colors.border,
    bubbleReceived: isDark
      ? theme.colors.bubbleReceivedDark
      : theme.colors.bubbleReceived,
    bubbleSent: isDark ? theme.colors.bubbleSentDark : theme.colors.bubbleSent,
  };

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
  const relayRef = useRef<InstanceType<typeof RelayClient> | null>(null);

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

        await initSignalClient(
          RELAY_URL,
          getIdentityAssertion,
          (envelope: {
            messageId: string;
            conversationId: string;
            senderId: string;
            senderDeviceId: number;
            content: string;
            timestamp: number;
            receivedAt: number;
          }) => {
            if (!mounted) return;
            setMessages((prev) => [
              ...prev,
              {
                id: envelope.messageId,
                text: envelope.content,
                mine: false,
                timestamp: envelope.timestamp,
                status: 'delivered',
              },
            ]);
          }
        );

        const relay = new RelayClient();
        relayRef.current = relay;

        relay.onMessage((msg: { type: string }) => {
          if (!mounted) return;
          if (msg.type === 'auth_ok') {
            setPartnerOnline(true);
          }
        });

        await relay.connect('device-identity');

        setInitialized(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize');
      }
    };

    let setPartnerOnline = (v: boolean) => {};

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
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.textMuted }]}>
          {error}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
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
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>
          Establishing secure session…
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View
        style={[
          styles.header,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={[styles.backText, { color: colors.textMuted }]}>←</Text>
        </TouchableOpacity>
        <View style={styles.partnerStatus}>
          <View style={[styles.presenceDot, { backgroundColor: theme.colors.success }]} />
          <Text style={[styles.partnerName, { color: colors.text }]}>
            Partner · online
          </Text>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={[styles.menuText, { color: colors.textMuted }]}>⋮</Text>
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
            colors={colors}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.typingRow}>
        <TypingIndicator colors={colors} />
      </View>

      <View
        style={[
          styles.inputBar,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            {
              backgroundColor: isDark ? '#3d322f' : colors.surface,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          value={input}
          onChangeText={setInput}
          placeholder="Write something…"
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={4}
          selectionColor={colors.primary}
        />
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: colors.primary }]}
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
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
  },
  loadingText: {
    fontSize: 15,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 20,
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
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '700',
  },
  menuButton: {
    padding: 8,
  },
  menuText: {
    fontSize: 20,
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
    paddingBottom: 20,
  },
  input: {
    flex: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    minHeight: 44,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: {
    color: '#ffffff',
    fontSize: 20,
    lineHeight: 20,
  },
});
