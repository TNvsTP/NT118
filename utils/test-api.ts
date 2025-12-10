import { api } from '../services/api';

export async function testApiConnection(): Promise<boolean> {
  try {
    // Test với endpoint health check hoặc endpoint đơn giản
    const response = await api.get('/health');
    return response.status === 200;
  } catch (error) {
    console.error('API connection test failed:', error);
    return false;
  }
}

export async function testLogin(email: string, password: string) {
  try {
    const response = await api.post('/auth/login', { email, password });
    console.log('Login test response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Login test failed:', error.response?.data || error.message);
    throw error;
  }
}