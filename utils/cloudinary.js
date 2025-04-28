const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (filePath) => {
  console.log("Uploading to Cloudinary");
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'health_records', // Cloudinary folder name
    });
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Image upload failed');
  }
};


module.exports = {
  uploadToCloudinary,
  cloudinary
};

