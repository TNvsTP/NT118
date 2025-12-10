import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';
import { Post } from './use-posts';

export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  avatar?: string;
}

export const usePostDetail = (postId: string) => {
  const [post, setPost] = useState<Post | null>(null);
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
        api.getPost(postId),
        api.getPostComments(postId)
      ]);

      if (!postResponse.data) {
        setError('Không tìm thấy bài viết');
        return;
      }

      setPost(postResponse.data);
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
      // Call API to add comment
      const response = await api.addComment(postId, content.trim());
      
      if (response.data) {
        setComments(prev => [...prev, response.data]);
        
        // Cập nhật số lượng comment trong post
        setPost(prev => prev ? { ...prev, comments: prev.comments + 1 } : null);
        
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