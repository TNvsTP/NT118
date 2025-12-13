import { type User } from "./user";

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
  id: number;
  post_id: number;
  content: string;
  parent_comment_id: number | null;
  created_at: string;
  user: User;
  is_liked: boolean;
  reactions_count: number;
  children_recursive: Comment[];
}

export interface CommentsResponse {
  data: Comment[];
}
