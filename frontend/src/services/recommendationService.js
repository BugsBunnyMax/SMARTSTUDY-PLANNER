import api from './api';

const getRecommendations = async () => {
  const response = await api.get('/api/recommendations');
  return response.data;
};

const acceptRecommendation = async (recId) => {
  const response = await api.post(`/api/recommendations/${recId}/accept`);
  return response.data;
};

const rejectRecommendation = async (recId) => {
  const response = await api.post(`/api/recommendations/${recId}/reject`);
  return response.data;
};

const recommendationService = {
  getRecommendations,
  acceptRecommendation,
  rejectRecommendation,
};

export default recommendationService;
