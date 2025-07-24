const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const { cloudinary } = require('./cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'discord_clone/profile_pictures',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 256, height: 256, crop: 'fill', gravity: 'face' }, // Square crop focused on face
      { quality: 'auto', fetch_format: 'auto' } // Optimize quality and format
    ]
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

module.exports = upload;
