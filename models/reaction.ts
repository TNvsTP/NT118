import { type User } from "./user";

export interface Reaction{
    id: number;
    post_id: number;
    user_id: number;
    user: User;
}

export interface ReactionResponse{
    data: Reaction[];
}