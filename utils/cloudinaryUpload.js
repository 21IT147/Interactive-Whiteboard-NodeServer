const cloudinary = require('../config/cloudinaryConfig');

// Uploads the file to Cloudinary
const uploadToCloudinary = async (filePath, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(filePath, { folder: folder }, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result.secure_url); // Return the URL of the uploaded file
      }
    });
  });
};

module.exports = uploadToCloudinary;
