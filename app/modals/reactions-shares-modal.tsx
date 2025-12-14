import { type Reaction } from '@/models/reaction';
import { type Share } from '@/models/share';
import { PostService } from '@/services/post';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface ReactionsSharesModalProps {
  visible: boolean;
  onClose: () => void;
  postId: number;
  initialTab: 'reactions' | 'shares';
}

export const ReactionsSharesModal: React.FC<ReactionsSharesModalProps> = ({
  visible,
  onClose,
  postId,
  initialTab
}) => {
  const [activeTab, setActiveTab] = useState<'reactions' | 'shares'>(initialTab);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [shares, setShares] = useState<Share[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setActiveTab(initialTab);
      loadData();
    }
  }, [visible, initialTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reactionsRes, sharesRes] = await Promise.all([
        PostService.getReactions(postId),
        PostService.getShares(postId)
      ]);
      
      setReactions(reactionsRes);
      setShares(sharesRes);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleUserPress = (userId: number) => {
    onClose();
    router.push(`/profile/${userId}` as any);
  };

  const renderUserItem = ({ item }: { item: Reaction | Share }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => handleUserPress(item.user.id)}
    >
      {item.user.avatarUrl ? (
        <Image
          source={{ uri: item.user.avatarUrl }}
          style={styles.userAvatar}
        />
      ) : (
        <View style={[styles.userAvatar, styles.defaultAvatar]} />
      )}
      <Text style={styles.userName}>{item.user.name}</Text>
    </TouchableOpacity>
  );

  const currentData = activeTab === 'reactions' ? reactions : shares;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Đóng</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {activeTab === 'reactions' ? 'Lượt thích' : 'Lượt chia sẻ'}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'reactions' && styles.activeTab]}
            onPress={() => setActiveTab('reactions')}
          >
            <Text style={[styles.tabText, activeTab === 'reactions' && styles.activeTabText]}>
              Thích ({reactions.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'shares' && styles.activeTab]}
            onPress={() => setActiveTab('shares')}
          >
            <Text style={[styles.tabText, activeTab === 'shares' && styles.activeTabText]}>
              Chia sẻ ({shares.length})
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : (
          <FlatList
            data={currentData}
            renderItem={renderUserItem}
            keyExtractor={(item) => `${activeTab}-${item.id}`}
            style={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {activeTab === 'reactions' 
                    ? 'Chưa có ai thích bài viết này' 
                    : 'Chưa có ai chia sẻ bài viết này'
                  }
                </Text>
              </View>
            }
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    color: '#007AFF',
    fontSize: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 50,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  defaultAvatar: {
    backgroundColor: '#ddd',
  },
  userName: {
    fontSize: 16,
    color: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});