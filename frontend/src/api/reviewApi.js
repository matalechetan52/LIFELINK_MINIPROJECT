import axiosClient from './axiosClient';

export const reviewApi = {
  getResourceReviews: async (resourceId) => {
    const response = await axiosClient.get(`/resources/${resourceId}/reviews`);
    return response.data;
  },

  createReview: async ({ resource_id, booking_id, rating, comment }) => {
    const response = await axiosClient.post('/reviews', {
      resource_id,
      booking_id,
      rating,
      comment,
    });
    return response.data;
  },

  getReviewById: async (id) => {
    const response = await axiosClient.get(`/reviews/${id}`);
    return response.data;
  },

  updateReview: async (id, { rating, comment }) => {
    const response = await axiosClient.put(`/reviews/${id}`, {
      rating,
      comment,
    });
    return response.data;
  },

  deleteReview: async (id) => {
    const response = await axiosClient.delete(`/reviews/${id}`);
    return response.data;
  },
};

export default reviewApi;
