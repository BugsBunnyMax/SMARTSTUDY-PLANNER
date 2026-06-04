import api from './api';

const getTasks = async () => {
  const response = await api.get('/api/tasks');
  return response.data;
};

const createTask = async (payload) => {
  const response = await api.post('/api/tasks', payload);
  return response.data;
};

const getTask = async (taskId) => {
  const response = await api.get(`/api/tasks/${taskId}`);
  return response.data;
};

const updateTask = async (taskId, payload) => {
  const response = await api.put(`/api/tasks/${taskId}`, payload);
  return response.data;
};

const deleteTask = async (taskId) => {
  const response = await api.delete(`/api/tasks/${taskId}`);
  return response.data;
};

const taskService = {
  getTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
};

export default taskService;
