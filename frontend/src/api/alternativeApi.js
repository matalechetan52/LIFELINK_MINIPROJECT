import axiosClient from './axiosClient';

export const alternativeApi = {
  getAlternativesForResource: async (resourceId, startTime, endTime) => {
    const response = await axiosClient.get(`/alternatives/resources/${resourceId}`, {
      params: {
        start_time: startTime,
        end_time: endTime,
      },
    });
    return response.data;
  },

  searchAlternatives: async ({ category_id, location, start_time, end_time, max_price }) => {
    const params = {};
    if (category_id) params.category_id = category_id;
    if (location) params.location = location;
    if (start_time && end_time) {
      params.start_time = start_time;
      params.end_time = end_time;
    }
    if (max_price !== undefined && max_price !== null && max_price !== '') {
      params.max_price = max_price;
    }
    const response = await axiosClient.get('/alternatives/search', { params });
    return response.data;
  },
};

export default alternativeApi;
