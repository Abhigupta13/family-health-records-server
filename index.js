require('dotenv').config();
const express = require('express');
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

// Middleware to parse incoming requests
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// CORS configuration
app.use(
  cors({
    exposedHeaders: ['X-Total-Count'],
  })
);

// Routes
app.use('/auth', authRouter);
app.use('/family', familyRouter);
app.use('/health',healthRecordRoutes);
app.use('/document', documentRoutes);
app.use('/', dashboardRoutes);  //in dashboardRoutes i write the code of  health timeline of a family member
app.use('/emergency', emergencyAccessRoutes);
app.use('/notifications', notificationRoutes);
app.use('/api', healthUpdateRoutes);
app.use('/add', addressRoutes);




app.listen(process.env.PORT || 8080, async () => {
  connectDB();
  console.log('server started on PORT', process.env.PORT);
});
