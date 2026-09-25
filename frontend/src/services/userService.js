import api from './api';

export const userService = {
  async getMe() {
    const response = await api.get('/api/users/me');
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await api.put('/api/users/me', profileData);
    return response.data;
  },
};
