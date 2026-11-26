import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MessageBubble, MessageStatus } from '@/components/MessageBubble';
import { TypingIndicator } from '@/components/TypingIndicator';
import { Avatar, Backdrop, IconButton, LogoMark, tap, usePressScale } from '@/components/ui';
import { useAppStore } from '@/lib/store';
import { fonts, radius, useTheme, elevation } from '@/lib/theme';

type Message = {
  id: string;
  text: string;
  mine: boolean;
  timestamp: number;
  status: MessageStatus;
};

const DEMO = process.env.EXPO_PUBLIC_DEMO === '1';

function demoMessages(): Message[] {
  const t = Date.now() - 1000 * 60 * 42;
  const m = (i: number, text: string, mine: boolean, status: MessageStatus = 'read'): Message => ({
    id: `demo-${i}`,
    text,
    mine,
    timestamp: t + i * 1000 * 60 * 3,
    status,
  });
  return [
    m(0, 'Good morning, sunshine ☀️', false),
    m(1, 'Did you sleep okay?', false),
    m(2, 'Morning! Like a baby. You stole the blanket again though', true),
    m(3, 'Allegedly 😇', false),
    m(4, 'Dinner tonight? I found that little jollof place near Osu', false),
    m(5, 'Yes please. 7:30?', true),
    m(6, 'I’ll book the table by the window', true, 'delivered'),
  ];
}

const newId = () =>
  (globalThis.crypto?.randomUUID?.() as string | undefined) ?? Math.random().toString(36).slice(2);

export default function ChatScreen() {
  const router = useRouter();
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const partnerName = useAppStore((s) => s.partnerName);
  const isVerified = useAppStore((s) => s.isVerified);

  const [messages, setMessages] = useState<Message[]>(() => (DEMO ? demoMessages() : []));
  const [input, setInput] = useState('');
  const [partnerOnline] = useState(DEMO);
  const [partnerTyping] = useState(DEMO);
  const listRef = useRef<FlatList<Message>>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  const send = (text: string) => {
    const body = text.trim();
    if (!body) return;
    tap();
    // Not wired to the relay yet: messages stay local and remain "sending".
    setMessages((prev) => [
      ...prev,
      { id: newId(), text: body, mine: true, timestamp: Date.now(), status: 'sending' },
    ]);
    setInput('');
  };

  const hasText = input.trim().length > 0;

  return (
    <Backdrop>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            { paddingTop: insets.top + 8, borderBottomColor: c.line },
          ]}
        >
          <Avatar name={partnerName} size={44} online={partnerOnline} />
          <View style={styles.headerText}>
            <Text style={[styles.partnerName, { color: c.ink }]} numberOfLines={1}>
              {partnerName}
            </Text>
            <View style={styles.headerSubRow}>
              <Ionicons name="lock-closed" size={11} color={c.sage} />
              <Text style={[styles.headerSub, { color: c.inkSoft }]}>
                Encrypted · {partnerTyping ? 'typing…' : partnerOnline ? 'online' : 'offline'}
              </Text>
            </View>
          </View>
          <IconButton icon="images-outline" label="Shared memories" onPress={() => router.push('/memories')} />
          <IconButton icon="settings-outline" label="Settings" onPress={() => router.push('/settings')} />
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={[styles.listContent, messages.length === 0 && { flex: 1 }]}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
          ListHeaderComponent={
            messages.length > 0 ? (
              <View style={styles.listHeader}>
                <EncryptionNotice verified={isVerified} onPress={() => router.push('/verify')} />
                <Text style={[styles.daySep, { color: c.inkFaint }]}>Today</Text>
              </View>
            ) : null
          }
          ListEmptyComponent={<EmptyState name={partnerName} onVerify={() => router.push('/verify')} />}
          ListFooterComponent={partnerTyping ? <TypingIndicator /> : null}
          renderItem={({ item, index }) => {
            const prev = messages[index - 1];
            const next = messages[index + 1];
            return (
              <MessageBubble
                text={item.text}
                mine={item.mine}
                status={item.status}
                timestamp={item.timestamp}
                first={!prev || prev.mine !== item.mine}
                last={!next || next.mine !== item.mine}
              />
            );
          }}
        />

        {/* Composer */}
        <View style={[styles.composerWrap, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <View style={[styles.composer, { backgroundColor: c.surface, borderColor: c.line }, elevation(c, 2)]}>
            <Pressable hitSlop={8} style={styles.composerIcon} accessibilityLabel="Add attachment">
              <Ionicons name="add-circle" size={28} color={c.rose} />
            </Pressable>
            <TextInput
              style={[styles.input, { color: c.ink }]}
              value={input}
              onChangeText={setInput}
              placeholder={`Message ${partnerName}…`}
              placeholderTextColor={c.inkFaint}
              selectionColor={c.rose}
              multiline
              maxLength={4000}
              {...(Platform.OS === 'web' ? { rows: 1 } : {})}
            />
            <SendButton active={hasText} onPress={() => (hasText ? send(input) : send('❤️'))} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Backdrop>
  );
}

function SendButton({ active, onPress }: { active: boolean; onPress: () => void }) {
  const c = useTheme();
  const { scale, onPressIn, onPressOut } = usePressScale(0.88);
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        accessibilityLabel={active ? 'Send message' : 'Send a heart'}
      >
        <LinearGradient colors={c.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.send}>
          <Ionicons name={active ? 'arrow-up' : 'heart'} size={active ? 20 : 18} color={c.onAccent} />
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

function EncryptionNotice({ verified, onPress }: { verified: boolean; onPress: () => void }) {
  const c = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.notice, { backgroundColor: verified ? c.sageTint : c.surfaceAlt }]}
    >
      <Ionicons name={verified ? 'shield-checkmark' : 'lock-closed'} size={13} color={verified ? c.sage : c.inkSoft} />
      <Text style={[styles.noticeText, { color: verified ? c.sage : c.inkSoft }]}>
        {verified
          ? 'Verified · only you two can read this'
          : 'End-to-end encrypted · tap to verify'}
      </Text>
    </Pressable>
  );
}

function EmptyState({ name, onVerify }: { name: string; onVerify: () => void }) {
  const c = useTheme();
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyHalo, { backgroundColor: c.roseTint }]}>
        <LogoMark size={64} />
      </View>
      <Text style={[styles.emptyTitle, { color: c.ink }]}>
        Say something <Text style={{ fontFamily: fonts.displayItalic, color: c.rose }}>sweet</Text>
      </Text>
      <Text style={[styles.emptyBody, { color: c.inkSoft }]}>
        This is the start of your private space with {name}. Nobody else can join or read along.
      </Text>
      <Pressable onPress={onVerify} style={[styles.emptyLink, { borderColor: c.line, backgroundColor: c.surface }]}>
        <Ionicons name="finger-print" size={16} color={c.rose} />
        <Text style={[styles.emptyLinkText, { color: c.ink }]}>Verify safety number</Text>
        <Ionicons name="chevron-forward" size={15} color={c.inkFaint} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerText: { flex: 1, marginLeft: 2 },
  partnerName: { fontFamily: fonts.display, fontSize: 21, letterSpacing: -0.3 },
  headerSubRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 1 },
  headerSub: { fontFamily: fonts.medium, fontSize: 12.5 },
  listContent: { paddingBottom: 16 },
  listHeader: { alignItems: 'center', paddingTop: 16, gap: 14, marginBottom: 2 },
  daySep: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase' },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    marginHorizontal: 24,
  },
  noticeText: { fontFamily: fonts.medium, fontSize: 12.5 },
  composerWrap: { paddingHorizontal: 12, paddingTop: 8 },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 28,
    borderWidth: 1,
    padding: 6,
    gap: 4,
  },
  composerIcon: { width: 40, height: 44, alignItems: 'center', justifyContent: 'center' },
  input: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 16,
    minHeight: 44,
    maxHeight: 120,
    paddingTop: 11,
    paddingBottom: 11,
    paddingHorizontal: 4,
  },
  send: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36, gap: 12 },
  emptyHalo: { width: 132, height: 132, borderRadius: 66, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  emptyTitle: { fontFamily: fonts.display, fontSize: 28, letterSpacing: -0.5, textAlign: 'center' },
  emptyBody: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, textAlign: 'center' },
  emptyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginTop: 8,
  },
  emptyLinkText: { fontFamily: fonts.semibold, fontSize: 14 },
});
