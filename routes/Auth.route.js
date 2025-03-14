const express = require('express');
const { resetPasswordRequest, createUser, loginUser, checkAuth, logout, resetPassword, getUserProfile,updateUserProfile} = require('../controllers/AuthController');
const { isAuthenticated, isLoggedInUser } = require('../middlewares/auth.middleware');
const { forgotPassword } = require('../controllers/AuthController');
const upload = require('../middlewares/multer.js');

const router = express.Router();
//some routes added and some testing;
// Routes for user authentication
router.post('/signup',upload.single('image'), createUser)
  .get('/isLogged',isLoggedInUser)
  .post('/login', loginUser)
  .post('/logout', isAuthenticated, logout)
  .post('/forgot-password',isAuthenticated,forgotPassword)
  // .post('/reset-password-request', resetPasswordRequest)
  // .post('/reset-password', resetPassword)
  
// Route for fetching user profile (authenticated)
router.get('/profile', isAuthenticated, getUserProfile);

// Route for updating user profile (authenticated)
router.put('/profile',isAuthenticated, upload.single('image'),updateUserProfile);

// // POST route to add a new family member
// router.post('/family', isAuthenticated, addFamilyMember);

// // Route for getting family members (Authenticated)
// router.get('/family', isAuthenticated, getFamilyMembers); // Ensure the route is protected by the authentication middleware

// // PUT endpoint to update a family member
// router.put('/family/:id', updateFamilyMember);

// // DELETE /family/:id - Delete family member by ID
// router.delete('/family/:id', familyController.deleteFamilyMember);


module.exports = router;