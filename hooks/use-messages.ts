import { useChatWebSocket } from '@/hooks/use-chat-websocket';
import { type Conversation, type Message } from '@/models/message';
import { MessageService } from '@/services/message';
import { useCallback, useEffect, useState } from 'react';

export const useMessages = (conversationId: number) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // Handle new messages from WebSocket
  const handleNewMessage = useCallback((messageData: any) => {
    const newMessage: Message = {
      id: messageData.id,
      content: messageData.content,
      sender_id: messageData.senderId || messageData.sender_id,
      conversation_id: messageData.conversationId || messageData.conversation_id,
      created_at: new Date(messageData.createdAt || messageData.created_at),
      sender: messageData.sender,
    };
    
    setMessages(prev => {
      // Check if message already exists to avoid duplicates
      const exists = prev.some(msg => msg.id === newMessage.id);
      if (exists) return prev;
      return [...prev, newMessage];
    });
  }, []);

  // Initialize WebSocket for this conversation
  const { isConnected } = useChatWebSocket(
    conversationId ? conversationId.toString() : null,
    handleNewMessage
  );

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await MessageService.getMessages(conversationId);
      setMessages(response.messages);
      setConversation(response.conversation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    try {
      setSending(true);
      const newMessage = await MessageService.addMessage(conversationId, content);
      setMessages(prev => [...prev, newMessage]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể gửi tin nhắn');
      return false;
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId]);

  return {
    messages,
    conversation,
    loading,
    error,
    sending,
    sendMessage,
    refetch: fetchMessages,
    isWebSocketConnected: isConnected,
  };
};