import { type User } from '@/models/user';
import * as SecureStore from 'expo-secure-store';
import { api } from './api';
import { webSocketService } from './websocket';
// --- Interfaces ---
export interface LoginCredentials {
  email: string;
  password: string;
}



export interface AuthResponse {
  access_token: string;
  user: User;
}

// --- Service Class ---
export class AuthService {
  // 1. Dùng hằng số để tránh gõ sai key ở nhiều nơi (Best Practice)
  private static readonly TOKEN_KEY = 'access_token';
  private static readonly USER_KEY = 'user_data';

  /**
   * Đăng nhập
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log("đang login...");
      
      // api.post đã trả về data JSON, không cần .data nữa
      const authData = await api.post<any>('auth/login', credentials); // Endpoint thường là 'login', không cần '/auth/login' nếu BaseURL đã có /api
      console.log("auth:", authData.data);
      // Lưu token & user song song để tiết kiệm thời gian
      await Promise.all([
        SecureStore.setItemAsync(this.TOKEN_KEY, authData.access_token),
        SecureStore.setItemAsync(this.USER_KEY, JSON.stringify(authData.user))
      ]);
      await webSocketService.init();

      return authData;
    } catch (error: any) {
      // api.ts đã xử lý message lỗi chuẩn rồi, ném tiếp ra cho UI hiển thị
      throw error; 
    }
  }

  /**
   * Đăng ký (Thường AuthService phải có cả hàm này)
   */
  static async register(data: any): Promise<AuthResponse> {
    const authData = await api.post<AuthResponse>('auth/register', data);
    
    // Auto login sau khi register thành công
    await Promise.all([
      SecureStore.setItemAsync(this.TOKEN_KEY, authData.access_token),
      SecureStore.setItemAsync(this.USER_KEY, JSON.stringify(authData.user))
    ]);
    
    return authData;
  }

  /**
   * Đăng xuất
   */
  static async logout(): Promise<void> {
    try {
      await api.post('logout', {});
    } catch (error) {
      console.warn('Logout API failed, but clearing local data anyway.');
    } finally {
      // Luôn xóa dữ liệu dù API lỗi hay không
      await Promise.all([
        SecureStore.deleteItemAsync(this.TOKEN_KEY),
        SecureStore.deleteItemAsync(this.USER_KEY)
      ]);
    }
  }

  // --- Helper Methods (Rất hữu ích) ---

  static async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(this.TOKEN_KEY);
  }

  static async getUser(): Promise<any | null> {
    try {
      const userData = await SecureStore.getItemAsync(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  /**
   * Kiểm tra nhanh xem user đã đăng nhập chưa (dựa vào token local)
   */
  static async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }
}