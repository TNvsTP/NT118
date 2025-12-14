import { PostCard } from '@/components/post-card';
import { type PostItem } from '@/models/post';
import { Link } from 'expo-router';
import {
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { LoadingSpinner } from '../../components/loading-spinner';
import { usePosts } from '../../hooks/use-posts';

// --- Màn hình chính ---
export default function HomeScreen() {
  const { 
    posts, 
    loading, 
    refreshing, 
    loadingMore, 
    hasMore, 
    error, 
    loadMore, 
    refresh,
    updatePostReaction,
    updatePostShare
  } = usePosts();

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      loadMore();
    }
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingFooter}>
        <LoadingSpinner />
        <Text style={styles.loadingText}>Đang tải thêm...</Text>
      </View>
    );
  };

  const handleReactionToggle = (postId: number, newState: boolean) => {
    updatePostReaction(postId, newState);
  };

  const handleShareToggle = (postId: number, newState: boolean) => {
    updatePostShare(postId, newState);
  };

  const renderItem: ListRenderItem<PostItem> = ({ item }) => (
    <PostCard 
      post={item} 
      onReactionToggle={handleReactionToggle}
      onShareToggle={handleShareToggle}
    />
  );

  // Logic hiển thị Loading lần đầu
  if (loading && posts.length === 0) {
    return (
      <View style={styles.container}>
        <HeaderComponent />
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
          <Text style={styles.loadingText}>Đang tải bài viết...</Text>
        </View>
      </View>
    );
  }

  // Logic hiển thị Lỗi
  if (error && posts.length === 0) {
    return (
      <View style={styles.container}>
        <HeaderComponent />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderComponent />
      
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()} // Đảm bảo key là string
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5} // Tăng lên 0.5 để load sớm hơn một chút cho mượt
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// Tách Header ra cho gọn code
const HeaderComponent = () => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>Trang chủ</Text>
    <Link href="/modals/new-post" asChild>
      <TouchableOpacity style={styles.newPostButton}>
        <Text style={styles.newPostText}>+</Text>
      </TouchableOpacity>
    </Link>
  </View>
);

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
    paddingTop: 50, // Điều chỉnh tùy theo SafeAreaView
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  newPostButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newPostText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: -2, // Căn chỉnh dấu +
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingFooter: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});