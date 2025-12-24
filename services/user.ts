import { type Friendship } from "@/models/friendship";
import { type PostItem } from "@/models/post";
import { type User } from "@/models/user";
import { api } from "./api";
export const UserService = {

    getUser: async (userId: number): Promise<User> => {
        const response = await api.get<any>(`users/${userId}`);
        console.log(response);
        return  response.user || response;
    },

    getFriends: async (userId: number): Promise<Friendship[]> => {
        const response = await api.get<any>(`friendship/${userId}`);

        // Kiểm tra cấu trúc response và truy cập đúng path
        const friendsList = response.data?.friends || response.friends || response.data || [];
        
        return friendsList.map((item: any) => ({
            id: item.pivot.id,
            user: {
                id: item.id,
                name: item.name || '',
                avatarUrl: item.avatarUrl,
                email: item.email,
                gender: item.gender,
                role: item.role || 'user',
                // Chuyển đổi string sang Date object
                disable_at: item.disable_at ? new Date(item.disable_at) : null,
                is_Violated: item.is_Violated || false,
                friend_status: null
            },
            // Sử dụng relationship_with_viewer từ API
            relationship_with_viewer: item.relationship_with_viewer
        }));
    },

    addFriend: async (userId: number): Promise<any> => {
        const response = await api.post(`friendships`, { addressee_id: userId });
        return response;
    },

    acceptFriend: async (friendshipId: number): Promise<any> => {
        console.log(friendshipId);
        const response = await api.patch<any>(`friendships/${friendshipId}`);
        return response;
    },

    deleteFriend: async (friendshipId: number): Promise<any> => {
        const response = await api.delete<any>(`friendships/${friendshipId}`);
        return response;
    },

    getProfilePosts: async(userId: number) : Promise<PostItem[]> => {
        const response = await api.get<any>(`users/${userId}/posts`);
        return response.data || response;
    },

    updateProfile: async (name: string, gender: string): Promise<any> => {
    // Thêm gender vào body của request
    const response = await api.post<any>(`userProfile`, { 
        name: name, 
        gender: gender,
    });
    return response.data;
},

    // Helper function để tìm friendship ID từ user ID
    getFriendshipId: async (currentUserId: number, targetUserId: number): Promise<number | null> => {
        try {
            const friends = await UserService.getFriends(currentUserId);
            const friendship = friends.find(f => f.user.id === targetUserId);
            return friendship ? friendship.id : null;
        } catch (error) {
            console.error('Error finding friendship ID:', error);
            return null;
        }
    }

}