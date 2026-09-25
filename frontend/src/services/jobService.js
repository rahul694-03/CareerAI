import api from './api';

export const jobService = {
  /**
   * Search jobs with pagination and multi-criteria filters
   */
  getJobs: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.keyword) queryParams.append('keyword', params.keyword);
    if (params.location) queryParams.append('location', params.location);
    if (params.category && params.category !== 'ALL') queryParams.append('category', params.category);
    if (params.academicYear && params.academicYear !== 'ALL') queryParams.append('academicYear', params.academicYear);
    if (params.graduationYear) queryParams.append('graduationYear', params.graduationYear);
    if (params.employmentType && params.employmentType !== 'ALL') queryParams.append('employmentType', params.employmentType);
    if (params.experienceLevel && params.experienceLevel !== 'ALL') queryParams.append('experienceLevel', params.experienceLevel);
    if (params.remoteType && params.remoteType !== 'ALL') queryParams.append('remoteType', params.remoteType);
    if (params.company) queryParams.append('company', params.company);
    if (params.salary) queryParams.append('salary', params.salary);
    if (params.source && params.source !== 'ALL') queryParams.append('source', params.source);
    if (params.page !== undefined) queryParams.append('page', params.page);
    if (params.size !== undefined) queryParams.append('size', params.size);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.direction) queryParams.append('direction', params.direction);

    const response = await api.get(`/api/jobs?${queryParams.toString()}`);
    return response.data;
  },

  /**
   * Legacy get all active jobs
   */
  getAllActiveJobs: async () => {
    const response = await api.get('/api/jobs?size=50');
    return response.data;
  },

  /**
   * Get single job details by ID
   */
  getJobById: async (id) => {
    const response = await api.get(`/api/jobs/${id}`);
    return response.data;
  },

  /**
   * Get personalized matching jobs for authenticated user with resume breakdown
   */
  getMatchedJobs: async () => {
    const response = await api.get('/api/jobs/matched');
    return response.data;
  },

  /**
   * Get developer & admin health/status for all job providers
   */
  getProviderStatus: async () => {
    const response = await api.get('/api/jobs/providers/status');
    return response.data;
  },

  /**
   * Manual trigger for job synchronization
   */
  triggerSync: async () => {
    const response = await api.post('/api/jobs/sync');
    return response.data;
  },
};
