const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

/**
 * Upload file to S3 inside a specified folder
 * @param {object} file - multer file object
 * @param {string} folder - folder name inside S3 (example: 'profileImages' or any other folder)
 * @returns {string} - Full CloudFront URL
 */
const uploadToS3 = async (file, folder = "profileImages") => {
  const fileExtension = path.extname(file.originalname);
  const fileName = `${folder}/${uuidv4()}${fileExtension}`;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    // ACL: "public-read", // always make public for CloudFront
    ContentType: file.mimetype,
  };

  const data = await s3.upload(params).promise();

  const cloudFrontUrl = process.env.AWS_CLOUDFRONT_URL
    ? `https://${process.env.AWS_CLOUDFRONT_URL}/${fileName}`
    : data.Location;

  return cloudFrontUrl;
};

module.exports = { uploadToS3 };