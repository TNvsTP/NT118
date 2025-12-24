import { LoadingSpinner } from '@/components/loading-spinner';
import { PostCard } from '@/components/post-card';
import { useAuth } from '@/hooks/use-auth-context';
import { Friendship } from '@/models/friendship';
import { PostItem } from '@/models/post';
import { User } from '@/models/user';
import { UserService } from '@/services/user';
import { useNavigation } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type TabType = 'posts' | 'friends';

export default function ProfileScreen() {
  const { id } = useLocalSearchParams();
  const { user: currentUser } = useAuth();
  const navigation = useNavigation();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [postsLoading, setPostsLoading] = useState(false);
  const [friendsLoading, setFriendsLoading] = useState(false);

  const userId = parseInt(id as string);
  const isOwnProfile = currentUser?.id === userId;

  // Cập nhật title khi có dữ liệu user
  useLayoutEffect(() => {
    if (profileUser) {
      const title = isOwnProfile 
        ? 'Hồ sơ của tôi' 
        : profileUser.name || 'Hồ sơ người dùng';
      
      navigation.setOptions({
        title: title,
        headerBackTitle: 'Quay lại'
      });
    }
  }, [profileUser, isOwnProfile, navigation]);

  useEffect(() => {
    loadProfileData();
  }, [id]);

  useEffect(() => {
    if (profileUser) {
      if (activeTab === 'posts' && posts.length === 0) {
        loadPosts();
      } else if (activeTab === 'friends' && friends.length === 0) {
        loadFriends();
      }
    }
  }, [activeTab, profileUser]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const userResponse = await UserService.getUser(userId);
      setProfileUser(userResponse);
      
      // Cập nhật title ngay khi có dữ liệu user
      const title = currentUser?.id === userId 
        ? 'Hồ sơ của tôi' 
        : userResponse.name || 'Hồ sơ người dùng';
      
      navigation.setOptions({
        title: title,
        headerBackTitle: 'Quay lại'
      });
      
      // Load posts by default
      await loadPosts();
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin profile');
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      setPostsLoading(true);
      const postsData = await UserService.getProfilePosts(userId);
      setPosts(postsData);
    } catch (error) {
      console.error('Error loading posts:', error);
      Alert.alert('Lỗi', 'Không thể tải bài viết');
    } finally {
      setPostsLoading(false);
    }
  };

  const loadFriends = async () => {
    try {
      setFriendsLoading(true);
      const friendsData = await UserService.getFriends(userId);
      setFriends(friendsData);
    } catch (error) {
      console.error('Error loading friends:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách bạn bè');
    } finally {
      setFriendsLoading(false);
    }
  };

  const handleAddFriend = async () => {
    try {
      setActionLoading(true);
      await UserService.addFriend(userId);
      Alert.alert('Thành công', 'Đã gửi lời mời kết bạn');
      await loadProfileData(); // Reload để cập nhật trạng thái
    } catch (error) {
      console.error('Error adding friend:', error);
      Alert.alert('Lỗi', 'Không thể gửi lời mời kết bạn');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptFriend = async () => {
    try {
      setActionLoading(true);
      // Tìm friendship ID từ user ID
      const friendshipId = await UserService.getFriendshipId(currentUser?.id || 0, userId);
      
      if (friendshipId) {
        await UserService.acceptFriend(friendshipId);
        Alert.alert('Thành công', 'Đã chấp nhận lời mời kết bạn');
        await loadProfileData();
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy lời mời kết bạn');
      }
    } catch (error) {
      console.error('Error accepting friend:', error);
      Alert.alert('Lỗi', 'Không thể chấp nhận lời mời kết bạn');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteFriend = async () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn hủy kết bạn?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xác nhận', onPress: confirmDeleteFriend }
      ]
    );
  };

  const confirmDeleteFriend = async () => {
    try {
      setActionLoading(true);
      // Tìm friendship ID từ user ID
      const friendshipId = await UserService.getFriendshipId(currentUser?.id || 0, userId);
      
      if (friendshipId) {
        await UserService.deleteFriend(friendshipId);
        Alert.alert('Thành công', 'Đã hủy kết bạn');
        await loadProfileData();
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy mối quan hệ bạn bè');
      }
    } catch (error) {
      console.error('Error deleting friend:', error);
      Alert.alert('Lỗi', 'Không thể hủy kết bạn');
    } finally {
      setActionLoading(false);
    }
  };

  const renderFriendButton = () => {
    if (isOwnProfile || !profileUser) return null;

    const friendStatus = profileUser.friend_status;

    if (friendStatus === 'friends') {
      return (
        <TouchableOpacity 
          style={[styles.actionButton, styles.friendButton]} 
          onPress={handleDeleteFriend}
          disabled={actionLoading}
        >
          <Text style={styles.buttonText}>Bạn bè</Text>
        </TouchableOpacity>
      );
    }

    if (friendStatus === 'ingoing_request') {
      return (
        <TouchableOpacity 
          style={[styles.actionButton, styles.acceptButton]} 
          onPress={handleAcceptFriend}
          disabled={actionLoading}
        >
          <Text style={styles.buttonText}>Xác nhận lời mời</Text>
        </TouchableOpacity>
      );
    }

    if (friendStatus === 'outgoing_request') {
      return (
        <View style={[styles.actionButton, styles.pendingButton]}>
          <Text style={styles.buttonText}>Đã gửi lời mời</Text>
        </View>
      );
    }

    // friendStatus === null
    return (
      <TouchableOpacity 
        style={[styles.actionButton, styles.addButton]} 
        onPress={handleAddFriend}
        disabled={actionLoading}
      >
        <Text style={styles.buttonText}>Kết bạn</Text>
      </TouchableOpacity>
    );
  };

  const renderTabContent = () => {
    if (activeTab === 'posts') {
      if (postsLoading) {
        return (
          <View style={styles.tabLoadingContainer}>
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
          <View style={styles.tabLoadingContainer}>
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

    return null;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      </View>
    );
  }

  if (!profileUser) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không tìm thấy người dùng</Text>
        </View>
      </View>
    );
  }

  const acceptedFriendsCount = friends.filter(f => f.relationship_with_viewer === 'accepted').length;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header Profile */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {profileUser.avatarUrl ? (
              <Image source={{ uri: profileUser.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.defaultAvatar}>
                <Text style={styles.avatarText}>
                  {profileUser.name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{profileUser.name || 'Người dùng'}</Text>
            {profileUser.email && (
              <Text style={styles.userEmail}>{profileUser.email}</Text>
            )}
            {profileUser.gender && (
              <Text style={styles.userGender}>Giới tính: {profileUser.gender}</Text>
            )}
            <Text style={styles.userRole}>Vai trò: {profileUser.role}</Text>
          </View>

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
              <Text style={styles.statNumber}>{profileUser.role}</Text>
              <Text style={styles.statLabel}>Vai trò</Text>
            </View>
          </View>

          {renderFriendButton()}
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
        </View>

        {/* Tab Content */}
        {renderTabContent()}
      </ScrollView>
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
  },
  tabLoadingContainer: {
    padding: 50,
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  profileSection: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  defaultAvatar: {
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
  userInfo: {
    alignItems: 'center',
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 3,
  },
  userGender: {
    fontSize: 14,
    color: '#888',
    marginBottom: 3,
  },
  userRole: {
    fontSize: 14,
    color: '#888',
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
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  friendButton: {
    backgroundColor: '#34C759',
  },
  acceptButton: {
    backgroundColor: '#007AFF',
  },
  addButton: {
    backgroundColor: '#007AFF',
  },
  pendingButton: {
    backgroundColor: '#888',
  },
  buttonText: {
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
});