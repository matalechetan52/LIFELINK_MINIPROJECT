import axiosClient from './axiosClient';

export const resourcePassportApi = {
  getResourceHistory: async (resourceId) => {
    const response = await axiosClient.get(`/resources/${resourceId}/history`);
    return response.data;
  },

  getResourcePassport: async (resourceId) => {
    const response = await axiosClient.get(`/resources/${resourceId}/passport`);
    return response.data;
  },

  getPassportBookings: async (resourceId) => {
    const response = await axiosClient.get(`/resources/${resourceId}/passport/bookings`);
    return response.data;
  },

  getPassportMaintenance: async (resourceId) => {
    const response = await axiosClient.get(`/resources/${resourceId}/passport/maintenance`);
    return response.data;
  },

  getPassportReviews: async (resourceId) => {
    const response = await axiosClient.get(`/resources/${resourceId}/passport/reviews`);
    return response.data;
  },
};

export default resourcePassportApi;
