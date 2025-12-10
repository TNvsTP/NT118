import { api } from './api';
import { User } from './user';
// --- Interfaces (Định nghĩa kiểu dữ liệu trả về) ---

export interface Media {
  id: number;
  media_url: string;
}


export interface PostItem {
  id: number;
  content: string;
  user: User;
  media: Media[];
  reactions_count: number;
  comments_count: number;
  shares_count: number;
  created_at: Date;
  is_liked: boolean;
  is_shared: boolean;
  // ... các trường khác của post
}

export interface PostsResponse {
  data: PostItem[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: User; // Sử dụng User object thay vì author string
}

export interface CommentsResponse {
  data: Comment[];
}

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
  getPostById: async (id: string) => {
    const response = await api.get<any>(`posts/${id}`);
    return response.data || response;
  },

  /**
   * Lấy danh sách comment của bài viết
   */
  getComments: async (postId: string): Promise<CommentsResponse> => {
    const response = await api.get<any>(`posts/${postId}/comments`);
    return {
      data: response.data || response || []
    };
  },

  /**
   * Đăng comment mới
   */
  addComment: async (postId: string, content: string) => {
    const response = await api.post<any>(`posts/${postId}/comments`, { content });
    return response.data || response;
  },

  /**
   * Like/Unlike bài viết
   */
  toggleLike: async (postId: string) => {
    return api.post(`posts/${postId}/like`, {});
  }
};