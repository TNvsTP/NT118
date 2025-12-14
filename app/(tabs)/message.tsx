import { LoadingSpinner } from '@/components/loading-spinner';
import { useAuth } from '@/hooks/use-auth-context';
import { useConversations } from '@/hooks/use-conversations';
import { type Conversation } from '@/models/message';
import { router } from 'expo-router';
import { FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ConversationItem = ({ conversation, currentUserId }: { conversation: Conversation; currentUserId?: number }) => {
  const formatTime = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return messageDate.toLocaleDateString('vi-VN');
    }
  };

  const getConversationDisplay = () => {
    // Nếu conversation có avatar_url và name thì hiển thị
    if (conversation.avatar_url && conversation.name) {
      return {
        name: conversation.name,
        avatarUrl: conversation.avatar_url,
        fallbackText: conversation.name.charAt(0).toUpperCase()
      };
    }
    
    // Nếu không, lấy thông tin từ participant (đối phương)
    const otherParticipants = conversation.participants.filter(p => p.user_id !== currentUserId);
    if (otherParticipants.length > 0) {
      const participant = otherParticipants[0]; // Lấy participant đầu tiên
      return {
        name: otherParticipants.map(p => p.user.name).join(', '),
        avatarUrl: participant.user.avatarUrl,
        fallbackText: participant.user.name.charAt(0).toUpperCase()
      };
    }
    
    return {
      name: 'Cuộc trò chuyện',
      avatarUrl: null,
      fallbackText: 'C'
    };
  };

  const displayInfo = getConversationDisplay();

  return (
    <TouchableOpacity 
      style={styles.chatItem}
      onPress={() => router.push(`/chat/${conversation.id}`)}
    >
      <View style={styles.avatar}>
        {displayInfo.avatarUrl ? (
          <Image 
            source={{ uri: displayInfo.avatarUrl }} 
            style={styles.avatarImage}
            defaultSource={{ uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' }}
          />
        ) : (
          <Text style={styles.avatarText}>
            {displayInfo.fallbackText}
          </Text>
        )}
      </View>
      
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName} numberOfLines={1}>
            {displayInfo.name}
          </Text>
          <Text style={styles.chatTime}>
            {formatTime(conversation.last_message_at)}
          </Text>
        </View>
        
        <Text style={styles.lastMessage} numberOfLines={2}>
          {conversation.last_message?.content || 'Chưa có tin nhắn'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default function MessageScreen() {
  const { conversations, loading, error, refetch } = useConversations();
  const { user } = useAuth();

  if (loading && conversations.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tin nhắn</Text>
        </View>
        <View style={styles.centerContainer}>
          <LoadingSpinner />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tin nhắn</Text>
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tin nhắn</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/modals/new-conversation')}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ConversationItem conversation={item} currentUserId={user?.id} />}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có cuộc trò chuyện nào</Text>
            <TouchableOpacity 
              style={styles.createFirstButton}
              onPress={() => router.push('/modals/new-conversation')}
            >
              <Text style={styles.createFirstButtonText}>Tạo cuộc trò chuyện đầu tiên</Text>
            </TouchableOpacity>
          </View>
        }
        style={styles.chatList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  chatList: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatItem: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  chatTime: {
    fontSize: 12,
    color: '#666',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  createFirstButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
