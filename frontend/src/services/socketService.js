import { io } from 'socket.io-client';

let socket;

const getSocketUrl = () => process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const connectSocket = () => {
  if (socket && socket.connected) {
    return socket;
  }

  const token = localStorage.getItem('smartstudy_token');
  socket = io(getSocketUrl(), {
    auth: {
      token,
    },
    transports: ['websocket'],
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message || error);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
