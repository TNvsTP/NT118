import { User } from '@/models/user';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthService, LoginCredentials } from '../services/auth'; // Import đúng đường dẫn service của bạn
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: any) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
}

// 1. Tạo Context
const AuthContext = createContext<AuthContextType | null>(null);

// 2. Tạo Provider (Nơi chứa State thực sự)
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authenticated = await AuthService.isAuthenticated();
      if (authenticated) {
        const userData = await AuthService.getUser();
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        // Đảm bảo clear nếu không auth
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const authData = await AuthService.login(credentials);
      // Cập nhật State Global ngay lập tức
      setUser(authData.user);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await AuthService.register(data);
      return { success: true, message: response.message || 'Đăng ký thành công!' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Đăng ký thất bại!' };
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AuthService.logout();
      // Clear State Global
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Export hook useAuth để các component khác dùng
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}