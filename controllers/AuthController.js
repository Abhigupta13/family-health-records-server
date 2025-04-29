const { User } = require('../models/user.model');
const { sendPasswordResetEmail } = require('../services/PassResetService');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { uploadProfileImageToS3 } = require('../utils/s3');
const NotificationPreferences = require('../models/notificationPreferences.model');
const validator = require('validator');

const validRoles = ['Admin', 'Doctor', 'User']; // ✅ Valid roles

// ✅ Get User Profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -salt');
    const notificationPreferences = await NotificationPreferences.findOne({
      user_id: req.user.id
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        created_at: user.createdAt,
        notificationPreferences: {
          medication_reminders: notificationPreferences.medication_reminders,
        health_alerts: notificationPreferences.health_alerts,
        email_notifications: notificationPreferences.email_notifications,
        sms_notifications: notificationPreferences.sms_notifications,
        app_notifications: notificationPreferences.app_notifications,
        updated_at: notificationPreferences.updated_at
        }
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: `Error fetching user profile: ${err}` });
  }
};

// ✅ Create User (Signup)
exports.createUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    const alreadyExist = await User.findOne({ email });
    if (alreadyExist) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let imageUrl = '';
    if (req.file) {
      const filename = `profile_${Date.now()}_${req.file.originalname}`;
      const result = await uploadProfileImageToS3(req.file.buffer, filename);
      imageUrl = result.SignedUrl;
    }

    const userRole = validRoles.includes(role) ? role : 'User'; // ✅ Ensure role is valid

    const user = new User({ ...req.body, role: userRole, password: hashedPassword, salt, image: imageUrl });
    const doc = await user.save();

    const token = jwt.sign({ id: doc.id, role: doc.role }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });

    const preferences = new NotificationPreferences({
      user_id: doc.id,
      email_notifications: true,
      sms_notifications: true,
      app_notifications: true,
    });
    await preferences.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { id: doc.id, role: doc.role, image: doc.image, token, notification_preferences: preferences },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: `Server error during user creation: ${err}` });
  }
};

// ✅ Login User
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized access: Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Unauthorized access: Invalid email or password' });
    }

    const userRole = validRoles.includes(user.role) ? user.role : 'User'; // ✅ Ensure valid role

    const token = jwt.sign({ id: user.id, role: userRole }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        id: user.id,
        role: userRole, // Include role in the response
        image: user.image, // ✅ Added image here
        token,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: `Error logging in user: ${err}` });
  }
};


// ✅ Forgot Password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  
  try {
    const resetToken = Math.random().toString(36).substring(2, 15);
    
    console.log(`Generated reset token for ${email}: ${resetToken}`);
    
    await sendPasswordResetEmail(email, resetToken);
    
    res.status(200).json({ success: true, message: 'Password reset email sent successfully (Mock)' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: `Error sending reset email: ${err.message}` });
  }
};

// ✅ Update User Profile
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, password, role } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }
      user.email = email;
    }

    if (name && name !== user.name) {
      user.name = name;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
      user.salt = salt;
    }

    if (role && validRoles.includes(role)) { // ✅ Ensure valid role
      user.role = role;
    }

    if (req.file) {
      const filename = `profile_${Date.now()}_${req.file.originalname}`;
      const result = await uploadProfileImageToS3(req.file.buffer, filename);
      console.log(result);

      user.image = result.SignedUrl;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User profile updated successfully',
      data: {
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        created_at: user.createdAt,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: `Error updating user profile: ${err.message}` });
  }
};

// ✅ Logout User
exports.logout = async (req, res) => {
  try {
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
