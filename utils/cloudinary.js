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

const uploadPDFToCloudinary = async (buffer, filename) => {
  console.log('Starting PDF upload to Cloudinary');
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: 'health_records',
          format: 'pdf',
          public_id: filename,
          type: 'upload',
          access_mode: 'public',
          use_filename: true,
          unique_filename: true,
          overwrite: true,
          transformation: [
            { flags: 'attachment' }
          ],
          content_type: 'application/pdf'
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('Cloudinary upload successful:', result);
            resolve(result);
          }
        }
      );
      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error('Cloudinary PDF upload error:', error);
    throw new Error('PDF upload failed');
  }
};

module.exports = {
  uploadToCloudinary,
  uploadPDFToCloudinary,
  cloudinary
};
