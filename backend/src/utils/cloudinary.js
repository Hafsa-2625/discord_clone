const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: 'dledecqb7', 
  api_key: '839662557513293',
  api_secret: 'Ep9C_zLX4yvuf8fcl3mhO2kllsA',
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'discord_servers',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 256, height: 256, crop: 'limit' }],
  },
});

module.exports = { cloudinary, storage }; 