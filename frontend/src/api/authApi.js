import axiosClient from './axiosClient';

export const authApi = {
  register: async (userData) => {
    // userData: { name, email, password, phone, address, role? }
    const response = await axiosClient.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    // credentials: { email, password }
    const response = await axiosClient.post('/auth/login', credentials);
    return response.data;
  },

  getMe: async () => {
    const response = await axiosClient.get('/auth/me');
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await axiosClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async ({ reset_token, new_password }) => {
    const response = await axiosClient.post('/auth/reset-password', {
      reset_token,
      new_password,
    });
    return response.data;
  },
};

export default authApi;
