import axios from 'axios';

const API_URL = 'http://localhost:5555/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// api.ts - update return types
export const authApi = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (fullName: string, email: string, password: string): Promise<{ user: User; token: string }> => {
    const response = await api.post('/auth/register', { fullName, email, password });
    return response.data;
  },
  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  resetPassword: async (token: string, password: string) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },
};

export const userApi = {
  getProfile: async () => {
    const response = await api.get('/user');
    return response.data;
  },
  updateProfile: async (userData: any) => {
    const response = await api.put('/user', userData);
    return response.data;
  },
  updatePassword: async (passwordData: any) => {
    const response = await api.put('/user/password', passwordData);
    return response.data;
  },
};