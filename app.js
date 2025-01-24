const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://127.0.0.1:5500", // Allow Live Server origin
    methods: ["GET", "POST"]
  }
});

const port = 3000;

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
  console.log(`Server is running on port ${port}`);
});
