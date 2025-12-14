import { type PostItem } from "@/models/post";
import { type User } from "@/models/user";
import { api } from "./api";

export const SearchService = {
    findPosts: async(keyword: string): Promise<PostItem[]> =>{
        const response = await api.get<any>(`posts?search=${keyword}`);
        return response.data || response;
    },
    
    findUsers:async(keyword: string): Promise<User[]> =>{
        const response = await api.get<any>(`users?search=${keyword}`);
        return response.data || response;
    },
}