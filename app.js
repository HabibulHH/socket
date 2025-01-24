const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
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
