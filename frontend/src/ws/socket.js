import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

let stompClient = null;
const subscriptions = {};

export const connectSocket = (onConnectCallback, onErrorCallback) => {
  const token = localStorage.getItem('quickcart_token');
  if (!token) return;

  stompClient = new Client({
    webSocketFactory: () => new SockJS(import.meta.env.VITE_WS_URL),
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    debug: (str) => {
      console.log('WS Debug:', str);
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  });

  stompClient.onConnect = (frame) => {
    console.log('Connected to WS:', frame);
    if (onConnectCallback) onConnectCallback(frame);
  };

  stompClient.onStompError = (frame) => {
    console.error('STOMP error:', frame);
    if (onErrorCallback) onErrorCallback(frame);
  };

  stompClient.onWebSocketClose = () => {
    console.log('WS connection closed');
  };

  stompClient.activate();
};

export const disconnectSocket = () => {
  if (stompClient) {
    // Unsubscribe all active subs
    Object.keys(subscriptions).forEach((topic) => {
      if (subscriptions[topic] && typeof subscriptions[topic].unsubscribe === 'function') {
        subscriptions[topic].unsubscribe();
      }
      delete subscriptions[topic];
    });
    stompClient.deactivate();
    stompClient = null;
    console.log('WS deactivated');
  }
};

export const subscribeToTopic = (topic, onMessageCallback) => {
  if (!stompClient || !stompClient.connected) {
    console.warn(`Cannot subscribe to ${topic}, socket not connected`);
    return null;
  }

  if (subscriptions[topic]) {
    console.log(`Already subscribed to ${topic}`);
    return subscriptions[topic];
  }

  const sub = stompClient.subscribe(topic, (message) => {
    try {
      const payload = JSON.parse(message.body);
      onMessageCallback(payload);
    } catch (e) {
      console.error('Failed to parse WS message body:', e);
      onMessageCallback(message.body);
    }
  });

  subscriptions[topic] = sub;
  return sub;
};

export const unsubscribeFromTopic = (topic) => {
  if (subscriptions[topic]) {
    if (typeof subscriptions[topic].unsubscribe === 'function') {
      subscriptions[topic].unsubscribe();
    }
    delete subscriptions[topic];
    console.log(`Unsubscribed from ${topic}`);
  }
};
