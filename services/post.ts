import { type CommentsResponse, type PostItem, type PostsResponse } from '@/models/post';
import { type ReactionResponse } from '@/models/reaction';
import { type ShareResponse } from '@/models/share';
import { api } from './api';


// --- Service Logic ---

export const PostService = {

  /**
   * Lấy danh sách bài viết (có phân trang)
   */
  getPosts: async (cursor?: string, limit: number = 20): Promise<PostsResponse> => {
    const params: Record<string, string> = {
      limit: limit.toString(),
    };
    if (cursor) params.cursor = cursor;

    // Gọi API
    const response = await api.get<any>('posts', params);

    // --- KHẮC PHỤC LỖI TẠI ĐÂY ---
    // API trả về: { data: [...], next_cursor: "...", path: "..." }

    const nextCursor = response.next_cursor; // Lấy đúng field snake_case từ API

    return {
      data: response.data || [],
      nextCursor: nextCursor,
      // Logic: Nếu có next_cursor (không null) nghĩa là còn trang sau -> hasMore = true
      hasMore: !!nextCursor
    };
  },

  /**
   * Lấy chi tiết 1 bài viết
   */
  getPostById: async (id: number): Promise<PostItem> => {
    const response = await api.get<PostItem>(`posts/${id}`);
    return response;
  },

  /**
   * Lấy danh sách comment của bài viết
   */
  getComments: async (postId: number): Promise<CommentsResponse> => {
    const response = await api.get<any>(`posts/${postId}/comments`);
    return {
      data: response.data || response || []
    };
  },

  /**
   * Đăng comment mới
   */
  addComment: async (postId: number, content: string): Promise<Comment> => {
    const response = await api.post<Comment>(`posts/${postId}/comments`, { content });
    return response;
  },

  replyComment: async (postId: number, commentId: number, content: string): Promise<Comment> => {
    const response = await api.post<Comment>(
      `posts/${postId}/comments/${commentId}/replies`,
      { content }
    );
    return response;
  },

  /**
   * Like/Unlike bài viết
   */
  toggleReaction: async (postId: number) => {
    return api.post<any>(`posts/${postId}/reaction`, {});
  },

  getReactions: async (postId: number): Promise<ReactionResponse> => {
    return api.get<any>(`posts/${postId}/reactions`);
  },

  // Share/Unshare bài viết
   toggleShare: async (postId: number) => {
    return api.post<any>(`posts/${postId}/share`, {});
  },

  getShares: async (postId: number): Promise<ShareResponse> => {
    return api.get<any>(`posts/${postId}/shares`);
  },
};