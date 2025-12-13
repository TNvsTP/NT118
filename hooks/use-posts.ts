import { type PostItem } from '@/models/post';
import { PostService } from '@/services/post';
import { useCallback, useEffect, useState } from 'react';


  export const usePosts = () => {
    const [posts, setPosts] = useState<PostItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [nextCursor, setNextCursor] = useState<string | undefined>();
    const [error, setError] = useState<string | null>(null);

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
          setPosts(data.data);
        } else {
          setPosts(prev => [...prev, ...data.data]);
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
    }, []);

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
    }, [fetchPosts]);

    return {
      posts,
      loading,
      refreshing,
      loadingMore,
      hasMore,
      error,
      loadMore,
      refresh,
    };
  };