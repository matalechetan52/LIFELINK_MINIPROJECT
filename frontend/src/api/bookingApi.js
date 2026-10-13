import axiosClient from './axiosClient';

export const bookingApi = {
  getAllBookings: async () => {
    const response = await axiosClient.get('/bookings');
    return response.data;
  },

  getBookingById: async (id) => {
    const response = await axiosClient.get(`/bookings/${id}`);
    return response.data;
  },

  createBooking: async ({ resource_id, user_id, start_time, end_time }) => {
    const response = await axiosClient.post('/bookings', {
      resource_id,
      user_id,
      start_time,
      end_time,
    });
    return response.data;
  },

  updateBooking: async (id, updateData) => {
    // updateData can contain start_time, end_time, status
    const response = await axiosClient.put(`/bookings/${id}`, updateData);
    return response.data;
  },

  cancelBooking: async (id) => {
    const response = await axiosClient.patch(`/bookings/${id}/cancel`);
    return response.data;
  },

  getResourceBookings: async (resourceId) => {
    const response = await axiosClient.get(`/resources/${resourceId}/bookings`);
    return response.data;
  },
};

export default bookingApi;
