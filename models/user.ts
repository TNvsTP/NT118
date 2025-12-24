
export interface User {
    id: number;
    name: string;
    avatarUrl?: string; // Dấu ? nếu có thể null
    email?: string;
    gender?: 'male' | 'female' | null;
    role: "user" | "admin";
    disable_at: Date | null;
    is_Violated: boolean;
    friend_status: 'friends' | 'outgoing_request' | 'ingoing_request' | null;
}