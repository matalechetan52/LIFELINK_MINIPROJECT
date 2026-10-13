import axiosClient from './axiosClient';

export const notificationApi = {
  getNotifications: async () => {
    const response = await axiosClient.get('/notifications');
    return response.data;
  },

  createNotification: async ({ user_id, type, message }) => {
    // ADMIN only
    const response = await axiosClient.post('/notifications', {
      user_id,
      type,
      message,
    });
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await axiosClient.patch(`/notifications/${id}/read`);
    return response.data;
  },
};

export default notificationApi;
