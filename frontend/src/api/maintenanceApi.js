import axiosClient from './axiosClient';

export const maintenanceApi = {
  getAllMaintenance: async () => {
    const response = await axiosClient.get('/maintenance');
    return response.data;
  },

  getMaintenanceById: async (id) => {
    const response = await axiosClient.get(`/maintenance/${id}`);
    return response.data;
  },

  createMaintenance: async ({ resource_id, start_date, end_date, reason }) => {
    const response = await axiosClient.post('/maintenance', {
      resource_id,
      start_date,
      end_date,
      reason,
    });
    return response.data;
  },

  updateMaintenance: async (id, { start_date, end_date, reason, status }) => {
    const response = await axiosClient.put(`/maintenance/${id}`, {
      start_date,
      end_date,
      reason,
      status,
    });
    return response.data;
  },

  deleteMaintenance: async (id) => {
    const response = await axiosClient.delete(`/maintenance/${id}`);
    return response.data;
  },
};

export default maintenanceApi;
