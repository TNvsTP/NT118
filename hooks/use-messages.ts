import { type Conversation, type Message } from '@/models/message';
import { MessageService } from '@/services/message';
import { useEffect, useState } from 'react';

export const useMessages = (conversationId: number) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

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
  };
};