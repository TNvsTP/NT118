import { useChatWebSocket } from '@/hooks/use-chat-websocket';
import { type Conversation, type Message } from '@/models/message';
import { MessageService } from '@/services/message';
import { useCallback, useEffect, useState } from 'react';

export const useMessages = (conversationId: number) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null | undefined>(undefined);

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
      // Add new message at the end since we display oldest to newest
      return [...prev, newMessage];
    });
  }, []);

  // Initialize WebSocket for this conversation
  const { isConnected } = useChatWebSocket(
    conversationId ? conversationId.toString() : null,
    handleNewMessage
  );

  const fetchMessages = async (cursor?: string) => {
    try {
      if (!cursor) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const response = await MessageService.getMessages(conversationId, cursor);

      // Đảo ngược mảng để hiển thị từ cũ nhất -> mới nhất (bottom-up chat)
      // Lưu ý: response.messages.slice().reverse() để tránh mutate mảng gốc
      const reversedMessages = [...response.messages].reverse();

      if (!cursor) {
        // Load lần đầu
        setMessages(reversedMessages);
        setConversation(response.conversation);
      } else {
        // Load more (kéo lên trên): nối tin nhắn cũ vào đầu mảng hiện tại
        setMessages(prev => [...reversedMessages, ...prev]);
      }

      // FIX LOGIC HAS MORE
      // Nếu có next_cursor (khác null/undefined) nghĩa là còn dữ liệu
      setNextCursor(response.next_cursor);
      setHasMore(!!response.next_cursor);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreMessages = async () => {
    // FIX: check nextCursor phải tồn tại (dạng string) mới gọi
    if (!hasMore || loadingMore || !nextCursor) return;
    await fetchMessages(nextCursor);
  };

  const sendMessage = async (content: string) => {
    try {
      setSending(true);
      const newMessage = await MessageService.addMessage(conversationId, content);
      // Add new message at the end since we display oldest to newest
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
    loadingMore,
    error,
    sending,
    hasMore,
    sendMessage,
    loadMoreMessages,
    refetch: () => fetchMessages(),
    isWebSocketConnected: isConnected,
  };
};