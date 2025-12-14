import { PostCard } from '@/components/post-card';
import { PostItem } from '@/models/post';
import { User } from '@/models/user';
import { router } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SearchResultsProps {
  users: User[];
  posts: PostItem[];
  onUserPress?: (user: User) => void;
  onPostPress?: (post: PostItem) => void;
  onReactionToggle?: (postId: number, newState: boolean) => void;
  onShareToggle?: (postId: number, newState: boolean) => void;
  onPostUpdated?: (updatedPost: PostItem) => void;
  onPostDeleted?: (postId: number) => void;
  onPostReported?: (postId: number) => void;
}

// Component hiển thị avatar user
const UserAvatar = ({ uri, style }: { uri?: string, style: any }) => {
  if (uri) {
    return <Image source={{ uri }} style={style} />;
  }
  return <View style={[style, { backgroundColor: '#ddd' }]} />;
};

export function SearchResults({ 
  users, 
  posts, 
  onUserPress, 
  onPostPress, 
  onReactionToggle, 
  onShareToggle,
  onPostUpdated,
  onPostDeleted,
  onPostReported
}: SearchResultsProps) {
  return (
    <View style={styles.container}>
      {users.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Người dùng</Text>
          {users.map((user: User) => (
            <TouchableOpacity 
              key={user.id} 
              style={styles.userItem}
              onPress={() => {
                router.push(`/profile/${user.id}` as any);
                onUserPress?.(user);
              }}
            >
              <View style={styles.userInfo}>
                <UserAvatar uri={user.avatarUrl} style={styles.avatar} />
                <View>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userUsername}>@{user.email?.split('@')[0] || user.id}</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.followButton}
                onPress={(e) => {
                  e.stopPropagation(); // Ngăn không cho trigger navigation
                  // TODO: Implement follow functionality
                  console.log('Follow user:', user.id);
                }}
              >
                <Text style={styles.followButtonText}>Theo dõi</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {posts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bài đăng</Text>
          {posts.map((post: PostItem) => (
            <PostCard 
              key={post.id} 
              post={post}
              onReactionToggle={onReactionToggle}
              onShareToggle={onShareToggle}
              onPostUpdated={onPostUpdated}
              onPostDeleted={onPostDeleted}
              onPostReported={onPostReported}
            />
          ))}
        </View>
      )}

      {users.length === 0 && posts.length === 0 && (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>Không tìm thấy kết quả nào</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    paddingHorizontal: 0,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ddd',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userUsername: {
    fontSize: 14,
    color: '#666',
  },
  followButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  followButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  noResultsContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});