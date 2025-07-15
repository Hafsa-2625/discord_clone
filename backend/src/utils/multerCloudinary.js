const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: 'dledecqb7',
  api_key: '839662557513293',
  api_secret: 'Ep9C_zLX4yvuf8fcl3mhO2kllsA',
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'discord_dm_files',
    resource_type: 'auto', 
    public_id: `${Date.now()}-${file.originalname}`,
  }),
});

const upload = multer({ storage }); 

module.exports = { upload, cloudinary }; 