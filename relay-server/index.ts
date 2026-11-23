import { createServer } from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';
import { readFileSync } from 'node:fs';

const ALLOWLIST_PATH = new URL('./allowlist.json', import.meta.url).pathname;

type AllowList = {
  allowedIdentityKeys: Array<{
    publicKey: string;
    name: string;
    deviceId: string;
    addedAt: string;
  }>;
};

let allowlist: AllowList;

function loadAllowlist() {
  try {
    const raw = readFileSync(ALLOWLIST_PATH, 'utf-8');
    allowlist = JSON.parse(raw);
  } catch {
    allowlist = { allowedIdentityKeys: [] };
  }
}

loadAllowlist();

const ALLOWED_KEYS = new Set(
  allowlist.allowedIdentityKeys.map((e) => e.publicKey)
);

const clients = new Map<WebSocket, { publicKey: string; name: string }>();

function broadcast(
  sender: WebSocket,
  message: string,
  excludeSender = false
) {
  const payload = JSON.stringify({
    ...JSON.parse(message),
    relayTimestamp: Date.now(),
  });
  for (const [client] of clients) {
    if (excludeSender && client === sender) continue;
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

const wss = new WebSocketServer({ port: 8787 });

wss.on('connection', (ws, request) => {
  const ip = request.socket.remoteAddress;
  console.log(`[relay] connection from ${ip}`);

  let authenticated = false;

  ws.on('message', (raw) => {
    let parsed: any;
    try {
      parsed = JSON.parse(raw.toString());
    } catch {
      ws.send(JSON.stringify({ type: 'error', code: 'malformed_json' }));
      ws.close();
      return;
    }

    if (!authenticated) {
      if (parsed.type !== 'identity_announcement') {
        ws.send(
          JSON.stringify({
            type: 'error',
            code: 'authentication_required',
          })
        );
        ws.close();
        return;
      }

      const publicKey = parsed.payload;
      if (!publicKey || typeof publicKey !== 'string') {
        ws.send(
          JSON.stringify({ type: 'error', code: 'invalid_identity' })
        );
        ws.close();
        return;
      }

      if (!ALLOWED_KEYS.has(publicKey)) {
        console.log(`[relay] rejected unknown identity key from ${ip}`);
        ws.send(
          JSON.stringify({
            type: 'error',
            code: 'identity_not_allowed',
          })
        );
        ws.close();
        return;
      }

      const entry = allowlist.allowedIdentityKeys.find(
        (e) => e.publicKey === publicKey
      );
      authenticated = true;
      clients.set(ws, { publicKey, name: entry?.name ?? 'unknown' });

      console.log(
        `[relay] authenticated ${entry?.name ?? 'unknown'} (${publicKey.slice(0, 12)}...)`
      );

      ws.send(
        JSON.stringify({
          type: 'auth_ok',
          name: entry?.name ?? 'unknown',
          allowedPeers: allowlist.allowedIdentityKeys.filter(
            (e) => e.publicKey !== publicKey
          ),
        })
      );
      return;
    }

    const sender = clients.get(ws);
    if (!sender) {
      ws.close();
      return;
    }

    const { type, to, payload, from } = parsed;

    if (type === 'message') {
      const recipientEntry = allowlist.allowedIdentityKeys.find(
        (e) => e.publicKey === to
      );
      if (!recipientEntry) {
        ws.send(
          JSON.stringify({
            type: 'error',
            code: 'recipient_not_allowed',
          })
        );
        return;
      }

      const forwardMsg = JSON.stringify({
        type: 'message',
        from: sender.publicKey,
        to,
        payload,
        timestamp: Date.now(),
      });

      for (const [client, info] of clients) {
        if (info.publicKey === to && client.readyState === WebSocket.OPEN) {
          client.send(forwardMsg);
        }
      }
    }

    if (type === 'ack') {
      const ackMsg = JSON.stringify({
        type: 'ack',
        from: sender.publicKey,
        to,
        timestamp: Date.now(),
      });
      for (const [client, info] of clients) {
        if (info.publicKey === to && client.readyState === WebSocket.OPEN) {
          client.send(ackMsg);
        }
      }
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`[relay] client disconnected`);
  });

  ws.on('error', (err) => {
    console.error(`[relay] ws error: ${err.message}`);
    clients.delete(ws);
  });
});

console.log('[relay] listening on ws://0.0.0.0:8787');
console.log(`[relay] allowlist: ${ALLOWED_KEYS.size} key(s) loaded`);
