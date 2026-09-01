import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';

export class WsClient {
  private client: Client | null = null;
  private isConnected = false;

  public connect(onConnect: () => void, onError: (err: any) => void) {
    const token = localStorage.getItem('token');

    this.client = new Client({
      webSocketFactory: () => new SockJS(WS_BASE_URL),
      connectHeaders: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      debug: () => {},
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
    this.client.publish({
      destination,
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
