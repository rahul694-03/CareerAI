import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Single-flight warmup promise to wake up sleeping cloud instances (Render free tier)
let warmUpPromise = null;
export const warmUpBackend = () => {
  if (!warmUpPromise) {
    warmUpPromise = api.get('/api/jobs/providers/status').catch(() => null);
  }
  return warmUpPromise;
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('careerai_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('careerai_token');
      localStorage.removeItem('careerai_user');
      // Only redirect if not already on an auth page
      if (
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/signup' &&
        window.location.pathname !== '/'
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
