import { Platform } from 'react-native';

export const RELAY_URL =
  Platform.OS === 'android' ? 'ws://10.0.2.2:8787' : 'ws://localhost:8787';

export interface RelayMessage {
  type: 'identity_announcement' | 'message' | 'ack' | 'error';
  from: string;
  to: string;
  payload: string;
  timestamp: number;
  signature?: string;
}

export class RelayClient {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private onMessageHandler: ((msg: RelayMessage) => void) | null = null;
  private onConnectHandler: (() => void) | null = null;
  private onDisconnectHandler: (() => void) | null = null;
  private connectPromise: Promise<void> | null = null;
  private resolveConnect: (() => void) | null = null;
  private rejectConnect: ((err: Error) => void) | null = null;

  connect(identityToken: string): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.resolveConnect = resolve;
      this.rejectConnect = reject;

      try {
        this.ws = new WebSocket(RELAY_URL);

        this.ws.onopen = () => {
          this.ws?.send(
            JSON.stringify({
              type: 'identity_announcement',
              from: 'device',
              to: 'relay',
              payload: identityToken,
              timestamp: Date.now(),
            })
          );
          if (this.resolveConnect) this.resolveConnect();
          if (this.onConnectHandler) this.onConnectHandler();
        };

        this.ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data) as RelayMessage;
            if (this.onMessageHandler) this.onMessageHandler(msg);
          } catch {
            // ignore malformed frames
          }
        };

        this.ws.onerror = (err) => {
          if (this.rejectConnect) this.rejectConnect(err as Error);
        };

        this.ws.onclose = () => {
          this.ws = null;
          if (this.onDisconnectHandler) this.onDisconnectHandler();
          this.scheduleReconnect(identityToken);
        };
      } catch (err) {
        reject(err as Error);
      }
    });
  }

  private scheduleReconnect(identityToken: string) {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.connect(identityToken);
    }, 3000);
  }

  send(message: Omit<RelayMessage, 'timestamp'> & { timestamp?: number }) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('Relay not connected');
    }
    this.ws.send(
      JSON.stringify({
        ...message,
        timestamp: message.timestamp ?? Date.now(),
      })
    );
  }

  onMessage(handler: (msg: RelayMessage) => void) {
    this.onMessageHandler = handler;
  }

  onConnect(handler: () => void) {
    this.onConnectHandler = handler;
  }

  onDisconnect(handler: () => void) {
    this.onDisconnectHandler = handler;
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
  }
}
