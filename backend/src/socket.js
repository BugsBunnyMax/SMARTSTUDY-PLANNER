const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

let io;

const getSocketRoom = (userId) => userId.toString();

const initializeSocket = (server) => {
  if (io) {
    return io;
  }

  io = new Server(server, {
    cors: {
      origin: [process.env.FRONTEND_URL || 'http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication token required')); 
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(payload.id).select('_id');
      if (!user) {
        return next(new Error('Invalid authentication token')); 
      }
      socket.userId = user._id.toString();
      socket.join(getSocketRoom(user._id));
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (user ${socket.userId})`);

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized');
  }
  return io;
};

module.exports = {
  initializeSocket,
  getIo,
  getSocketRoom,
};
