import { type User } from "./user";
export interface Conversation{
    id:number;
    created_at:Date;
    name: string | null;
    
    avatar_url: string | null;
    last_message_at: Date;
    participants: Participant[];
    last_message: Message | null;

}


export interface Participant{
    id: number;
    conversation_id: number;
    user_id: number;
    last_read_message_id: number;
    user: User;
}

export interface Message{
    id: number | string; // Cho phép temporary ID dạng string
    conversation_id: number;
    sender_id: number;
    content: string;
    created_at: Date;
    sender: User;
    // Thêm trạng thái cho optimistic updates
    status?: 'sending' | 'sent' | 'failed';
    tempId?: string; // ID tạm thời cho message đang gửi
}

export interface ConversationResponse {
    data: Conversation[];
}

export interface MessageResponse{
    conversation: Conversation; 
    messages: Message[];
    next_cursor?: string | null;

}