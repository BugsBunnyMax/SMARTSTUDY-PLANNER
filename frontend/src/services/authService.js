import api from './api';

const register = async (payload) => {
  const response = await api.post('/api/auth/register', payload);
  return response.data;
};

const login = async (payload) => {
  const response = await api.post('/api/auth/login', payload);
  return response.data;
};

const getProfile = async () => {
  const response = await api.get('/api/auth/profile');
  return response.data;
};

const updateProfile = async (payload) => {
  const response = await api.put('/api/auth/profile', payload);
  return response.data;
};

const authService = {
  register,
  login,
  getProfile,
  updateProfile,
};

export default authService;
