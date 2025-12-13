import { type Media } from '@/models/post';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { LoadingSpinner } from '../../components/loading-spinner';
import { usePostDetail } from '../../hooks/use-post-detail';
const { width: screenWidth } = Dimensions.get('window');

// --- Helper Component: Avatar ---
const UserAvatar = ({ uri, style }: { uri?: string, style: any }) => {
  if (uri) {
    return <Image source={{ uri }} style={style} />;
  }
  return <View style={[style, { backgroundColor: '#ddd' }]} />;
};

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

// --- Updated CommentItem with User object ---
// PostDetailScreen.tsx (Phần CommentItem)

const CommentItem = ({ 
  comment, 
  depth = 0, 
  onRetry, 
  onRemove,
  // Thêm các props mới
  replyingId, 
  onSetReplying, 
  onSubmitReply 
}: { 
  comment: any, 
  depth?: number, 
  onRetry?: (comment: any) => void,
  onRemove?: (localId: string) => void,
  replyingId: number | null,
  onSetReplying: (id: number | null) => void,
  onSubmitReply: (parentId: number, content: string) => Promise<void>
}) => {
  const shouldIndent = depth < 2;
  const isSending = comment.status === 'sending';
  const isFailed = comment.status === 'failed';
  
  // Kiểm tra xem comment này có đang được reply không
  // Dùng comment.id (id thật) để check
  const isReplyingToThis = replyingId === comment.id && comment.id !== -1;

  const handleReplySubmit = async (text: string) => {
    await onSubmitReply(comment.id, text);
  };

  return (
    <View style={[
        styles.commentContainer, 
        { opacity: isSending ? 0.7 : 1 } 
    ]}> 
      <View style={styles.commentMain}>
        <UserAvatar uri={comment.user?.avatarUrl} style={styles.commentAvatar} />
        
        <View style={styles.commentContent}>
          <Text style={styles.commentAuthor}>{comment.user?.name || 'Người dùng'}</Text> 
          <Text style={styles.commentText}>{comment.content}</Text>
          
          <View style={styles.commentFooter}>
             <Text style={styles.commentTime}>
              {isSending ? 'Đang gửi...' : isFailed ? 'Gửi lỗi' : new Date(comment.created_at).toLocaleDateString('vi-VN')}
            </Text>
            
            {/* Logic Loading/Error giữ nguyên */}
            {isSending && <ActivityIndicator size="small" color="#999" style={{marginLeft: 8}} />}
            {isFailed && (
               /* ... Logic retry/remove giữ nguyên ... */
               <View style={{flexDirection: 'row', marginLeft: 10}}>
                   {/* Copy lại code retry cũ của bạn vào đây */}
               </View>
            )}

            {/* Nút Trả lời: set ID vào state cha */}
            {!isSending && !isFailed && (
                 <TouchableOpacity 
                    style={{marginLeft: 15}} 
                    onPress={() => onSetReplying(comment.id)}
                 >
                    <Text style={{fontSize: 12, fontWeight: '600', color: '#666'}}>Trả lời</Text>
                 </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Hiển thị comment replies đang pending (sending) trước ô input */}
      {comment.children_recursive && comment.children_recursive.length > 0 && (
        <View style={[styles.repliesContainer, !shouldIndent && { paddingLeft: 0 }]}>
          {comment.children_recursive
            .filter((childReply: any) => childReply.status === 'sending')
            .map((childReply: any) => (
              <CommentItem 
                  key={childReply.id || childReply.localId} 
                  comment={childReply} 
                  depth={depth + 1}
                  onRetry={onRetry}
                  onRemove={onRemove}
                  replyingId={replyingId}
                  onSetReplying={onSetReplying}
                  onSubmitReply={onSubmitReply}
              />
            ))}
        </View>
      )}

      {/* --- HIỂN THỊ Ô NHẬP REPLY NẾU ĐANG CHỌN --- */}
      {isReplyingToThis && (
        <View style={{ marginLeft: 50, marginBottom: 10 }}>
            <ReplyInput 
                onSubmit={handleReplySubmit}
                onCancel={() => onSetReplying(null)}
                isSubmitting={false}
            />
        </View>
      )}

      {/* Đệ quy render comment con đã gửi thành công */}
      {comment.children_recursive && comment.children_recursive.length > 0 && (
        <View style={[styles.repliesContainer, !shouldIndent && { paddingLeft: 0 }]}>
          {comment.children_recursive
            .filter((childReply: any) => childReply.status !== 'sending')
            .map((childReply: any) => (
              <CommentItem 
                  key={childReply.id || childReply.localId} 
                  comment={childReply} 
                  depth={depth + 1}
                  onRetry={onRetry}
                  onRemove={onRemove}
                  replyingId={replyingId}
                  onSetReplying={onSetReplying}
                  onSubmitReply={onSubmitReply}
              />
            ))}
        </View>
      )}
    </View>
  );
};

const ReplyInput = ({ 
  onSubmit, 
  onCancel, 
  isSubmitting 
}: { 
  onSubmit: (text: string) => void, 
  onCancel: () => void, 
  isSubmitting: boolean 
}) => {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (text.trim()) {
      const contentToSend = text.trim();
      // Clear input ngay lập tức để tạo cảm giác mượt mà
      setText('');
      // Gọi onSubmit với nội dung đã lưu
      onSubmit(contentToSend);
    }
  };

  return (
    <View style={styles.replyInputContainer}>
      <View style={styles.replyInputWrapper}>
        <TextInput
          style={styles.replyInput}
          placeholder="Viết phản hồi..."
          value={text}
          onChangeText={setText}
          autoFocus={true} // Tự động focus khi hiện ra
          multiline
        />
      </View>
      <View style={styles.replyActions}>
        <TouchableOpacity onPress={onCancel} style={styles.replyCancelBtn}>
          <Text style={styles.replyCancelText}>Hủy</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={handleSubmit} 
          disabled={!text.trim()}
          style={[styles.replySubmitBtn, !text.trim() && styles.replySubmitBtnDisabled]}
        >
          <Text style={styles.replySubmitText}>Gửi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const rawId = Array.isArray(id) ? id[0] : (id || '');

  // 2. Ép kiểu sang Number. Nếu không có id thì mặc định là 0 hoặc -1
  const postId = rawId ? Number(rawId) : 0;
   
  const { post, comments, loading, error, addComment, replyComment, retryComment, removeFailedComment, refresh } = usePostDetail(postId);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyingToCommentId, setReplyingToCommentId] = useState<number | null>(null);
  const rootComments = useMemo(() => {
    if (!comments) return [];
    return comments.filter(c => c.parent_comment_id === null);
  }, [comments]);

  const handleAddComment = async () => {
    const contentToSend = commentText.trim(); // 1. Lưu nội dung vào biến tạm
    if (!contentToSend) return;

    // 2. Clear input NGAY LẬP TỨC để tạo cảm giác mượt mà
    setCommentText(''); 
    
    // 3. Không cần loading state cho input nữa (hoặc giữ nếu muốn disable nút gửi)
    setSubmittingComment(true);

    // 4. Gọi hàm gửi với nội dung đã lưu
    const success = await addComment(contentToSend);
    
    // 5. Nếu thất bại thì hồi phục lại text để user không phải gõ lại (UX tốt hơn)
    if (!success) {
      setCommentText(contentToSend); 
      Alert.alert('Lỗi', 'Không thể gửi bình luận. Vui lòng thử lại.');
    }
    
    setSubmittingComment(false);
  };

  const handleSubmitReply = async (parentId: number, content: string) => {
    const success = await replyComment(parentId, content);
    if (success) {
      // Nếu thành công thì tắt ô nhập reply
      setReplyingToCommentId(null);
    }
  };

  if (loading && !post) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Quay lại</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bài viết</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
          <Text style={styles.loadingText}>Đang tải bài viết...</Text>
        </View>
      </View>
    );
  }

  if (error || !post) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Quay lại</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bài viết</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Không tìm thấy bài viết'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bài viết</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
      >
        {/* Post Content */}
        <View style={styles.post}>
          <View style={styles.postHeader}>
            {/* Cập nhật Avatar cho Post Author */}
            {/* Giả định object post cũng có property user thay vì author string */}
            <UserAvatar 
                uri={post.user?.avatarUrl} 
                style={styles.avatar} 
            />
            
            <View style={styles.authorInfo}>
               {/* Cập nhật tên tác giả bài viết */}
              <Text style={styles.author}>{post.user?.name || 'Người dùng ẩn danh'}</Text>
              <Text style={styles.timestamp}>
                {new Date(post.created_at).toLocaleDateString('vi-VN')}
              </Text>
            </View>
          </View>

          <Text style={styles.postContent}>{post.content}</Text>
           
          <MediaGallery media={post.media} />

          <View style={styles.postFooter}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.stat}>❤️ {post.reactions_count}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.stat}>💬 {post.comments_count}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.sectionTitle}>Bình luận ({comments.length})</Text>
           
          {rootComments.map((comment) => (
            <CommentItem 
              key={comment.id || comment.localId} 
              comment={comment} 
              onRetry={retryComment}
              onRemove={removeFailedComment}
              // Truyền props xuống
              replyingId={replyingToCommentId}
              onSetReplying={setReplyingToCommentId}
              onSubmitReply={handleSubmitReply}
            />
          ))}
           
          {rootComments.length === 0 && (
            <Text style={styles.noCommentsText}>Chưa có bình luận nào</Text>
          )}
        </View>
      </ScrollView>

      {/* Comment Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Viết bình luận..."
          value={commentText}
          onChangeText={setCommentText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[styles.sendButton, (!commentText.trim() || submittingComment) && styles.sendButtonDisabled]}
          onPress={handleAddComment}
          disabled={!commentText.trim() || submittingComment}
        >
          {submittingComment ? (
            <LoadingSpinner size="small" />
          ) : (
            <Text style={styles.sendButtonText}>Gửi</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ... Các style giữ nguyên như cũ
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
    fontSize: 16,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
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
  post: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
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
    backgroundColor: '#ddd',
    marginRight: 10,
  },
  authorInfo: {
    flex: 1,
  },
  author: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  postContent: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10,
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreMediaText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  postFooter: {
    flexDirection: 'row',
    gap: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButton: {
    padding: 5,
  },
  stat: {
    color: '#666',
  },
  commentsSection: {
    backgroundColor: '#fff',
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  
  comment: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  commentContainer: {
    marginBottom: 10,
  },
  // Phần hiển thị nội dung chính (Avatar + Text)
  commentMain: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  // Container chứa các replies (thụt vào)
  repliesContainer: {
    paddingLeft: 40, // Thụt vào 40px so với cha (bằng width avatar + margin)
    marginTop: 5,
    // borderLeftWidth: 1, // (Option) Thêm đường kẻ dọc để dễ nhìn thread
    // borderLeftColor: '#eee',
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ddd',
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
    backgroundColor: '#f9f9f9', // Thêm nền nhẹ cho nội dung text để nổi bật
    borderRadius: 12,
    padding: 10,
  },
  commentAuthor: {
    fontSize: 13, // Giảm nhẹ size
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#333',
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  commentFooter: {
    flexDirection: 'row',
    marginTop: 2,
  },
  commentTime: {
    fontSize: 12,
    color: '#666',
  },
  noCommentsText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  replyInputContainer: {
    flexDirection: 'column',
    marginTop: 5,
  },
  replyInputWrapper: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 8,
    marginBottom: 5,
  },
  replyInput: {
    fontSize: 14,
    maxHeight: 80,
    color: '#333',
  },
  replyActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  replyCancelBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  replyCancelText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  replySubmitBtn: {
    backgroundColor: '#007AFF',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  replySubmitBtnDisabled: {
    backgroundColor: '#ccc',
  },
  replySubmitText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 10,
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
    borderRadius: 20,
    justifyContent: 'center',
    minWidth: 60,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
});