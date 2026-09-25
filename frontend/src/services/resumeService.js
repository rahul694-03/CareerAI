import api from './api';

export const resumeService = {
  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/api/resume/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getMyResume: async () => {
    const response = await api.get('/api/resume/me');
    return response.data;
  },

  tailorResumeForJob: async (jobId) => {
    const response = await api.post(`/api/resume/tailor/${jobId}`);
    return response.data;
  },

  tailorResumeCustom: async (customData) => {
    const response = await api.post('/api/resume/tailor-custom', customData);
    return response.data;
  },
};

