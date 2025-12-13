import { LoadingSpinner } from '@/components/loading-spinner';
import { WebSocketStatus } from '@/components/websocket-status';
import { useAuth } from '@/hooks/use-auth-context';
import { useMessages } from '@/hooks/use-messages';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const conversationId = parseInt(id as string);
  const { user } = useAuth();
  const { messages, conversation, loading, loadingMore, error, sending, hasMore, sendMessage, loadMoreMessages } = useMessages(conversationId);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const [isLoadingMoreTriggered, setIsLoadingMoreTriggered] = useState(false);
  const [previousMessageCount, setPreviousMessageCount] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [previousContentHeight, setPreviousContentHeight] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isLoadingMoreMessages, setIsLoadingMoreMessages] = useState(false);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getConversationName = () => {
    if (!conversation) return `Cuộc trò chuyện ${id}`;
    if (conversation.name) return conversation.name;
    
    const otherParticipants = conversation.participants.filter(p => p.user_id !== user?.id);
    if (otherParticipants.length > 0) {
      return otherParticipants.map(p => p.user.name).join(', ');
    }
    
    return 'Cuộc trò chuyện';
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || sending) return;
    
    const success = await sendMessage(inputText.trim());
    if (success) {
      setInputText('');
      // Scroll to bottom after sending (since newest messages are at bottom)
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } else {
      Alert.alert('Lỗi', 'Không thể gửi tin nhắn. Vui lòng thử lại.');
    }
  };

  const handleLoadMore = async () => {
    if (!hasMore || loadingMore || isLoadingMoreMessages) return;
    
    // Đánh dấu đang load more và lưu trạng thái hiện tại
    setIsLoadingMoreMessages(true);
    setPreviousMessageCount(messages.length);
    setPreviousContentHeight(contentHeight);
    
    await loadMoreMessages();
    
    // Reset flag sau khi load xong
    setTimeout(() => {
      setIsLoadingMoreMessages(false);
    }, 500);
  };

  useEffect(() => {
    if (messages.length === 0) return;

    // Nếu là lần load đầu tiên, scroll xuống cuối
    if (isInitialLoad && !loading) {
      setIsInitialLoad(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 100);
      return;
    }
    
    // Nếu có tin nhắn mới thật sự (không phải load more), scroll xuống cuối
    if (messages.length > previousMessageCount && !isLoadingMoreMessages && !loadingMore) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }

    // Cập nhật previousMessageCount cho lần kiểm tra tiếp theo
    if (!isLoadingMoreMessages) {
      setPreviousMessageCount(messages.length);
    }
  }, [messages.length, loadingMore, loading]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đang tải...</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lỗi</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getConversationName().charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>{getConversationName()}</Text>
            <WebSocketStatus />
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onScroll={(event) => {
          const { contentOffset, contentSize } = event.nativeEvent;
          
          // Lưu vị trí scroll hiện tại
          setScrollPosition(contentOffset.y);
          setContentHeight(contentSize.height);
          
          // Check if scrolled to top and can load more
          if (contentOffset.y <= 50 && hasMore && !loadingMore && !isLoadingMoreTriggered && !isLoadingMoreMessages) {
            setIsLoadingMoreTriggered(true);
            handleLoadMore().finally(() => {
              setTimeout(() => setIsLoadingMoreTriggered(false), 1000);
            });
          }
        }}
        scrollEventThrottle={400}
        onContentSizeChange={(width, height) => {
          // Nếu đang load more và content height thay đổi, cập nhật scroll position
          if (isLoadingMoreMessages && height > previousContentHeight) {
            const heightDifference = height - previousContentHeight;
            const newScrollPosition = scrollPosition + heightDifference;
            
            setTimeout(() => {
              scrollViewRef.current?.scrollTo({ 
                y: Math.max(0, newScrollPosition), 
                animated: false 
              });
            }, 50);
          }
          
          setContentHeight(height);
        }}
      >
        {loadingMore && (
          <View style={styles.loadMoreContainer}>
            <LoadingSpinner />
            <Text style={styles.loadMoreText}>Đang tải thêm tin nhắn...</Text>
          </View>
        )}
        {messages.map((message) => {
          const isMine = message.sender_id === user?.id;
          return (
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                isMine ? styles.myMessage : styles.theirMessage,
              ]}
            >
              {!isMine && (
                <Text style={styles.senderName}>{message.sender.name}</Text>
              )}
              <View
                style={[
                  styles.messageBubble,
                  isMine ? styles.myBubble : styles.theirBubble,
                ]}
              >
                <Text style={isMine ? styles.myText : styles.theirText}>
                  {message.content}
                </Text>
              </View>
              <Text style={styles.messageTime}>
                {formatTime(message.created_at)}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nhập tin nhắn..."
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity 
          style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!inputText.trim() || sending}
        >
          <Text style={styles.sendButtonText}>
            {sending ? '...' : 'Gửi'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingTop: 50,
  },
  backButton: {
    fontSize: 24,
    color: '#007AFF',
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  connectionStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    textAlign: 'center',
  },
  messagesList: {
    flex: 1,
    padding: 15,
  },
  messageContainer: {
    marginBottom: 15,
  },
  myMessage: {
    alignItems: 'flex-end',
  },
  theirMessage: {
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    marginLeft: 8,
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 12,
    borderRadius: 18,
    marginBottom: 4,
  },
  myBubble: {
    backgroundColor: '#007AFF',
  },
  theirBubble: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  myText: {
    color: '#fff',
    fontSize: 15,
  },
  theirText: {
    color: '#000',
    fontSize: 15,
  },
  messageTime: {
    fontSize: 12,
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 10,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 20,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  loadMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    gap: 8,
  },
  loadMoreText: {
    fontSize: 14,
    color: '#666',
  },
});
