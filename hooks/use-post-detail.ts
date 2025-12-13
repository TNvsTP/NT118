import { PostService, type Comment, type PostItem } from '@/services/post';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './use-auth-context';

export interface CommentUI extends Comment {
  status?: 'sending' | 'sent' | 'failed';
  localId?: string; // ID tạm
}

// --- HELPER FUNCTIONS (Đệ quy) ---

// 1. Hàm tìm cha và chèn con vào
const insertReplyToTree = (list: CommentUI[], parentId: number, newReply: CommentUI): CommentUI[] => {
  return list.map(comment => {
    // Nếu tìm thấy cha
    if (comment.id === parentId) {
      return {
        ...comment,
        // Chèn vào đầu danh sách con, hoặc khởi tạo mảng nếu chưa có
        children_recursive: [newReply, ...(comment.children_recursive || [])]
      };
    }
    // Nếu chưa thấy, tìm tiếp trong con của nó
    if (comment.children_recursive && comment.children_recursive.length > 0) {
      return {
        ...comment,
        children_recursive: insertReplyToTree(comment.children_recursive, parentId, newReply)
      };
    }
    return comment;
  });
};

// 2. Hàm tìm comment (bất kể ở đâu) và cập nhật data (dùng cho update thành công hoặc báo lỗi)
const updateCommentInTree = (list: CommentUI[], localId: string, newData: Partial<CommentUI>): CommentUI[] => {
  return list.map(comment => {
    // Nếu tìm thấy comment cần update (so khớp localId)
    if (comment.localId === localId) {
      return { ...comment, ...newData };
    }
    
    // Nếu chưa thấy, tìm tiếp trong con
    if (comment.children_recursive && comment.children_recursive.length > 0) {
      return {
        ...comment,
        children_recursive: updateCommentInTree(comment.children_recursive, localId, newData)
      };
    }
    return comment;
  });
};

// 3. Hàm xóa comment lỗi khỏi cây
const removeCommentFromTree = (list: CommentUI[], localId: string): CommentUI[] => {
    return list
      .filter(c => c.localId !== localId) // Lọc ở cấp hiện tại
      .map(c => {
         if (c.children_recursive && c.children_recursive.length > 0) {
             return {
                 ...c,
                 children_recursive: removeCommentFromTree(c.children_recursive, localId)
             };
         }
         return c;
      });
};


export const usePostDetail = (postId: number) => {
  const [post, setPost] = useState<PostItem | null>(null);
  const [comments, setComments] = useState<CommentUI[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  const fetchPostDetail = useCallback(async () => {
    if (!postId) return;
    try {
      setLoading(true);
      setError(null);
      const [postResponse, commentsResponse] = await Promise.all([
        PostService.getPostById(postId),
        PostService.getComments(postId)
      ]);

      if (!postResponse) {
        setError('Không tìm thấy bài viết');
        return;
      }
      setPost(postResponse);
      // Gán status mặc định là sent cho comment tải từ server
      setComments(commentsResponse.data.map((c: Comment) => ({ ...c, status: 'sent' })));
    } catch (err: any) {
      setError('Có lỗi xảy ra khi tải bài viết');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  // --- ADD COMMENT (ROOT) ---
  const addComment = useCallback(async (content: string) => {
    if (!postId || !content.trim() || !user) return false;

    const tempId = `temp-${Date.now()}`;
    const optimisticComment: CommentUI = {
      id: -1,
      post_id: postId,
      content: content.trim(),
      parent_comment_id: null,
      created_at: new Date().toISOString(),
      reactions_count: 0,
      is_liked: false,
      user: user,
      children_recursive: [],
      status: 'sending',
      localId: tempId
    };

    setComments(prev => [optimisticComment, ...prev]);

    try {
      const response = await PostService.addComment(postId, content.trim());
      if (response) {
        // Update thành công
        setComments(prev => updateCommentInTree(prev, tempId, { ...response, status: 'sent' }));
        setPost(prev => prev ? { ...prev, comments_count: prev.comments_count + 1 } : null);
        return true;
      }
    } catch (err) {
      // Update thất bại
      setComments(prev => updateCommentInTree(prev, tempId, { status: 'failed' }));
      return false;
    }
    return false;
  }, [postId, user]);

  // --- REPLY COMMENT (NESTED) ---
  const replyComment = useCallback(async (parentCommentId: number, content: string) => {
    if (!postId || !content.trim() || !user) return false;

    const tempId = `reply-${Date.now()}`;
    const optimisticReply: CommentUI = {
      id: -1,
      post_id: postId,
      content: content.trim(),
      parent_comment_id: parentCommentId,
      created_at: new Date().toISOString(),
      reactions_count: 0,
      is_liked: false,
      user: user,
      children_recursive: [],
      status: 'sending',
      localId: tempId
    };

    // A. Hiển thị ngay lập tức (Optimistic UI)
    // Dùng hàm đệ quy để tìm cha và nhét con vào
    setComments(prev => insertReplyToTree(prev, parentCommentId, optimisticReply));

    try {
      // B. Gọi API
      const response = await PostService.replyComment(postId, parentCommentId, content.trim());
      
      if (response) {
        // C. Thành công: Tìm node tạm và update data thật
        // Lưu ý: response từ server có thể không có user object đầy đủ, nên ta merge response vào node cũ
        setComments(prev => updateCommentInTree(prev, tempId, { ...response, status: 'sent' }));
        
        // Tăng count comment
        setPost(prev => prev ? { ...prev, comments_count: prev.comments_count + 1 } : null);
        return true;
      }
    } catch (err: any) {
      console.error('Error replying comment:', err);
      // D. Thất bại: Đánh dấu failed
      setComments(prev => updateCommentInTree(prev, tempId, { status: 'failed' }));
      return false;
    }
    return false;
  }, [postId, user]);

  // --- RETRY COMMENT (Xử lý cả Root lẫn Reply) ---
  const retryComment = useCallback(async (failedComment: CommentUI) => {
    if (!failedComment.localId) return false;

    // 1. Chuyển trạng thái sang sending
    setComments(prev => updateCommentInTree(prev, failedComment.localId!, { status: 'sending' }));

    try {
      let response;
      // Kiểm tra xem là comment gốc hay reply để gọi API tương ứng
      if (failedComment.parent_comment_id) {
          response = await PostService.replyComment(postId, failedComment.parent_comment_id, failedComment.content);
      } else {
          response = await PostService.addComment(postId, failedComment.content);
      }

      if (response) {
        setComments(prev => updateCommentInTree(prev, failedComment.localId!, { ...response, status: 'sent' }));
        setPost(prev => prev ? { ...prev, comments_count: prev.comments_count + 1 } : null);
        return true;
      }
    } catch (err) {
      setComments(prev => updateCommentInTree(prev, failedComment.localId!, { status: 'failed' }));
      return false;
    }
    return false;
  }, [postId]);

  const removeFailedComment = useCallback((localId: string) => {
    // Dùng hàm đệ quy để xóa vì nó có thể nằm sâu bên trong
    setComments(prev => removeCommentFromTree(prev, localId));
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
    replyComment,
    retryComment,
    removeFailedComment,
    refresh: fetchPostDetail,
  };
};