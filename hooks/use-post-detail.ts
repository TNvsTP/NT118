import { PostService, type Comment, type PostItem } from '@/services/post';
import { useCallback, useEffect, useState } from 'react';



export const usePostDetail = (postId: string) => {
  const [post, setPost] = useState<PostItem | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setComments(commentsResponse.data);
    } catch (err: any) {
      setError('Có lỗi xảy ra khi tải bài viết');
      console.error('Error fetching post detail:', err);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const addComment = useCallback(async (content: string) => {
    if (!postId || !content.trim()) return false;

    try {
      const response = await PostService.addComment(postId, content.trim());
      
      if (response.data) {
        // Đảm bảo response.data trả về cấu trúc Comment khớp với interface trên
        setComments(prev => [...prev, response.data]);
        
        setPost(prev => prev ? { ...prev, comments_count: prev.comments_count + 1 } : null);
        
        return true;
      }
      
      return false;
    } catch (err: any) {
      console.error('Error adding comment:', err);
      return false;
    }
  }, [postId]);

  useEffect(() => {
    fetchPostDetail();
  }, [fetchPostDetail]);

  return {
    post,
    comments,
    loading,
    error,
    addComment,
    refresh: fetchPostDetail,
  };
};