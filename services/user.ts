
export interface User {
    id: number;
    name: string;
    avatarUrl?: string; // Dấu ? nếu có thể null
    email?: string;
    gender?: string;
}