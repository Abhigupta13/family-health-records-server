require('dotenv').config();
const express = require('express');
const morgan = require('morgan'); // Import morgan for logging
const app = express();
const cors = require('cors');
const connectDB = require('./config/server');

// Static file serving for uploaded files
app.use('/uploads', express.static('uploads')); 

const authRouter = require('./routes/Auth.route');
const familyRouter = require('./routes/Family.route');
const healthRecordRoutes = require('./routes/Health.route');
const documentRoutes = require('./routes/Document.route');
const dashboardRoutes = require('./routes/Dashboard.route');
const emergencyAccessRoutes = require('./routes/Emergency.route');
const notificationRoutes = require('./routes/Notification.route');
const healthUpdateRoutes = require('./routes/healthUpdateRoutes');
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
app.use('/api/updates', healthUpdateRoutes);
app.use('/api/add', addressRoutes);
app.use('/api/ocr', ocrRoutes);

app.listen(process.env.PORT || 8080, async () => {
  connectDB();
  console.log('server started on PORT', process.env.PORT);
});
