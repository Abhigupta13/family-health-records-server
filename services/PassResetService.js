// services/PassResetService.js
const sendPasswordResetEmail = async (email, resetToken) => {
    try {
      // Mock sending email (simulate successful email sending)
      console.log('Sending password reset email...');
      console.log(`To: ${email}`);
      console.log(`Reset Token: ${resetToken}`);
      console.log('Password reset email sent successfully (Mock)!');
      
      // If you want, you can simulate an error here to test failure scenarios
      // throw new Error('Simulated email sending error');
      
      return Promise.resolve();  // Simulate successful sending
    } catch (err) {
      console.error('Error sending email:', err.message);
      return Promise.reject(new Error('Error sending reset email: ' + err.message));
    }
  };
  
  module.exports = { sendPasswordResetEmail };
  