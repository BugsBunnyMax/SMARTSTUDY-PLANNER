const http = require('http');
const mongoose = require('mongoose');
const app = require('./src/app');
const { initializeSocket } = require('./src/socket');

const getMongoUri = () => {
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }
  return process.env.MONGODB_URI_LOCAL || 'mongodb://127.0.0.1:27017/smartstudy_planner';
};

const connectDB = async () => {
  const uri = getMongoUri();

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);

    if (uri !== 'mongodb://127.0.0.1:27017/smartstudy_planner') {
      console.warn('Falling back to local MongoDB at mongodb://127.0.0.1:27017/smartstudy_planner');
      try {
        await mongoose.connect('mongodb://127.0.0.1:27017/smartstudy_planner');
        console.log('MongoDB connected successfully using local fallback');
        return;
      } catch (fallbackError) {
        console.error('Local MongoDB fallback failed:', fallbackError);
      }
    }

    console.error('Please verify your MongoDB URI in backend/.env and ensure MongoDB is running.');
    process.exit(1);
  }
};

const PORT = parseInt(process.env.PORT || '5000', 10);

const startServer = (port) => {
  const server = http.createServer(app);
  initializeSocket(server);
  server.listen(port);

  server.on('listening', () => {
    console.log(`Server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      const nextPort = port + 1;
      console.warn(`Port ${port} already in use. Trying ${nextPort} instead...`);
      startServer(nextPort);
      return;
    }
    console.error('Server error:', error);
    process.exit(1);
  });
};

const start = async () => {
  await connectDB();
  startServer(PORT);
};

start().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

module.exports = app;
