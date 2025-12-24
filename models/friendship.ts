import { User } from "./user";

export interface Friendship{
    id: number;
    user: User;
    relationship_with_viewer: 'accepted' | 'pending' | null;
}