import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const getWsUrl = (): string => {
  const envUrl = import.meta.env.VITE_WS_URL;
  if (!envUrl) return 'http://localhost:8081/ws';
  if (envUrl.startsWith('http://') || envUrl.startsWith('https://')) return envUrl;
  if (envUrl.startsWith('ws://')) return envUrl.replace('ws://', 'http://');
  if (envUrl.startsWith('wss://')) return envUrl.replace('wss://', 'https://');
  return `${window.location.origin}${envUrl.startsWith('/') ? '' : '/'}${envUrl}`;
};

export class WsClient {
  private client: Client | null = null;
  private isConnected = false;

  public connect(onConnect: () => void, onError: (err: any) => void) {
    const token = localStorage.getItem('token');
    const wsUrl = getWsUrl();

    this.client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      debug: (str) => {
        if (import.meta.env.DEV) {
          console.debug('[STOMP]', str);
        }
      },
      reconnectDelay: 3000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = () => {
      this.isConnected = true;
      onConnect();
    };

    this.client.onStompError = (frame) => {
      this.isConnected = false;
      onError(frame.headers['message']);
    };

    this.client.onWebSocketClose = () => {
      this.isConnected = false;
    };

    this.client.activate();
  }

  public subscribe(destination: string, callback: (message: any) => void) {
    if (!this.client || !this.isConnected) return null;
    return this.client.subscribe(destination, (msg) => {
      try {
        const payload = JSON.parse(msg.body);
        callback(payload);
      } catch (e) {
        callback(msg.body);
      }
    });
  }

  public publish(destination: string, body: any) {
    if (!this.client || !this.isConnected) return;
    const token = localStorage.getItem('token');
    this.client.publish({
      destination,
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(body),
    });
  }

  public disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.isConnected = false;
    }
  }
}

export const wsClientService = new WsClient();
