import axiosClient from './axiosClient';

export const availabilityApi = {
  // General availability or period availability if start and end are provided
  getResourceAvailability: async (resourceId, start = null, end = null) => {
    const params = {};
    if (start && end) {
      params.start = start;
      params.end = end;
    }
    const response = await axiosClient.get(`/resources/${resourceId}/availability`, { params });
    return response.data;
  },

  // Predicts next available window when requested start/end has conflict
  getNextAvailable: async (resourceId, start, end) => {
    const response = await axiosClient.get(`/resources/${resourceId}/next-available`, {
      params: { start, end },
    });
    return response.data;
  },

  // Helper alias for conflicts: backend returns booking_conflicts & maintenance_conflicts in period availability
  getConflicts: async (resourceId, start, end) => {
    const data = await availabilityApi.getResourceAvailability(resourceId, start, end);
    return {
      success: data.success,
      available: data.data?.available,
      reason: data.data?.reason,
      booking_conflicts: data.data?.booking_conflicts || [],
      maintenance_conflicts: data.data?.maintenance_conflicts || [],
    };
  },
};

export default availabilityApi;
