import { webSocketService } from '@/services/websocket';
import { useCallback, useEffect, useRef } from 'react';

export const useWebSocket = () => {
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      console.log('WebSocket service initialized');
    }

    if (webSocketService.getConnectionState() === 'disconnected') {
        // Có thể gọi lại hàm connect nếu service hỗ trợ, 
        // hoặc logic constructor đã tự chạy khi import.
        // Với code hiện tại của bạn, constructor chạy 1 lần duy nhất khi import.
    }
  }, []);

  const subscribeToChannel = useCallback((channelName: string) => {
    return webSocketService.subscribeToChannel(channelName);
  }, []);

  const unsubscribeFromChannel = useCallback((channelName: string) => {
    webSocketService.unsubscribeFromChannel(channelName);
  }, []);

  const listenToEvent = useCallback((
    channelName: string, 
    eventName: string, 
    callback: (data: any) => void
  ) => {
    webSocketService.listenToEvent(channelName, eventName, callback);
  }, []);

  const stopListeningToEvent = useCallback((
    channelName: string, 
    eventName: string, 
    callback?: (data: any) => void
  ) => {
    webSocketService.stopListeningToEvent(channelName, eventName, callback);
  }, []);

  const getConnectionState = useCallback(() => {
    return webSocketService.getConnectionState();
  }, []);

  return {
    subscribeToChannel,
    unsubscribeFromChannel,
    listenToEvent,
    stopListeningToEvent,
    getConnectionState,
  };
};