const AWS = require('aws-sdk');
const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET_NAME } = process.env;

// Configure AWS SDK
AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION,
  logger: console,
  s3DisableBodySigning: false, // Enable body signing
  signatureVersion: 'v4'
});

const s3 = new AWS.S3({
  signatureVersion: 'v4',
  s3DisableBodySigning: false
});

// console.log(s3)

const uploadPDFToS3 = async (pdfBuffer, filename) => {
  try {
    console.log('Starting S3 upload...');
   
    // Check if bucket exists and is accessible
    try {
      await s3.headBucket({ Bucket: S3_BUCKET_NAME }).promise();
    } catch (error) {
      if (error.code === 'NoSuchBucket') {
        throw new Error('S3 bucket does not exist');
      } else if (error.code === 'AccessDenied') {
        throw new Error('Access denied to S3 bucket. Check your AWS credentials and bucket permissions');
      }
      throw error;
    }

    const params = {
      Bucket: S3_BUCKET_NAME,
      Key: `health_records_pdf/${filename}`,
      Body: pdfBuffer,
      ContentType: 'application/pdf'
    };

    console.log('Upload parameters:', {
      Bucket: params.Bucket,
      Key: params.Key,
      ContentType: params.ContentType
    });

    const uploadResult = await s3.upload(params).promise();
    console.log('Upload successful. Location:', uploadResult.Location);

    // Return the S3 object URL in the correct format
    const objectUrl = `https://${S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/health_records_pdf/${filename}`;

    return {
      ...uploadResult,
      SignedUrl: objectUrl
    };
  } catch (error) {
    console.error('S3 upload error:', error);
    if (error.code === 'NoSuchBucket') {
      throw new Error('S3 bucket does not exist');
    } else if (error.code === 'AccessDenied') {
      throw new Error('Access denied to S3 bucket. Check your AWS credentials and bucket permissions');
    } else if (error.code === 'InvalidAccessKeyId') {
      throw new Error('Invalid AWS access key ID');
    } else if (error.code === 'SignatureDoesNotMatch') {
      throw new Error('AWS signature does not match. Check your secret access key');
    }
    throw error;
  }
};

const uploadProfileImageToS3 = async (imageBuffer, filename) => {
  try {
    // Check if bucket exists and is accessible
    try {
      await s3.headBucket({ Bucket: S3_BUCKET_NAME }).promise();
    } catch (error) {
      if (error.code === 'NoSuchBucket') {
        throw new Error('S3 bucket does not exist');
      } else if (error.code === 'AccessDenied') {
        throw new Error('Access denied to S3 bucket. Check your AWS credentials and bucket permissions');
      }
      throw error;
    }

    const params = {
      Bucket: S3_BUCKET_NAME,
      Key: `profile_images/${filename}`,
      Body: imageBuffer,
      ContentType: 'image/jpeg'
    };

    const uploadResult = await s3.upload(params).promise();
    console.log('Profile image upload successful. Location:', uploadResult.Location);

    // Return the S3 object URL in the correct format
    const objectUrl = `https://${S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/profile_images/${filename}`;

    return {
      ...uploadResult,
      SignedUrl: objectUrl
    };
  } catch (error) {
    console.error('S3 profile image upload error:', error);
    throw error;
  }
};

const uploadHealthRecordImageToS3 = async (imageBuffer, filename) => {
  try {
    // Check if bucket exists and is accessible
    try {
      await s3.headBucket({ Bucket: S3_BUCKET_NAME }).promise();
    } catch (error) {
      if (error.code === 'NoSuchBucket') {
        throw new Error('S3 bucket does not exist');
      } else if (error.code === 'AccessDenied') {
        throw new Error('Access denied to S3 bucket. Check your AWS credentials and bucket permissions');
      }
      throw error;
    }

    const params = {
      Bucket: S3_BUCKET_NAME,
      Key: `health_records/${filename}`,
      Body: imageBuffer,
      ContentType: 'image/jpeg'
    };

    const uploadResult = await s3.upload(params).promise();
    console.log('Health record image upload successful. Location:', uploadResult.Location);

    // Return the S3 object URL in the correct format
    const objectUrl = `https://${S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/health_records/${filename}`;

    return {
      ...uploadResult,
      SignedUrl: objectUrl
    };
  } catch (error) {
    console.error('S3 health record image upload error:', error);
    throw error;
  }
};

module.exports = { uploadPDFToS3, uploadProfileImageToS3, uploadHealthRecordImageToS3 };