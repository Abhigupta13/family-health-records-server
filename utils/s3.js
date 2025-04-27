const AWS = require('aws-sdk');
const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET_NAME } = process.env;

// Configure AWS SDK
AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION,
  logger: console
});

const s3 = new AWS.S3();

const uploadPDFToS3 = async (pdfBuffer, filename) => {
  try {
    console.log('Starting S3 upload...');
    console.log('Bucket:', S3_BUCKET_NAME);
    console.log('Region:', AWS_REGION);
    console.log('Access Key ID present:', !!AWS_ACCESS_KEY_ID);
    console.log('Secret Access Key present:', !!AWS_SECRET_ACCESS_KEY);

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

    // Generate pre-signed URL with the same parameters as the example
    const signedUrl = s3.getSignedUrl('getObject', {
      Bucket: S3_BUCKET_NAME,
      Key: `health_records/${filename}`,
      Expires: 300, // 5 minutes
      ResponseContentDisposition: 'inline',
      ResponseContentType: 'application/pdf'
    });

    return {
      ...uploadResult,
      SignedUrl: signedUrl
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

module.exports = { uploadPDFToS3 };