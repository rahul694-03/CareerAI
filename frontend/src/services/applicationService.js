import api from './api';

export const applicationService = {
  applyToJob: async (jobId, platform = 'Direct Portal') => {
    const response = await api.post(`/api/applications/apply/${jobId}?platform=${encodeURIComponent(platform)}`);
    return response.data;
  },

  getUserApplications: async () => {
    const response = await api.get('/api/applications');
    return response.data;
  },

  getAppliedJobIds: async () => {
    const response = await api.get('/api/applications/applied-job-ids');
    return response.data;
  },

  getApplicationCount: async () => {
    const response = await api.get('/api/applications/count');
    return response.data;
  },
};
