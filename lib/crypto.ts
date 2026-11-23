import {
  createHostedSignalProtocolClient,
  keys,
  type SafetyNumber,
  type DefaultSignalProtocolClient,
} from '@open-e2ee/signal-protocol-sdk';
import { expoStore } from '@open-e2ee/signal-protocol-sdk/local/store/expo';
import 'react-native-get-random-values';
import {
  secureStore,
  KEYS_STORAGE_KEY,
  type IdentityKeys,
} from './secureStore';
import type { IncomingEnvelope, ReceiveOutcome } from '@open-e2ee/signal-protocol-sdk';

let signalClient: DefaultSignalProtocolClient | null = null;

export interface CryptoClient {
  sendEncryptedMessage(
    recipientUserId: string,
    plaintext: string
  ): Promise<{ type: string; body: string }>;
  decryptIncomingMessage(
    senderUserId: string,
    type: string,
    body: string
  ): Promise<string>;
  registerIdentity(): Promise<IdentityKeys>;
  getSafetyNumber(peerUserId: string): Promise<string>;
  confirmSafetyNumber(confirmation: unknown): Promise<void>;
}

export async function initSignalClient(
  relayUrl: string,
  getIdentityAssertion: () => Promise<string>,
  onMessageDecrypted: (envelope: {
    messageId: string;
    conversationId: string;
    senderId: string;
    senderDeviceId: number;
    content: string;
    timestamp: number;
    receivedAt: number;
  }) => void
): Promise<DefaultSignalProtocolClient> {
  if (signalClient) return signalClient;

  const storage = await expoStore();
  signalClient = await createHostedSignalProtocolClient({
    hosted: { relayUrl, getIdentityAssertion },
    adapters: { storage },
  });

  signalClient.registerHook('onMessageDecrypted', (envelope) => {
    onMessageDecrypted({
      messageId: envelope.messageId,
      conversationId: envelope.conversationId,
      senderId: envelope.senderId,
      senderDeviceId: envelope.senderDeviceId,
      content: envelope.content,
      timestamp: envelope.timestamp,
      receivedAt: envelope.receivedAt,
    });
  });

  signalClient.startRelaySubscription();

  return signalClient;
}

export function getClient(): DefaultSignalProtocolClient {
  if (!signalClient) {
    throw new Error('Signal client not initialized. Call initSignalClient first.');
  }
  return signalClient;
}

export async function registerIdentity(): Promise<IdentityKeys> {
  const existing = await secureStore.get(KEYS_STORAGE_KEY);
  if (existing) {
    return JSON.parse(existing) as IdentityKeys;
  }

  const keyPair = await keys.generateIdentityKeyPair();
  const keysObj: IdentityKeys = {
    identityPublicKey: keyPair.dhKey.publicKey,
    identityPrivateKey: keyPair.dhKey.privateKey,
    registrationId: keyPair.registrationId,
  };

  await secureStore.set(KEYS_STORAGE_KEY, JSON.stringify(keysObj));

  return keysObj;
}

export async function sendEncryptedMessage(
  recipientUserId: string,
  plaintext: string
): Promise<{ type: string; body: string }> {
  const client = getClient();
  const result = await client.send(recipientUserId, plaintext);
  return {
    type: 'ciphertext',
    body: result.clientMessageId,
  };
}

export async function decryptIncomingMessage(
  senderUserId: string,
  type: string,
  body: string
): Promise<string> {
  const client = getClient();
  const envelope: IncomingEnvelope = {
    id: body,
    senderUserId,
    senderDeviceId: 1,
    ciphertext: body,
    timestamp: Date.now(),
    messageType: type,
  };
  const outcome: ReceiveOutcome = await client.processIncomingEnvelope(envelope);

  if (outcome.kind === 'processed') {
    return outcome.plaintext;
  }

  throw new Error(`Failed to decrypt message: ${outcome.kind}`);
}

export async function getSafetyNumber(
  peerUserId: string
): Promise<string> {
  const client = getClient();
  const safetyNumber: SafetyNumber = await client.verify(peerUserId);
  return safetyNumber.numeric;
}

export async function confirmSafetyNumber(
  confirmation: unknown
): Promise<void> {
  const client = getClient();
  await client.confirmSafetyNumber(confirmation as any);
}
