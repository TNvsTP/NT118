import { api } from "./api";

import { type ConversationResponse, type Message, type MessageResponse } from "@/models/message";

export const MessageService = {

    getConversations: async (): Promise<ConversationResponse> => {
        const response = await api.get<ConversationResponse>("conversations");
        return response;
    },

    getMessages: async (conversationId: number): Promise<MessageResponse> => {
        const response = await api.get<any>(`conversations/${conversationId}/messages`);
        return {
            conversation: response.conversation,
            messages: response.messages.data,
        };
    },

    addMessage: async (conversationId: number, content: string): Promise<Message> => {
        const response = await api.post<Message>(`conversations/${conversationId}/messages`, { content });
        return response;
    },
}