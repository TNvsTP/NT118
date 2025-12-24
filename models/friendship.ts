import { User } from "./user";

export interface Friendship{
    user: User;
    relationship_with_viewer: 'accepted' | 'pending' | null;
}