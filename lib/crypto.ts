import { createHostedSignalProtocolClient } from '@open-e2ee/signal-protocol-sdk';
import { expoStore } from '@open-e2ee/signal-protocol-sdk/local/store/expo';
import 'react-native-get-random-values';
import { secureStore, KEYS_STORAGE_KEY, IdentityKeys } from './secureStore';

export type SignalEnvelope = {
  conversationId: string;
  content: string;
  sender: string;
  timestamp: number;
};

let signalClient: ReturnType<typeof createHostedSignalProtocolClient> | null =
  null;

let onMessageHandler: ((envelope: SignalEnvelope) => void) | null = null;

export async function initSignalClient({
  relayUrl,
  getIdentityAssertion,
  onMessage,
}: {
  relayUrl: string;
  getIdentityAssertion: () => Promise<string>;
  onMessage: (envelope: SignalEnvelope) => void;
}): Promise<ReturnType<typeof createHostedSignalProtocolClient>> {
  if (signalClient) return signalClient;

  onMessageHandler = onMessage;

  const storage = await expoStore();
  signalClient = createHostedSignalProtocolClient({
    hosted: { relayUrl, getIdentityAssertion },
    adapters: { storage },
  });

  signalClient.registerHook('onMessageDecrypted', (envelope: any) => {
    if (onMessageHandler) {
      onMessageHandler({
        conversationId: envelope.conversationId,
        content: envelope.content,
        sender: envelope.sender ?? '',
        timestamp: Date.now(),
      });
    }
  });

  signalClient.startRelaySubscription();

  return signalClient;
}

export async function sendEncryptedMessage(
  recipientUserId: string,
  plaintext: string
): Promise<{ type: string; body: string }> {
  if (!signalClient) throw new Error('Signal client not initialized');
  return signalClient.send(recipientUserId, plaintext);
}

export async function decryptIncomingMessage(
  senderUserId: string,
  type: string,
  body: string
): Promise<string> {
  if (!signalClient) throw new Error('Signal client not initialized');
  return signalClient.decrypt(senderUserId, type, body);
}

export async function getSafetyNumber(peerUserId: string): Promise<string> {
  if (!signalClient) throw new Error('Signal client not initialized');
  return signalClient.getSafetyNumber(peerUserId);
}

export function getClient(): ReturnType<typeof createHostedSignalProtocolClient> {
  if (!signalClient) throw new Error('Signal client not initialized');
  return signalClient;
}

export async function getStoredIdentity(): Promise<IdentityKeys | null> {
  const existing = await secureStore.get(KEYS_STORAGE_KEY);
  if (!existing) return null;
  return JSON.parse(existing) as IdentityKeys;
}

export async function storeIdentity(keys: IdentityKeys): Promise<void> {
  await secureStore.set(KEYS_STORAGE_KEY, JSON.stringify(keys));
}
