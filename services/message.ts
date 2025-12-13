import { api } from "./api";

import { type ConversationResponse, type Message, type MessageResponse } from "@/models/message";

export const MessageService = {

    getConversations: async (): Promise<any> => {
        const response = await api.get<ConversationResponse>("conversations");
        
        return response;
    },

    getMessages: async (conversationId: number, cursor?: string): Promise<MessageResponse> => {
        const params = cursor ? `?cursor=${cursor}` : '';
        const response = await api.get<any>(`conversations/${conversationId}/messages${params}`);
        return {
            conversation: response.conversation,
            messages: response.messages.data,
            next_cursor: response.messages.next_cursor,
        };
    },

    addMessage: async (conversationId: number, content: string): Promise<Message> => {
        const response = await api.post<Message>(`conversations/${conversationId}/messages`, { content });
        return response;
    },
}