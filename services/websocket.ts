import * as SecureStore from 'expo-secure-store';
import Pusher from 'pusher-js';

class WebSocketService {
  private pusher: Pusher | null = null;
  private channels: Map<string, any> = new Map();

  constructor() {
    // Không khởi tạo trong constructor để tránh lỗi async
    // và để kiểm soát luồng data tốt hơn.
  }

  /**
   * Khởi tạo kết nối Pusher
   * Gọi hàm này sau khi Login thành công hoặc khi App mở lên (nếu đã có token)
   */
  async init() {
    // 1. Nếu đã có kết nối, ngắt kết nối cũ trước để tránh duplicate
    if (this.pusher) {
      this.disconnect();
    }

    // 2. Lấy token
    const token = await SecureStore.getItemAsync('access_token');

    if (!token) {
      console.warn('⚠️ No access token found. Cannot connect to WebSocket.');
      return;
    }

    try {
      // 3. Khởi tạo Pusher instance mới
      this.pusher = new Pusher(process.env.EXPO_PUBLIC_PUSHER_APP_KEY!, {
        cluster: process.env.EXPO_PUBLIC_PUSHER_APP_CLUSTER!,
        forceTLS: true,
        channelAuthorization: {
          endpoint: 'https://social-media-0nzo.onrender.com/api/broadcasting/auth',
          transport: 'ajax',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });

      // 4. Bind các sự kiện connection
      this.pusher.connection.bind('connected', () => {
        console.log('✅ WebSocket connected successfully');
      });

      this.pusher.connection.bind('disconnected', () => {
        console.log('❌ WebSocket disconnected');
      });

      this.pusher.connection.bind('error', (err: any) => {
        console.error('🚨 WebSocket connection error:', err);
      });

    } catch (error) {
      console.error('Failed to initialize Pusher:', error);
    }
  }

  subscribeToChannel(channelName: string) {
    if (!this.pusher) {
      console.warn('Pusher not initialized. Call init() first.');
      return null;
    }

    if (this.channels.has(channelName)) {
      return this.channels.get(channelName);
    }

    const channel = this.pusher.subscribe(channelName);
    this.channels.set(channelName, channel);
    
    // Log debug
    channel.bind('pusher:subscription_succeeded', () => {
        console.log(`📡 Subscribed to: ${channelName}`);
    });

    return channel;
  }

  unsubscribeFromChannel(channelName: string) {
    if (!this.pusher) return;

    if (this.channels.has(channelName)) {
      this.pusher.unsubscribe(channelName);
      this.channels.delete(channelName);
      console.log(`🔕 Unsubscribed from: ${channelName}`);
    }
  }

  listenToEvent(channelName: string, eventName: string, callback: (data: any) => void) {
    const channel = this.subscribeToChannel(channelName);
    if (channel) {
      channel.bind(eventName, callback);
      console.log(`👂 Listening: ${eventName} on ${channelName}`);
    }
  }

  stopListeningToEvent(channelName: string, eventName: string, callback?: (data: any) => void) {
    const channel = this.channels.get(channelName);
    if (channel) {
      if (callback) {
        channel.unbind(eventName, callback);
      } else {
        channel.unbind(eventName);
      }
      console.log(`🔇 Stopped listening: ${eventName} on ${channelName}`);
    }
  }

  disconnect() {
    if (this.pusher) {
      // Unsubscribe tất cả kênh trước khi disconnect
      this.channels.forEach((_, key) => {
        this.unsubscribeFromChannel(key);
      });
      this.channels.clear();
      
      this.pusher.disconnect();
      this.pusher = null;
      console.log('🛑 WebSocket Disconnected Manually');
    }
  }

  getConnectionState() {
    return this.pusher?.connection.state || 'disconnected';
  }
}

export const webSocketService = new WebSocketService();