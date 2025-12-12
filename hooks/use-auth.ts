import { User } from '@/services/user';
import { useEffect, useState } from 'react';
import { AuthService } from '../services/auth';


export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authenticated = await AuthService.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        const userData = await AuthService.getUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const authData = await AuthService.login({ email, password });
      setIsAuthenticated(true);
      setUser(authData.user);
      return authData;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
    checkAuthStatus,
  };
}