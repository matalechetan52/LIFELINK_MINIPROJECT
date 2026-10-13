import axiosClient from './axiosClient';

export const resourceApi = {
  getResources: async () => {
    const response = await axiosClient.get('/resources');
    return response.data;
  },

  getResourceById: async (id) => {
    const response = await axiosClient.get(`/resources/${id}`);
    return response.data;
  },

  createResource: async (resourceData) => {
    // { owner_id, category_id, name, description, location, price_per_hour }
    const response = await axiosClient.post('/resources', resourceData);
    return response.data;
  },

  updateResource: async (id, resourceData) => {
    const response = await axiosClient.put(`/resources/${id}`, resourceData);
    return response.data;
  },

  deleteResource: async (id) => {
    const response = await axiosClient.delete(`/resources/${id}`);
    return response.data;
  },
};

export default resourceApi;
