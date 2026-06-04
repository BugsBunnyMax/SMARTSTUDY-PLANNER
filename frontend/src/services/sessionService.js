import api from './api';

const getSessions = async () => {
  const response = await api.get('/api/sessions');
  return response.data;
};

const createSession = async (payload) => {
  const response = await api.post('/api/sessions', payload);
  return response.data;
};

const updateSession = async (sessionId, payload) => {
  const response = await api.put(`/api/sessions/${sessionId}`, payload);
  return response.data;
};

const deleteSession = async (sessionId) => {
  const response = await api.delete(`/api/sessions/${sessionId}`);
  return response.data;
};

const sessionService = {
  getSessions,
  createSession,
  updateSession,
  deleteSession,
};

export default sessionService;
