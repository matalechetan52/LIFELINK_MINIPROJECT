import axiosClient from './axiosClient';

export const paymentApi = {
  getUserPayments: async () => {
    const response = await axiosClient.get('/payments');
    return response.data;
  },

  createPayment: async ({ booking_id, amount, payment_method }) => {
    const response = await axiosClient.post('/payments', {
      booking_id,
      amount,
      payment_method,
    });
    return response.data;
  },

  getPaymentById: async (id) => {
    const response = await axiosClient.get(`/payments/${id}`);
    return response.data;
  },

  confirmPayment: async (id) => {
    const response = await axiosClient.post(`/payments/${id}/confirm`);
    return response.data;
  },
};

export default paymentApi;
