const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');
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

io.on('connection', (socket) => {
  console.log('A user connected');
  
  // Join the broadcast room
  socket.join('broadcast');
  
  // Send welcome message only to the new user
  socket.emit('message', 'Welcome to the chat!');
  
  // Announce to others that someone joined
  socket.to('broadcast').emit('message', 'A new user joined the chat');
  
  // Handle incoming messages
  socket.on('message', (msg) => {
    // Broadcast the message to everyone in the room (including sender)
    io.to('broadcast').emit('message', `User said: ${msg}`);
  });

  socket.on('disconnect', () => {
    // Notify others when someone leaves
    socket.to('broadcast').emit('message', 'A user left the chat');
    console.log('User disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port} in ${process.env.NODE_ENV} mode`);
});
