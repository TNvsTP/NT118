
export interface User {
    id: number;
    name: string;
    avatarUrl?: string; // Dấu ? nếu có thể null
    email?: string;
    gender?: string;
    role: "user" | "admin";
    disable_at: Date | null;
    is_Violated: boolean;
}