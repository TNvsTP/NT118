import { type CommentsResponse, type PostItem, type PostsResponse } from '@/models/post';
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

    // Chuyển đổi media_urls thành media array cho tất cả posts
    const posts = (response.data || []).map((post: any) => {
      if (post.media_urls && !post.media) {
        post.media = post.media_urls.map((url: string, index: number) => ({
          id: index + 1,
          media_url: url
        }));
      }
      return post;
    });

    return {
      data: posts,
      nextCursor: nextCursor,
      // Logic: Nếu có next_cursor (không null) nghĩa là còn trang sau -> hasMore = true
      hasMore: !!nextCursor
    };
  },

  addPost: async(content: string, media_url: string[]) : Promise<PostItem> => {
    // console.log("add new post:", content, media_urls);
    const response = await api.post<any>("posts", {content:content, media_url: media_url});
    const postData = response.data || response;
    
    // Chuyển đổi media_urls thành media array nếu cần
    if (postData.media_url && !postData.media) {
      postData.media = postData.media_url.map((url: string, index: number) => ({
        id: index + 1,
        media_url: url
      }));
    }
    
    return postData;
  },

  /**
   * Lấy chi tiết 1 bài viết
   */
  getPostById: async (id: number): Promise<PostItem> => {
    const response = await api.get<any>(`posts/${id}`);
    
    // Chuyển đổi media_urls thành media array nếu cần
    if (response.media_urls && !response.media) {
      response.media = response.media_urls.map((url: string, index: number) => ({
        id: index + 1,
        media_url: url
      }));
    }
    
    return response;
  },

  editPost: async (postId: number, content: string, media_url: string[]) : Promise<PostItem> => {
    const response = await api.put<any>(`posts/${postId}`, {content: content, media_url: media_url});
    const postData = response.post || response;
    
    // Chuyển đổi media_urls thành media array nếu cần
    if (postData.media_url && !postData.media) {
      postData.media = postData.media_url.map((url: string, index: number) => ({
        id: index + 1,
        media_url: url
      }));
    }
    
    return postData;
  },

  deletePost: async (postId: number) => {
    const response = await api.delete<any>(`posts/${postId}`);
    return response.data || response;
  },

  reportPost: async (postId: number, reason: string) =>{
    const response = await api.post<any>(`posts/${postId}/report`,{reason: reason});
    return response.data || response;
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
    return await api.post<any>(`posts/${postId}/reaction`, {});
  },

  getReactions: async (postId: number): Promise<any> => {
    return await api.get<any>(`posts/${postId}/reactions`);
  },

  // Share/Unshare bài viết
   toggleShare: async (postId: number) => {
    return await api.post<any>(`posts/${postId}/share`, {});
  },

  getShares: async (postId: number): Promise<any> => {
    return await api.get<any>(`posts/${postId}/shares`);
  },
};