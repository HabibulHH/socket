const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');
const SocketHandler = require('./socket-handler');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST"]
  },
  path: process.env.SOCKET_PATH
});

// Add Redis adapter configuration
const pubClient = createClient({
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT || 6379
});
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(pubClient, subClient));
  console.log('Redis adapter connected');
}).catch(err => {
  console.error('Redis adapter error:', err);
});

const port = process.env.PORT || 3000;

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Initialize socket handler
const socketHandler = new SocketHandler(io);
socketHandler.initialize();

server.listen(port, () => {
  console.log(`Server is running on port ${port} in ${process.env.NODE_ENV} mode`);
});
