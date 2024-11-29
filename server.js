const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
  },
});

let adminSocketId = null;

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Assign role: admin if no admin exists, otherwise viewer
  if (!adminSocketId) {
    adminSocketId = socket.id;
    socket.emit('role', 'admin');
  } else {
    socket.emit('role', 'viewer');
  }

  // Handle button click from admin
  socket.on('buttonClick', (data) => {
    console.log('Button clicked:', data);

    // Broadcast to all viewers
    socket.broadcast.emit('buttonClicked', data);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    // If admin disconnects, allow a new admin
    if (socket.id === adminSocketId) {
      adminSocketId = null;
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
