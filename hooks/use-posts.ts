import { type PostItem } from '@/models/post';
import { PostService } from '@/services/post';
import { useCallback, useEffect, useState } from 'react';
import { usePostInteractions } from './use-post-interactions';


export const usePosts = () => {
    const [initialPosts, setInitialPosts] = useState<PostItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [nextCursor, setNextCursor] = useState<string | undefined>();
    const [error, setError] = useState<string | null>(null);

    const { posts, updatePostReaction, updatePostShare, updatePosts, updatePost, removePost } = usePostInteractions(initialPosts);

    const fetchPosts = useCallback(async (cursor?: string, isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else if (cursor) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        setError(null);

        // Call API to get posts
        const data = await PostService.getPosts(cursor);

        if (isRefresh || !cursor) {
          // Load lần đầu hoặc refresh - thay thế toàn bộ
          setInitialPosts(data.data);
          updatePosts(data.data);
        } else {
          // Load more - thêm vào cuối danh sách hiện tại
          setInitialPosts(prevPosts => {
            const newPosts = [...prevPosts, ...data.data];
            updatePosts(newPosts);
            return newPosts;
          });
        }

        setNextCursor(data.nextCursor);
        setHasMore(data.hasMore);
      } catch (err: any) {
        setError('Có lỗi xảy ra khi tải posts');
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    }, [updatePosts]);

    const loadMore = useCallback(() => {
      if (!loadingMore && hasMore && nextCursor) {
        fetchPosts(nextCursor);
      }
    }, [fetchPosts, loadingMore, hasMore, nextCursor]);

    const refresh = useCallback(() => {
      fetchPosts(undefined, true);
    }, [fetchPosts]);

    useEffect(() => {
      fetchPosts();
    }, []);

    return {
      posts,
      loading,
      refreshing,
      loadingMore,
      hasMore,
      error,
      loadMore,
      refresh,
      updatePostReaction,
      updatePostShare,
      updatePost,
      removePost,
    };
  };