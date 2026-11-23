import { createHostedSignalProtocolClient } from '@open-e2ee/signal-protocol-sdk';
import { expoStore } from '@open-e2ee/signal-protocol-sdk/local/store/expo';
import 'react-native-get-random-values';
import { secureStore, KEYS_STORAGE_KEY, IdentityKeys } from './secureStore';

export interface CryptoClient {
  sendEncryptedMessage(recipientUserId: string, plaintext: string): Promise<{
    type: string;
    body: string;
  }>;
  decryptIncomingMessage(
    senderUserId: string,
    type: string,
    body: string
  ): Promise<string>;
  registerIdentity(): Promise<IdentityKeys>;
  getSafetyNumber(peerUserId: string): Promise<string>;
}

let signalClient: ReturnType<typeof createHostedSignalProtocolClient> | null =
  null;

export async function getSignalClient(
  relayUrl: string,
  getIdentityAssertion: () => Promise<string>
): Promise<ReturnType<typeof createHostedSignalProtocolClient>> {
  if (signalClient) return signalClient;

  const storage = await expoStore();
  signalClient = createHostedSignalProtocolClient({
    hosted: { relayUrl, getIdentityAssertion },
    adapters: { storage },
  });

  signalClient.registerHook('onMessageDecrypted', (envelope) => {
    // Handled by the caller via decryptIncomingMessage
  });

  signalClient.startRelaySubscription();

  return signalClient;
}

export async function registerIdentity(
  relayUrl: string,
  getIdentityAssertion: () => Promise<string>
): Promise<IdentityKeys> {
  const client = await getSignalClient(relayUrl, getIdentityAssertion);

  const existing = await secureStore.get(KEYS_STORAGE_KEY);
  if (existing) {
    return JSON.parse(existing) as IdentityKeys;
  }

  const identityKey = await client.register();
  const keys: IdentityKeys = {
    identityPublicKey: identityKey.publicKey.toString('base64'),
    identityPrivateKey: identityKey.privateKey.toString('base64'),
    registrationId: identityKey.registrationId,
  };

  await secureStore.set(KEYS_STORAGE_KEY, JSON.stringify(keys));

  return keys;
}

export async function sendEncryptedMessage(
  client: ReturnType<typeof createHostedSignalProtocolClient>,
  recipientUserId: string,
  plaintext: string
) {
  return client.send(recipientUserId, plaintext);
}

export async function decryptIncomingMessage(
  client: ReturnType<typeof createHostedSignalProtocolClient>,
  senderUserId: string,
  type: string,
  body: string
): Promise<string> {
  return client.decrypt(senderUserId, type, body);
}

export async function getSafetyNumber(
  client: ReturnType<typeof createHostedSignalProtocolClient>,
  peerUserId: string
): Promise<string> {
  return client.getSafetyNumber(peerUserId);
}
