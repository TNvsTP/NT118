import { useAuth } from '@/hooks/use-auth-context';
import { useChatWebSocket } from '@/hooks/use-chat-websocket';
import { type Conversation, type Message } from '@/models/message';
import { MessageService } from '@/services/message';
import { useCallback, useEffect, useState } from 'react';

export const useMessages = (conversationId: number) => {
  const { user } = useAuth();
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
      status: 'sent'
    };

    setMessages(prev => {
      // Kiểm tra xem có message nào với ID thật này chưa
      const existingIndex = prev.findIndex(msg => 
        // So sánh với ID thật (number)
        (typeof msg.id === 'number' && msg.id === newMessage.id)
      );
      
      if (existingIndex !== -1) {
        // Đã có message với ID này rồi, không thêm
        return prev;
      }
      
      // Kiểm tra xem có message optimistic nào cùng content và sender không
      const optimisticIndex = prev.findIndex(msg => 
        msg.status === 'sending' && 
        msg.content === newMessage.content &&
        msg.sender_id === newMessage.sender_id &&
        typeof msg.id === 'string' // temp ID
      );
      
      if (optimisticIndex !== -1) {
        // Thay thế message optimistic bằng message thật
        const updated = [...prev];
        updated[optimisticIndex] = { ...newMessage, status: 'sent' };
        return updated;
      }
      
      // Message mới từ người khác hoặc từ device khác
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
    if (!content.trim()) return false;
    
    // Tạo temporary ID và message optimistic
    const tempId = `temp_${Date.now()}_${Math.random()}`;
    const optimisticMessage: Message = {
      id: tempId,
      tempId,
      content: content.trim(),
      sender_id: user?.id || 0,
      conversation_id: conversationId,
      created_at: new Date(),
      sender: user || { id: 0, name: 'Bạn', email: '', avatarUrl: undefined, role: 'user' as const, disable_at: null, is_Violated: false },
      status: 'sending'
    };

    try {
      setSending(true);
      
      // Thêm message optimistic ngay lập tức
      setMessages(prev => [...prev, optimisticMessage]);
      
      // Gửi message thật
      const sentMessage = await MessageService.addMessage(conversationId, content.trim());
      
      // Cập nhật message optimistic thành message thật
      setMessages(prev => prev.map(msg => 
        msg.tempId === tempId 
          ? { ...sentMessage, status: 'sent' }
          : msg
      ));
      
      return true;
    } catch (err) {
      // Đánh dấu message failed
      setMessages(prev => prev.map(msg => 
        msg.tempId === tempId 
          ? { ...msg, status: 'failed' }
          : msg
      ));
      
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

  const retryMessage = async (tempId: string) => {
    const failedMessage = messages.find(msg => msg.tempId === tempId && msg.status === 'failed');
    if (!failedMessage) return false;

    // Đánh dấu đang retry
    setMessages(prev => prev.map(msg => 
      msg.tempId === tempId 
        ? { ...msg, status: 'sending' }
        : msg
    ));

    try {
      const sentMessage = await MessageService.addMessage(conversationId, failedMessage.content);
      
      // Cập nhật thành công
      setMessages(prev => prev.map(msg => 
        msg.tempId === tempId 
          ? { ...sentMessage, status: 'sent' }
          : msg
      ));
      
      return true;
    } catch (err) {
      // Đánh dấu failed lại
      setMessages(prev => prev.map(msg => 
        msg.tempId === tempId 
          ? { ...msg, status: 'failed' }
          : msg
      ));
      
      return false;
    }
  };

  return {
    messages,
    conversation,
    loading,
    loadingMore,
    error,
    sending,
    hasMore,
    sendMessage,
    retryMessage,
    loadMoreMessages,
    refetch: () => fetchMessages(),
    isWebSocketConnected: isConnected,
  };
};