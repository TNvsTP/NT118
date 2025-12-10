import { Link } from 'expo-router';
import {
  Dimensions,
  FlatList,
  Image,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { LoadingSpinner } from '../../components/loading-spinner';
import { usePosts } from '../../hooks/use-posts';
// Đảm bảo đường dẫn import đúng
import { PostItem as IPostItem, Media } from '@/services/post';

const { width: screenWidth } = Dimensions.get('window');

// --- Component hiển thị ảnh/video ---
const MediaGallery = ({ media }: { media: Media[] }) => {
  if (!media || media.length === 0) return null;

  const imageWidth = media.length === 1 ? screenWidth - 30 : (screenWidth - 45) / 2;
  const imageHeight = media.length === 1 ? 300 : 150;

  return (
    <View style={styles.mediaContainer}>
      {media.slice(0, 4).map((item, index) => (
        <View key={item.id} style={[
          styles.mediaItem,
          { width: imageWidth, height: imageHeight }
        ]}>
          <Image
            source={{ uri: item.media_url }}
            style={styles.mediaImage}
            resizeMode="cover"
          />
          {media.length > 4 && index === 3 && (
            <View style={styles.moreMediaOverlay}>
              <Text style={styles.moreMediaText}>+{media.length - 4}</Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

// --- Component hiển thị từng bài Post ---
const PostItem = ({ post }: { post: IPostItem }) => {
  // Format ngày tháng
  const formattedDate = new Date(post.created_at).toLocaleDateString('vi-VN', {
    day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  // Giả định interface User của bạn có trường name và avatar_url
  // Hãy thay đổi post.user.name thành trường thực tế trong file user.ts của bạn (vd: full_name, username...)
  const userName = post.user?.name || "Người dùng"; 
  const userAvatar = post.user?.avatarUrl; 

  return (
    <Link href={`/post/${post.id}` as any} asChild>
      <TouchableOpacity style={styles.post}>
        <View style={styles.postHeader}>
          {/* Avatar User */}
          {userAvatar ? (
             <Image source={{ uri: userAvatar }} style={styles.avatar} />
          ) : (
             <View style={[styles.avatar, { backgroundColor: '#ddd' }]} />
          )}
          
          <View style={styles.authorInfo}>
            <Text style={styles.author}>{userName}</Text>
            <Text style={styles.timestamp}>{formattedDate}</Text>
          </View>
        </View>
        
        <Text style={styles.content}>{post.content}</Text>
        
        <MediaGallery media={post.media} />
        
        <View style={styles.postFooter}>
          {/* Mapping đúng tên trường từ interface */}
          <Text style={styles.stat}>❤️ {post.reactions_countsCount || 0}</Text>
          <Text style={styles.stat}>💬 {post.comments_count || 0}</Text>
          <Text style={styles.stat}>🔗 {post.shares_count || 0}</Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

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
    refresh 
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

  const renderItem: ListRenderItem<IPostItem> = ({ item }) => (
    <PostItem post={item} />
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
  post: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 4, // Tăng khoảng cách giữa các bài một chút
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  authorInfo: {
    flex: 1,
  },
  author: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 2,
    color: '#000',
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
  },
  content: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10,
    color: '#333',
  },
  mediaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginBottom: 10,
  },
  mediaItem: {
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#f0f0f0',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  moreMediaOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreMediaText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  postFooter: {
    flexDirection: 'row',
    gap: 25,
    marginTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
    paddingTop: 10,
  },
  stat: {
    color: '#555',
    fontSize: 13,
    fontWeight: '500',
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