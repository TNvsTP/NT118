import { type Media, type PostItem } from '@/models/post';
import { PostService } from '@/services/post';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { ReactionsSharesModal } from '../app/modals/reactions-shares-modal';

const { width: screenWidth } = Dimensions.get('window');

interface PostCardProps {
  post: PostItem;
  isDetailView?: boolean; // Để biết có đang ở trang chi tiết không
  onReactionToggle?: (postId: number, newState: boolean) => void;
  onShareToggle?: (postId: number, newState: boolean) => void;
}

// Component hiển thị avatar user
const UserAvatar = ({ uri, style }: { uri?: string, style: any }) => {
  if (uri) {
    return <Image source={{ uri }} style={style} />;
  }
  return <View style={[style, { backgroundColor: '#ddd' }]} />;
};

// Component hiển thị gallery ảnh
const MediaGallery = ({ 
  media, 
  onImagePress 
}: { 
  media: Media[], 
  onImagePress: (imageUrl: string, allImages: string[]) => void 
}) => {
  if (!media || media.length === 0) return null;

  const imageWidth = media.length === 1 ? screenWidth - 30 : (screenWidth - 45) / 2;
  const imageHeight = media.length === 1 ? 300 : 150;
  
  const allImageUrls = media.map(item => item.media_url);

  return (
    <View style={styles.mediaContainer}>
      {media.slice(0, 4).map((item, index) => (
        <TouchableOpacity
          key={item.id}
          style={[styles.mediaItem, { width: imageWidth, height: imageHeight }]}
          onPress={() => onImagePress(item.media_url, allImageUrls)}
        >
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
        </TouchableOpacity>
      ))}
    </View>
  );
};

export const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  isDetailView = false,
  onReactionToggle,
  onShareToggle 
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTab, setModalTab] = useState<'reactions' | 'shares'>('reactions');

  const formattedDate = new Date(post.created_at).toLocaleDateString('vi-VN', {
    day: 'numeric', 
    month: 'numeric', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit'
  });

  const userName = post.user?.name || "Người dùng";
  const userAvatar = post.user?.avatarUrl;

  // Xử lý nhấn vào avatar -> đi tới profile user
  const handleAvatarPress = () => {
    if (post.user?.id) {
      router.push(`/profile/${post.user.id}` as any);
    }
  };

  // Xử lý nhấn vào ảnh -> mở ảnh fullscreen
  const handleImagePress = (imageUrl: string, allImages: string[]) => {
    // Có thể mở modal hiển thị ảnh hoặc navigate tới image viewer
    router.push({
      pathname: '/modals/image-viewer',
      params: { 
        imageUrl,
        allImages: JSON.stringify(allImages)
      }
    } as any);
  };

  // Xử lý toggle reaction
  const handleReactionPress = async () => {
    try {
      await PostService.toggleReaction(post.id);
      const newState = !post.is_liked;
      onReactionToggle?.(post.id, newState);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể thực hiện reaction');
    }
  };

  // Xử lý toggle share
  const handleSharePress = async () => {
    try {
      await PostService.toggleShare(post.id);
      const newState = !post.is_shared;
      onShareToggle?.(post.id, newState);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể thực hiện share');
    }
  };

  // Xử lý nhấn vào content/comment -> đi tới chi tiết post
  const handleContentPress = () => {
    if (!isDetailView) {
      router.push(`/post/${post.id}` as any);
    }
  };

  // Xử lý hiển thị modal reactions
  const handleReactionsPress = () => {
    setModalTab('reactions');
    setModalVisible(true);
  };

  // Xử lý hiển thị modal shares
  const handleSharesPress = () => {
    setModalTab('shares');
    setModalVisible(true);
  };

  return (
    <View style={styles.post}>
      <View style={styles.postHeader}>
        {/* Avatar có thể nhấn */}
        <TouchableOpacity onPress={handleAvatarPress}>
          <UserAvatar uri={userAvatar} style={styles.avatar} />
        </TouchableOpacity>
        
        <View style={styles.authorInfo}>
          <TouchableOpacity onPress={handleAvatarPress}>
            <Text style={styles.author}>{userName}</Text>
          </TouchableOpacity>
          <Text style={styles.timestamp}>{formattedDate}</Text>
        </View>
      </View>
      
      {/* Content có thể nhấn để vào chi tiết (nếu không phải đang ở chi tiết) */}
      <TouchableOpacity 
        onPress={handleContentPress}
        disabled={isDetailView}
        activeOpacity={isDetailView ? 1 : 0.7}
      >
        <Text style={styles.content}>{post.content}</Text>
      </TouchableOpacity>
      
      {/* Media gallery với khả năng nhấn vào ảnh */}
      <MediaGallery 
        media={post.media} 
        onImagePress={handleImagePress}
      />
      
      <View style={styles.postFooter}>
        {/* Reaction button */}
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleReactionPress}
          >
            <Text style={[
              styles.stat, 
              post.is_liked && styles.statActive
            ]}>
              {post.is_liked ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleReactionsPress}>
            <Text style={styles.countText}>{post.reactions_count || 0}</Text>
          </TouchableOpacity>
        </View>

        {/* Comment button - chỉ navigate nếu không phải detail view */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleContentPress}
          disabled={isDetailView}
        >
          <Text style={styles.stat}>💬 {post.comments_count || 0}</Text>
        </TouchableOpacity>

        {/* Share button */}
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleSharePress}
          >
            <Text style={[
              styles.stat,
              post.is_shared && styles.statActive
            ]}>
              {post.is_shared ? '🔗' : '📤'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSharesPress}>
            <Text style={styles.countText}>{post.shares_count || 0}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal hiển thị danh sách reactions/shares */}
      <ReactionsSharesModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        postId={post.id}
        initialTab={modalTab}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  post: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 4,
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
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionButton: {
    padding: 5,
  },
  stat: {
    color: '#555',
    fontSize: 13,
    fontWeight: '500',
  },
  statActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  countText: {
    color: '#007AFF',
    fontSize: 13,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});