import axiosClient from './axiosClient';

export const reportApi = {
  getResourceReport: async () => {
    // OWNER or ADMIN
    const response = await axiosClient.get('/reports/resources');
    return response.data;
  },

  getBookingReport: async () => {
    // OWNER or ADMIN
    const response = await axiosClient.get('/reports/bookings');
    return response.data;
  },

  getQueueReport: async () => {
    // OWNER or ADMIN
    const response = await axiosClient.get('/reports/queue');
    return response.data;
  },

  getPaymentReport: async () => {
    // ADMIN only
    const response = await axiosClient.get('/reports/payments');
    return response.data;
  },
};

export default reportApi;
