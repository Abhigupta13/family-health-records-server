require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const connectDB = require('./config/server');

const authRouter = require('./routes/Auth.route');

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
app.use('/auth', authRouter.router);

app.listen(process.env.PORT || 8080, async () => {
  connectDB();
  console.log('server started on PORT', process.env.PORT);
});
