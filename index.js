require('dotenv').config();
const express = require('express');
const morgan = require('morgan'); // Import morgan for logging
const app = express();
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/server');
const jwt = require('jsonwebtoken');

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Socket.IO middleware for authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.user.id);

  // Join family room
  socket.on('join-family', (familyId) => {
    socket.join(`family-${familyId}`);
  });

  // Leave family room
  socket.on('leave-family', (familyId) => {
    socket.leave(`family-${familyId}`);
  });

  // Handle health record updates
  socket.on('health-update', (data) => {
    io.to(`family-${data.familyId}`).emit('health-updated', data);
  });

  // Handle document uploads
  socket.on('document-upload', (data) => {
    io.to(`family-${data.familyId}`).emit('document-uploaded', data);
  });

  // Handle emergency access
  socket.on('emergency-access', (data) => {
    io.to(`family-${data.familyId}`).emit('emergency-accessed', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.user.id);
  });
});

// Static file serving for uploaded files
app.use('/uploads', express.static('uploads')); 

const authRouter = require('./routes/Auth.route');
const familyRouter = require('./routes/Family.route');
const healthRecordRoutes = require('./routes/Health.route');
const documentRoutes = require('./routes/Document.route');
const dashboardRoutes = require('./routes/Dashboard.route');
const emergencyAccessRoutes = require('./routes/Emergency.route');
const notificationRoutes = require('./routes/Notification.route');
const addressRoutes = require('./routes/Address.route');
const ocrRoutes = require('./routes/ocr.route');

// Middleware to parse incoming requests
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// CORS configuration
app.use(
  cors({
    exposedHeaders: ['X-Total-Count'],
  })
);

// Use morgan for logging requests
app.use(morgan('dev')); // Changed to 'dev' for less verbose logging

// Routes
app.get('/',(req,res)=>{
  res.send("Welcome to API server for Family health management Service")
})
app.use('/api/auth', authRouter);
app.use('/api/family', familyRouter);
app.use('/api/health', healthRecordRoutes);
app.use('/api/document', documentRoutes);
app.use('/api/', dashboardRoutes);  //in dashboardRoutes i write the code of health timeline of a family member
app.use('/api/emergency', emergencyAccessRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/add', addressRoutes);
app.use('/api/ocr', ocrRoutes);

// Start server
app.listen(process.env.PORT || 8080, async () => {
  connectDB();
  console.log('Server started on PORT', process.env.PORT);
});
