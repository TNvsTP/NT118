import { useAuth } from '@/hooks/use-auth-context';
import { type User } from '@/models/user';
import { FriendService } from '@/services/friendship';
import { MessageService } from '@/services/message';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface SelectedUser extends User {
  selected: boolean;
}

export default function NewConversationModal() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<SelectedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [conversationName, setConversationName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    
    if (!user) return;
    
    try {
      setLoading(true);
      const friendsData = await FriendService.getFriends(user.id);
      setFriends(friendsData.map(friend => ({ ...friend, selected: false })));
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách bạn bè');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (userId: number) => {
    setFriends(prev => 
      prev.map(friend => 
        friend.id === userId 
          ? { ...friend, selected: !friend.selected }
          : friend
      )
    );
    
    setSelectedUsers(prev => {
      const user = friends.find(f => f.id === userId);
      if (!user) return prev;
      
      const isSelected = prev.some(u => u.id === userId);
      if (isSelected) {
        return prev.filter(u => u.id !== userId);
      } else {
        return [...prev, user];
      }
    });
  };

  const createConversation = async () => {
    if (selectedUsers.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn ít nhất một thành viên');
      return;
    }
    
    if (!conversationName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên cuộc trò chuyện');
      return;
    }

    try {
      setCreating(true);
      const userIds = selectedUsers.map(u => u.id);
      const response = await MessageService.addConversation(conversationName.trim(), userIds);
      
      Alert.alert('Thành công', 'Tạo cuộc trò chuyện thành công', [
        {
          text: 'OK',
          onPress: () => {
            router.back();
            // Có thể navigate đến cuộc trò chuyện mới tạo
            if (response.id) {
              router.push(`/chat/${response.id}`);
            }
          }
        }
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tạo cuộc trò chuyện');
    } finally {
      setCreating(false);
    }
  };

  const renderFriendItem = ({ item }: { item: SelectedUser }) => (
    <TouchableOpacity
      style={[
        styles.friendItem,
        item.selected && styles.friendItemSelected
      ]}
      onPress={() => toggleUserSelection(item.id)}
    >
      <View style={styles.friendAvatar}>
        <Text style={styles.friendAvatarText}>
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <Text style={styles.friendName}>{item.name}</Text>
      {item.selected && (
        <View style={styles.checkmark}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.cancelButton}>Hủy</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cuộc trò chuyện mới</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelButton}>Hủy</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cuộc trò chuyện mới</Text>
        <TouchableOpacity 
          onPress={createConversation}
          disabled={creating || selectedUsers.length === 0 || !conversationName.trim()}
        >
          <Text style={[
            styles.createButton,
            (creating || selectedUsers.length === 0 || !conversationName.trim()) && styles.createButtonDisabled
          ]}>
            {creating ? 'Đang tạo...' : 'Tạo'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.nameInput}
          placeholder="Nhập tên cuộc trò chuyện"
          value={conversationName}
          onChangeText={setConversationName}
          maxLength={50}
        />
      </View>

      {selectedUsers.length > 0 && (
        <View style={styles.selectedContainer}>
          <Text style={styles.selectedTitle}>
            Đã chọn ({selectedUsers.length}):
          </Text>
          <Text style={styles.selectedNames}>
            {selectedUsers.map(u => u.name).join(', ')}
          </Text>
        </View>
      )}

      <FlatList
        data={friends}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderFriendItem}
        style={styles.friendsList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không có bạn bè nào</Text>
          </View>
        }
      />
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
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  createButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  createButtonDisabled: {
    color: '#ccc',
  },
  placeholder: {
    width: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  nameInput: {
    fontSize: 16,
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  selectedNames: {
    fontSize: 14,
    color: '#007AFF',
  },
  friendsList: {
    flex: 1,
    backgroundColor: '#fff',
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  friendItemSelected: {
    backgroundColor: '#f0f8ff',
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  friendAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  friendName: {
    flex: 1,
    fontSize: 16,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});