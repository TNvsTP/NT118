import { LoadingSpinner } from '@/components/loading-spinner';
import { PostCard } from '@/components/post-card';
import { useAuth } from '@/hooks/use-auth-context';
import { Friendship } from '@/models/friendship';
import { PostItem } from '@/models/post';
import { UserService } from '@/services/user';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type TabType = 'posts' | 'friends' | 'requests';

export default function ProfileScreen() {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadInitialData();
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      if (activeTab === 'posts' && posts.length === 0) {
        loadPosts();
      } else if (activeTab === 'friends' && friends.length === 0) {
        loadFriends();
      } else if (activeTab === 'requests' && friends.length === 0) {
        loadFriends();
      }
    }
  }, [activeTab, currentUser]);

  const loadInitialData = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      await loadPosts();
    } catch (error) {
      console.error('Error loading initial data:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu profile');
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    if (!currentUser) return;
    
    try {
      setPostsLoading(true);
      const postsData = await UserService.getProfilePosts(currentUser.id);
      setPosts(postsData);
    } catch (error) {
      console.error('Error loading posts:', error);
      Alert.alert('Lỗi', 'Không thể tải bài viết');
    } finally {
      setPostsLoading(false);
    }
  };

  const loadFriends = async () => {
    if (!currentUser) return;
    
    try {
      setFriendsLoading(true);
      setRequestsLoading(true);
      const friendsData = await UserService.getFriends(currentUser.id);
      setFriends(friendsData);
    } catch (error) {
      console.error('Error loading friends:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách bạn bè');
    } finally {
      setFriendsLoading(false);
      setRequestsLoading(false);
    }
  };

  const handleAcceptFriend = async (friendshipId: number) => {
    try {
      await UserService.acceptFriend(friendshipId);
      Alert.alert('Thành công', 'Đã chấp nhận lời mời kết bạn');
      await loadFriends();
    } catch (error) {
      console.error('Error accepting friend:', error);
      Alert.alert('Lỗi', 'Không thể chấp nhận lời mời kết bạn');
    }
  };

  const handleRejectFriend = async (friendshipId: number) => {
    try {
      await UserService.deleteFriend(friendshipId);
      Alert.alert('Thành công', 'Đã từ chối lời mời kết bạn');
      await loadFriends();
    } catch (error) {
      console.error('Error rejecting friend:', error);
      Alert.alert('Lỗi', 'Không thể từ chối lời mời kết bạn');
    }
  };

  const handleUpdateProfile = async (name: string, gender: string) => {
    try {
      await UserService.updateProfile(name, gender);
      Alert.alert('Thành công', 'Đã cập nhật thông tin cá nhân');
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật thông tin cá nhân');
    }
  };

  const renderTabContent = () => {
    if (activeTab === 'posts') {
      if (postsLoading) {
        return (
          <View style={styles.loadingContainer}>
            <LoadingSpinner />
          </View>
        );
      }

      if (posts.length === 0) {
        return (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có bài viết nào</Text>
          </View>
        );
      }

      return (
        <View style={styles.postsContainer}>
          {posts.map((post, index) => (
            <PostCard key={post.id || index} post={post} />
          ))}
        </View>
      );
    }

    if (activeTab === 'friends') {
      if (friendsLoading) {
        return (
          <View style={styles.loadingContainer}>
            <LoadingSpinner />
          </View>
        );
      }

      const acceptedFriends = friends.filter(f => f.relationship_with_viewer === 'accepted');

      if (acceptedFriends.length === 0) {
        return (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có bạn bè nào</Text>
          </View>
        );
      }

      return (
        <View style={styles.friendsContainer}>
          {acceptedFriends.map((friendship, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.friendItem}
              onPress={() => router.push(`/profile/${friendship.user.id}`)}
            >
              <View style={styles.friendAvatar}>
                {friendship.user.avatarUrl ? (
                  <Image source={{ uri: friendship.user.avatarUrl }} style={styles.smallAvatar} />
                ) : (
                  <View style={styles.defaultSmallAvatar}>
                    <Text style={styles.smallAvatarText}>
                      {friendship.user.name?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{friendship.user.name || 'Người dùng'}</Text>
                {friendship.user.email && (
                  <Text style={styles.friendEmail}>{friendship.user.email}</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    if (activeTab === 'requests') {
      if (requestsLoading) {
        return (
          <View style={styles.loadingContainer}>
            <LoadingSpinner />
          </View>
        );
      }

      const pendingRequests = friends.filter(f => f.relationship_with_viewer === 'pending');

      if (pendingRequests.length === 0) {
        return (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không có lời mời kết bạn nào</Text>
          </View>
        );
      }

      return (
        <View style={styles.friendsContainer}>
          {pendingRequests.map((friendship, index) => (
            <View key={index} style={styles.requestItem}>
              <TouchableOpacity 
                style={styles.friendItemContent}
                onPress={() => router.push(`/profile/${friendship.user.id}`)}
              >
                <View style={styles.friendAvatar}>
                  {friendship.user.avatarUrl ? (
                    <Image source={{ uri: friendship.user.avatarUrl }} style={styles.smallAvatar} />
                  ) : (
                    <View style={styles.defaultSmallAvatar}>
                      <Text style={styles.smallAvatarText}>
                        {friendship.user.name?.charAt(0).toUpperCase() || 'U'}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.friendInfo}>
                  <Text style={styles.friendName}>{friendship.user.name || 'Người dùng'}</Text>
                  {friendship.user.email && (
                    <Text style={styles.friendEmail}>{friendship.user.email}</Text>
                  )}
                </View>
              </TouchableOpacity>
              
              <View style={styles.requestActions}>
                <TouchableOpacity 
                  style={styles.acceptButton}
                  onPress={() => handleAcceptFriend(friendship.user.id)}
                >
                  <Text style={styles.acceptButtonText}>Chấp nhận</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.rejectButton}
                  onPress={() => handleRejectFriend(friendship.user.id)}
                >
                  <Text style={styles.rejectButtonText}>Từ chối</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      );
    }

    return null;
  };

  // EditProfileModal Component
  const EditProfileModal = () => {
    const [name, setName] = useState(currentUser?.name || '');
    const [gender, setGender] = useState(currentUser?.gender || '');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
      if (!name.trim()) {
        Alert.alert('Lỗi', 'Vui lòng nhập tên');
        return;
      }

      try {
        setSaving(true);
        await handleUpdateProfile(name.trim(), gender);
      } finally {
        setSaving(false);
      }
    };

    return (
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Text style={styles.modalCancelButton}>Hủy</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Chỉnh sửa thông tin</Text>
            <TouchableOpacity onPress={handleSave} disabled={saving}>
              <Text style={[styles.modalSaveButton, saving && styles.modalSaveButtonDisabled]}>
                {saving ? 'Đang lưu...' : 'Lưu'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tên</Text>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="Nhập tên của bạn"
                maxLength={50}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Giới tính</Text>
              <View style={styles.genderContainer}>
                <TouchableOpacity
                  style={[styles.genderOption, gender === 'male' && styles.genderOptionSelected]}
                  onPress={() => setGender('male')}
                >
                  <Text style={[styles.genderText, gender === 'male' && styles.genderTextSelected]}>
                    Nam
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.genderOption, gender === 'female' && styles.genderOptionSelected]}
                  onPress={() => setGender('female')}
                >
                  <Text style={[styles.genderText, gender === 'female' && styles.genderTextSelected]}>
                    Nữ
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.genderOption, gender === 'other' && styles.genderOptionSelected]}
                  onPress={() => setGender('other')}
                >
                  <Text style={[styles.genderText, gender === 'other' && styles.genderTextSelected]}>
                    Khác
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  if (loading || !currentUser) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      </View>
    );
  }

  const acceptedFriendsCount = friends.filter(f => f.relationship_with_viewer === 'accepted').length;
  const pendingRequestsCount = friends.filter(f => f.relationship_with_viewer === 'pending').length;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {currentUser.avatarUrl ? (
              <Image source={{ uri: currentUser.avatarUrl }} style={styles.avatarLarge} />
            ) : (
              <View style={styles.defaultAvatarLarge}>
                <Text style={styles.avatarText}>
                  {currentUser.name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
          </View>
          
          <Text style={styles.name}>{currentUser.name || 'Người dùng'}</Text>
          {currentUser.email && (
            <Text style={styles.email}>{currentUser.email}</Text>
          )}
          
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{posts.length}</Text>
              <Text style={styles.statLabel}>Bài viết</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{acceptedFriendsCount}</Text>
              <Text style={styles.statLabel}>Bạn bè</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{currentUser.role}</Text>
              <Text style={styles.statLabel}>Vai trò</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setShowEditModal(true)}
          >
            <Text style={styles.editButtonText}>Chỉnh sửa thông tin</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
            onPress={() => setActiveTab('posts')}
          >
            <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>
              Bài viết ({posts.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
            onPress={() => setActiveTab('friends')}
          >
            <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
              Bạn bè ({acceptedFriendsCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
            onPress={() => setActiveTab('requests')}
          >
            <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
              Lời mời ({pendingRequestsCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {renderTabContent()}
      </ScrollView>
      
      {/* Edit Profile Modal */}
      <EditProfileModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  profileHeader: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  defaultAvatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  stats: {
    flexDirection: 'row',
    gap: 30,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 50,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    fontStyle: 'italic',
  },
  postsContainer: {
    backgroundColor: '#fff',
    marginTop: 10,
  },
  friendsContainer: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 15,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  friendAvatar: {
    marginRight: 12,
  },
  smallAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  defaultSmallAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  friendEmail: {
    fontSize: 14,
    color: '#666',
  },
  // Request styles
  requestItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  friendItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 10,
    paddingLeft: 62,
  },
  acceptButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  acceptButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  rejectButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  rejectButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingTop: 50,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalCancelButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  modalSaveButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalSaveButtonDisabled: {
    color: '#999',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  genderOptionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  genderText: {
    fontSize: 16,
    color: '#666',
  },
  genderTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
});