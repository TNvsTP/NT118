import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ;
// || 'https://social-media-0nzo.onrender.com/api'
/**
 * Class này chịu trách nhiệm:
 * 1. Cấu hình chung (Base URL, Headers)
 * 2. Tự động gắn Token vào mỗi request
 * 3. Tự động xử lý lỗi 401 (Logout)
 */
class ApiClient {
  
  // Hàm xử lý logic chính (giống Interceptor trong Axios)
  private async request<T>(endpoint: string, config: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}/${endpoint}`;
    console.log(`[API Request] ${config.method || 'GET'} ${url}`);
    
    // 1. Lấy token từ SecureStore
    const token = await SecureStore.getItemAsync("access_token");
    
    // 2. Chuẩn bị Headers
    const headers: any = {
      'Content-Type': 'application/json',
      ...config.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const fetchConfig: RequestInit = {
      ...config,
      headers,
    };

    try {
      const response = await fetch(url, fetchConfig);

      // 3. Xử lý lỗi 401 (Unauthorized) - Global Error Handling
      if (response.status === 401) {
        console.warn('Token hết hạn hoặc không hợp lệ. Đang đăng xuất...');
        await SecureStore.deleteItemAsync("access_token");
        await SecureStore.deleteItemAsync("user_data");
        // Throw lỗi đặc biệt để UI có thể bắt được và navigate về Login
        throw new Error("UNAUTHORIZED"); 
      }

      if (!response.ok) {
        // Cố gắng đọc message lỗi từ server trả về
        const errorData = await response.json().catch(() => ({})); 
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Trả về dữ liệu JSON đã parse
      return await response.json();

    } catch (error: any) {
      // Log lỗi để debug
      console.error(`[API] ${config.method || 'GET'} ${endpoint} failed:`, error);
      throw error;
    }
  }

  // Các phương thức tiện ích (Helper methods)

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    let url = endpoint;
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      url = `${endpoint}?${queryString}`;
    }
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async patch<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH' });
  }
}

// Xuất ra một instance duy nhất (Singleton)
export const api = new ApiClient();