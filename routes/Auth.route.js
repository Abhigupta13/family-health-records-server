const express = require('express');
const { resetPasswordRequest, createUser, loginUser, checkAuth, logout, resetPassword } = require('../controllers/AuthController');
const { isAuthenticated } = require('../middlewares/auth.middleware');

const router = express.Router();
//  /auth is already added in base path
router.post('/signup', createUser)
.post('/login', loginUser)
.post('/logout',isAuthenticated,logout)
.post('/reset-password-request', resetPasswordRequest)
.post('/reset-password', resetPassword)
exports.router = router;











// // https://www.youtube.com/watch?v=LH-S5v-D3hA
