import { type User } from "./user";

export interface Share{
    id: number;
    post_id: number;
    user_id: number;
    user: User;
}

export interface ShareResponse{
    data: Share[];
}