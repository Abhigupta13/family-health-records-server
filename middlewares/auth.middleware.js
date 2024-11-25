const jwt = require('jsonwebtoken');
const { User } = require('../models/user.model'); // Adjust the path as needed
require('dotenv').config();

// Middleware to verify JWT and extract user ID
exports.isAuthenticated = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Extract the token from the Authorization header
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    // Verify the token
    const secretKey = process.env.JWT_SECRET_KEY; // Replace with your actual secret key
    const decoded = jwt.verify(token, secretKey);
console.log(decoded);
    // Find the user in the database (optional, based on your needs)
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Attach user ID to the request for further use
    req.userId = decoded.userId;
    req.user = user; // Attach full user object if needed

    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: `Unauthorized: ${err.message}` });
  }
};

