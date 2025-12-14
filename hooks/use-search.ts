import { PostItem } from '@/models/post';
import { User } from '@/models/user';
import { SearchService } from '@/services/search';
import { useCallback, useState } from 'react';

export type FilterType = 'all' | 'users' | 'posts';

export interface SearchResults {
  posts: PostItem[];
  users: User[];
}

export const useSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResults>({ 
    posts: [], 
    users: [] 
  });
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery;
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      const [posts, users] = await Promise.all([
        SearchService.findPosts(searchTerm.trim()),
        SearchService.findUsers(searchTerm.trim())
      ]);
      
      setSearchResults({ posts, users });
      setHasSearched(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults({ posts: [], users: [] });
    } finally {
      setIsSearching(false);
    }
  };

  const getFilteredResults = (): SearchResults => {
    switch (activeFilter) {
      case 'users':
        return { posts: [], users: searchResults.users };
      case 'posts':
        return { posts: searchResults.posts, users: [] };
      default:
        return searchResults;
    }
  };

  const getTotalCount = () => {
    return searchResults.posts.length + searchResults.users.length;
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults({ posts: [], users: [] });
    setHasSearched(false);
    setActiveFilter('all');
  };

  const updatePostReaction = useCallback((postId: number, newState: boolean) => {
    setSearchResults(prevResults => ({
      ...prevResults,
      posts: prevResults.posts.map(post => 
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
    }));
  }, []);

  const updatePostShare = useCallback((postId: number, newState: boolean) => {
    setSearchResults(prevResults => ({
      ...prevResults,
      posts: prevResults.posts.map(post => 
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
    }));
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    hasSearched,
    activeFilter,
    setActiveFilter,
    handleSearch,
    getFilteredResults,
    getTotalCount,
    clearSearch,
    updatePostReaction,
    updatePostShare,
  };
};