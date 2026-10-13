import axiosClient from './axiosClient';

export const queueApi = {
  joinQueue: async ({ resource_id, user_id, requested_start, requested_end }) => {
    const response = await axiosClient.post('/queues', {
      resource_id,
      user_id,
      requested_start,
      requested_end,
    });
    return response.data;
  },

  getAllQueues: async () => {
    const response = await axiosClient.get('/queues');
    return response.data;
  },

  getQueueById: async (id) => {
    const response = await axiosClient.get(`/queues/${id}`);
    return response.data;
  },

  cancelQueue: async (id) => {
    const response = await axiosClient.patch(`/queues/${id}/cancel`);
    return response.data;
  },

  getResourceQueue: async (resourceId) => {
    const response = await axiosClient.get(`/resources/${resourceId}/queue`);
    return response.data;
  },

  convertQueueToBooking: async (id) => {
    // ADMIN only
    const response = await axiosClient.post(`/queues/${id}/convert`);
    return response.data;
  },
};

export default queueApi;
