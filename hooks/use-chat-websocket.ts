import { Message } from '@/models/message';
import { useCallback, useEffect, useRef } from 'react';
import { useWebSocket } from './use-websocket';


export const useChatWebSocket = (
  conversationId: string | null,
  onNewMessage?: (message: Message) => void
) => {
  const { subscribeToChannel, unsubscribeFromChannel, listenToEvent, stopListeningToEvent } = useWebSocket();
  const currentChannelRef = useRef<string | null>(null);
  const callbackRef = useRef(onNewMessage);

  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = onNewMessage;
  }, [onNewMessage]);

  const handleNewMessage = useCallback((data: Message) => {

    if (callbackRef.current) {
      callbackRef.current(data);
    }
  }, []);

  useEffect(() => {
    if (!conversationId) {
      // Unsubscribe from current channel if no conversationId
      if (currentChannelRef.current) {
        stopListeningToEvent(currentChannelRef.current, '.MessageSent', handleNewMessage);
        unsubscribeFromChannel(currentChannelRef.current);
        currentChannelRef.current = null;
      }
      return;
    }

    const channelName = `private-chat.${conversationId}`;

    // Unsubscribe from previous channel if different
    if (currentChannelRef.current && currentChannelRef.current !== channelName) {
      stopListeningToEvent(currentChannelRef.current, 'MessageSent', handleNewMessage);
      unsubscribeFromChannel(currentChannelRef.current);
    }

    // Subscribe to new channel
    if (currentChannelRef.current !== channelName) {
      subscribeToChannel(channelName);
      listenToEvent(channelName, 'MessageSent', handleNewMessage);
      currentChannelRef.current = channelName;
      console.log(`Subscribed to chat channel: ${channelName}`);
    }

    return () => {
      if (currentChannelRef.current) {
        stopListeningToEvent(currentChannelRef.current, 'MessageSent', handleNewMessage);
        unsubscribeFromChannel(currentChannelRef.current);
        currentChannelRef.current = null;
      }
    };
  }, [conversationId, subscribeToChannel, unsubscribeFromChannel, listenToEvent, stopListeningToEvent, handleNewMessage]);

  return {
    isConnected: currentChannelRef.current !== null,
    channelName: currentChannelRef.current,
  };
};