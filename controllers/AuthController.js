const { User } = require('../models/user.model');
const { sendMail } = require('../utils/common');
const jwt = require('jsonwebtoken');

const bcrypt = require('bcrypt');

exports.createUser = async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10); 
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    try {
      // Check if the email already exists
      const alreadyExist = await User.findOne({ email: req.body.email });
      if (alreadyExist) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }

      // Create a new user with the hashed password
      const user = new User({ ...req.body, password: hashedPassword, salt });
      const doc = await user.save();

      // Generate JWT token
      const token = jwt.sign({ id: doc.id, role: doc.role }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });

      // Send the response with the token and user information
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
          id: doc.id,
          role: doc.role,
          token: token
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: `Server error during user creation: ${err}`
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: `Error encrypting password: ${err}` });
  }
};


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
        role: user.role,
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


exports.resetPasswordRequest = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ message: `User not found: ${err}` });
    }

    const token = crypto.randomBytes(48).toString('hex');
    user.resetPasswordToken = token;
    await user.save();

    const resetPageLink =
      'https://ecommerce-server-xvqq.onrender.com/reset-password?token=' + token + '&email=' + email;
    const subject = 'Reset password for e-commerce';
    const html = `<p>Click <a href='${resetPageLink}'>here</a> to reset your password</p>`;

    if (email) {
      try {
        const response = await sendMail({ to: email, subject, html });
        res.json(response);
      } catch (mailError) {
        console.error(mailError);
        res.status(500).json({ message: `Error sending reset email: ${mailError}` });
      }
    } else {
      res.status(400).json({ message: `Invalid email address: ${err}` });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: `Server error during password reset request: ${err}` });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, password, token } = req.body;
    const user = await User.findOne({ email: email, resetPasswordToken: token });

    if (!user) {
      return res.status(400).json({ message: `Invalid or expired token: ${err}` });
    }

    const salt = crypto.randomBytes(16);
    crypto.pbkdf2(password, salt, 310000, 32, 'sha256', async function (err, hashedPassword) {
      if (err) {
        return res.status(500).json({ message: `Error encrypting new password: ${err}` });
      }

      try {
        user.password = hashedPassword;
        user.salt = salt;
        user.resetPasswordToken = null; // Clear the reset token
        await user.save();

        const subject = 'Password successfully reset for e-commerce';
        const html = `<p>Your password has been successfully reset.</p>`;

        if (email) {
          try {
            const response = await sendMail({ to: email, subject, html });
            res.json(response);
          } catch (mailError) {
            console.error(mailError);
            res.status(500).json({ message: `Error sending confirmation email: ${mailError}` });
          }
        } else {
          res.status(400).json({ message: `Invalid email address: ${err}` });
        }
      } catch (saveError) {
        console.error(saveError);
        res.status(500).json({ message: `Error saving new password: ${saveError}` });
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: `Server error during password reset: ${err}` });
  }
};
