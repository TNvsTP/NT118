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
    setPosts(newPosts);
  }, []);

  return {
    posts,
    updatePostReaction,
    updatePostShare,
    updatePosts
  };
};