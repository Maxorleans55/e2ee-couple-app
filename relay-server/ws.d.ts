declare module 'ws' {
  import { EventEmitter } from 'node:events';
  import { http } from 'node:http';

  export class WebSocket extends EventEmitter {
    static readonly OPEN: number;
    static readonly CLOSED: number;
    readyState: number;
    send(data: string): void;
    close(): void;
    on(event: string, listener: (...args: any[]) => void): this;
    addEventListener(event: string, listener: (...args: any[]) => void): void;
  }

  export class WebSocketServer extends EventEmitter {
    constructor(options: { port: number }): void;
    on(event: string, listener: (...args: any[]) => void): this;
  }
}
