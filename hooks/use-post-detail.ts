import { PostService, type Comment, type PostItem } from '@/services/post';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './use-auth-context';

export interface CommentUI extends Comment {
  status?: 'sending' | 'sent' | 'failed';
  localId?: string; // ID tạm để định danh khi chưa có ID thật từ server
}

export const usePostDetail = (postId: number) => {
  const [post, setPost] = useState<PostItem | null>(null);
  const [comments, setComments] = useState<CommentUI[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {user, isAuthenticated} = useAuth();
  const fetchPostDetail = useCallback(async () => {
    if (!postId) return;
    
    try {
      setLoading(true);
      setError(null);

      // Fetch post and comments from API
      const [postResponse, commentsResponse] = await Promise.all([
        PostService.getPostById(postId),
        PostService.getComments(postId)
      ]);

      if (!postResponse) {
        setError('Không tìm thấy bài viết');
        return;
      }

      setPost(postResponse);
      setComments(commentsResponse.data.map((c: Comment) => ({ ...c, status: 'sent' })));
    } catch (err: any) {
      setError('Có lỗi xảy ra khi tải bài viết');
      console.error('Error fetching post detail:', err);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const addComment = useCallback(async (content: string) => {
    if (!postId || !content.trim()) return false;
    console.log(user);
    if(isAuthenticated){
      console.log("authenticated:", isAuthenticated);
    }
    if (!user) {
      console.warn("Bạn chưa đăng nhập");
      
      return;
    }
    const tempId = `temp-${Date.now()}`;
    const optimisticComment: CommentUI = {
      id: -1, // ID tạm, sẽ được thay thế bằng ID thật từ server
      post_id: postId,
      content: content.trim(),
      parent_comment_id: null, // Comment gốc 
      created_at: new Date().toISOString(),
      reactions_count: 0,
      is_liked: false,
      user: user,
      children_recursive: [],
      status: 'sending', // Trạng thái đang gửi
      localId: tempId
    };

    setComments(prev => [optimisticComment, ...prev]);

    try {
      // C. Gọi API
      const response = await PostService.addComment(postId, content.trim());
      
     if (response) {
        // [SỬA ĐOẠN NÀY]: Thay vì thay thế hoàn toàn { ...response }, hãy merge vào c cũ
        setComments(prev => prev.map(c => 
          c.localId === tempId ? { 
            ...c,           // 1. Giữ lại các thông tin cũ (quan trọng nhất là user info)
            ...response,    // 2. Cập nhật các thông tin mới từ server (id thật, created_at)
            status: 'sent'  // 3. Cập nhật trạng thái
          } : c
        ));
        
        setPost(prev => prev ? { ...prev, comments_count: prev.comments_count + 1 } : null);
        return true;
      } else {
        throw new Error("No response");
      }
    } catch (err: any) {
      console.error('Error adding comment:', err);
      // E. Thất bại: Đánh dấu comment giả là 'failed'
      setComments(prev => prev.map(c => 
        c.localId === tempId ? { ...c, status: 'failed' } : c
      ));
      return false;
    }
  }, [postId]);
  const retryComment = useCallback(async (failedComment: CommentUI) => {
    if (!failedComment.localId) return false;
    
    // Cập nhật trạng thái về 'sending'
    setComments(prev => prev.map(c => 
      c.localId === failedComment.localId ? { ...c, status: 'sending' } : c
    ));

    try {
      const response = await PostService.addComment(postId, failedComment.content);
      
      if (response) {
        // Thành công: Thay thế comment bằng response từ server
        setComments(prev => prev.map(c => 
          c.localId === failedComment.localId ? { ...response, status: 'sent' } : c
        ));
        
        setPost(prev => prev ? { ...prev, comments_count: prev.comments_count + 1 } : null);
        return true;
      } else {
      }
    } catch (err: any) {
      console.error('Error retrying comment:', err);
      // Thất bại lại: Đánh dấu lại là 'failed'
      setComments(prev => prev.map(c => 
        c.localId === failedComment.localId ? { ...c, status: 'failed' } : c
      ));
      return false;
    }
  }, [postId]);

  const removeFailedComment = useCallback((localId: string) => {
    setComments(prev => prev.filter(c => c.localId !== localId));
  }, []);

  useEffect(() => {
    fetchPostDetail();
  }, [fetchPostDetail]);

  return {
    post,
    comments,
    loading,
    error,
    addComment,
    retryComment,
    removeFailedComment,
    refresh: fetchPostDetail,
  };
};