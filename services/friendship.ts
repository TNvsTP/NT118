import { User } from "@/models/user";
import { api } from "./api";

export const FriendService = {
    getFriends: async (userId: number): Promise<User[]> => {
        const response = await api.get<any>(`friendship/${userId}`);
        return response.friends || response.data || response;
    },
}
