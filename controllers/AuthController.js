const { User } = require('../models/user.model');
const {sendPasswordResetEmail} = require('../services/PassResetService');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const FamilyMember = require('../models/FamilyMember.model');
const NotificationPreferences = require('../models/notificationPreferences.model');
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const validator = require('validator'); // Importing the validator library

const bcrypt = require('bcrypt');

exports.getUserProfile = async (req, res) => {
  try {
    // Retrieve the user from the request (set by the authentication middleware)
    const user = await User.findById(req.user.id).select('-password -salt'); // Exclude sensitive data

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Return user profile information
    res.status(200).json({
      success: true,
      data: {
        name: user.name,
        email: user.email,
        role: user.role, // Include role in the response
        created_at: user.createdAt, // Assuming the `createdAt` field exists in your User model
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: `Error fetching user profile: ${err}` });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // 1. Validate the email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    // 2. Check if the email already exists
    const alreadyExist = await User.findOne({ email });
    if (alreadyExist) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    // 3. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create a new user with the hashed password
    const user = new User({ ...req.body, password: hashedPassword, salt });
    const doc = await user.save();

    // 5. Generate JWT token
    const token = jwt.sign({ id: doc.id, role: doc.role }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });

    // 6. Create default notification preferences for the user
    const preferences = new NotificationPreferences({
      user_id: doc.id,
      email_notifications: true,
      sms_notifications: true,
      app_notifications: true,
    });
    await preferences.save();

    // 7. Send the response with the token and user information
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: doc.id,
        role: doc.role,
        token: token,
        notification_preferences: preferences,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: `Server error during user creation: ${err}`,
    });
  }
};


//login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: `Unauthorized access: Invalid email or password`
      });
    }

    // Compare the provided password with the stored hashed password
    if (typeof password !== 'string' || typeof user.password !== 'string') {
      return res.status(400).json({
        success: false,
        message: `Invalid password format`
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: `Unauthorized access: Invalid email or password`
      });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });

    // Respond with the user data and token
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        id: user.id,
        role: user.role, // Include role in the response
        token: token
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: `Error logging in user: ${err}`
    });
  }
};

//forgot-password;
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  
  try {
    // Generate a mock reset token (in real implementation, this would be done securely)
    const resetToken = Math.random().toString(36).substring(2, 15); // Random token for testing
    
    // Mock database update (in reality, you would update the user's record with the reset token)
    console.log(`Generated reset token for ${email}: ${resetToken}`);
    
    // Call the mock email sending function
    await sendPasswordResetEmail(email, resetToken);
    
    // Respond to the client with a success message
    res.status(200).json({ success: true, message: 'Password reset email sent successfully (Mock)' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: `Error sending reset email: ${err.message}` });
  }
};

//update profile
exports.updateUserProfile = async (req, res) => {
  try {
    // Retrieve the user from the request (set by the authentication middleware)
    const userId = req.user.id; // Assuming req.user is populated by an authentication middleware (e.g., JWT)
    const { name, email, password } = req.body; // Destructure name, email, and password from the request body

    // Find the user in the database by user ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if the email has changed and if the new email already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }
      user.email = email; // Update the email if it has changed
    }

    // Update the name if provided
    if (name && name !== user.name) {
      user.name = name; // Update the name if it has changed
    }

    // Check if password is being updated and hash it if provided
    if (password) {
      const salt = await bcrypt.genSalt(10); // Generate a salt for password hashing
      const hashedPassword = await bcrypt.hash(password, salt); // Hash the password
      user.password = hashedPassword; // Update the password field
      user.salt = salt; // Save the new salt value
    }

    // Save the updated user information
    await user.save();

    // Return updated user info (excluding password)
    res.status(200).json({
      success: true,
      message: 'User profile updated successfully',
      data: {
        name: user.name,
        email: user.email,
        role: user.role, // Include role in the response
        created_at: user.createdAt, // You can include other fields if needed
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: `Error updating user profile: ${err.message}` });
  }
};



//logout
exports.logout = async (req, res) => {
  try {
    // If you're using JWTs, you can invalidate them by adding them to a token blacklist.
    // Or simply rely on the client to discard the token.
    
    // Optional: Clear any server-side session if applicable (e.g., with Redis)
    // await sessionService.clearSession(req.user.id);

    return res.status(200).json({ message: 'Logout successful.' });
  } catch (err) {
    console.error('Error during logout:', err);
    return res.status(500).json({ message: `Error during logout: ${err.message}` });
  }
};

// exports.resetPasswordRequest = async (req, res) => {
//   try {
//     const email = req.body.email;
//     const user = await User.findOne({ email: email });

//     if (!user) {
//       return res.status(404).json({ message: `User not found: ${err}` });
//     }

//     const token = crypto.randomBytes(48).toString('hex');
//     user.resetPasswordToken = token;
//     await user.save();

//     const resetPageLink =
//       'https://ecommerce-server-xvqq.onrender.com/reset-password?token=' + token + '&email=' + email;
//     const subject = 'Reset password for e-commerce';
//     const html = `<p>Click <a href='${resetPageLink}'>here</a> to reset your password</p>`;

//     if (email) {
//       try {
//         const response = await sendMail({ to: email, subject, html });
//         res.json(response);
//       } catch (mailError) {
//         console.error(mailError);
//         res.status(500).json({ message: `Error sending reset email: ${mailError}` });
//       }
//     } else {
//       res.status(400).json({ message: `Invalid email address: ${err}` });
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: `Server error during password reset request: ${err}` });
//   }
// };

// exports.resetPassword = async (req, res) => {
//   try {
//     const { email, password, token } = req.body;
//     const user = await User.findOne({ email: email, resetPasswordToken: token });

//     if (!user) {
//       return res.status(400).json({ message: `Invalid or expired token: ${err}` });
//     }

//     const salt = crypto.randomBytes(16);
//     crypto.pbkdf2(password, salt, 310000, 32, 'sha256', async function (err, hashedPassword) {
//       if (err) {
//         return res.status(500).json({ message: `Error encrypting new password: ${err}` });
//       }

//       try {
//         user.password = hashedPassword;
//         user.salt = salt;
//         user.resetPasswordToken = null; // Clear the reset token
//         await user.save();

//         const subject = 'Password successfully reset for e-commerce';
//         const html = `<p>Your password has been successfully reset.</p>`;

//         if (email) {
//           try {
//             const response = await sendMail({ to: email, subject, html });
//             res.json(response);
//           } catch (mailError) {
//             console.error(mailError);
//             res.status(500).json({ message: `Error sending confirmation email: ${mailError}` });
//           }
//         } else {
//           res.status(400).json({ message: `Invalid email address: ${err}` });
//         }
//       } catch (saveError) {
//         console.error(saveError);
//         res.status(500).json({ message: `Error saving new password: ${saveError}` });
//       }
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: `Server error during password reset: ${err}` });
//   }
// };
