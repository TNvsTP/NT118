import { type PostItem } from '@/models/post';
import { useCallback, useEffect, useState } from 'react';

export const usePostInteractions = (initialPosts: PostItem[]) => {
  const [posts, setPosts] = useState<PostItem[]>(initialPosts);

  // Đồng bộ posts khi initialPosts thay đổi
  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  const updatePostReaction = useCallback((postId: number, newState: boolean) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? {
              ...post,
              is_liked: newState,
              reactions_count: newState 
                ? post.reactions_count + 1 
                : Math.max(0, post.reactions_count - 1)
            }
          : post
      )
    );
  }, []);

  const updatePostShare = useCallback((postId: number, newState: boolean) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? {
              ...post,
              is_shared: newState,
              shares_count: newState 
                ? post.shares_count + 1 
                : Math.max(0, post.shares_count - 1)
            }
          : post
      )
    );
  }, []);

  const updatePosts = useCallback((newPosts: PostItem[]) => {
    // Đảm bảo không có duplicate posts dựa trên ID
    const uniquePosts = newPosts.filter((post, index, self) => 
      index === self.findIndex(p => p.id === post.id)
    );
    setPosts(uniquePosts);
  }, []);

  const updatePost = useCallback((updatedPost: PostItem) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === updatedPost.id ? updatedPost : post
      )
    );
  }, []);

  const removePost = useCallback((postId: number) => {
    setPosts(prevPosts => 
      prevPosts.filter(post => post.id !== postId)
    );
  }, []);

  return {
    posts,
    updatePostReaction,
    updatePostShare,
    updatePosts,
    updatePost,
    removePost
  };
};