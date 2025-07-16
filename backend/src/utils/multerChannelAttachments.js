const { CloudinaryStorage } = require('multer-storage-cloudinary');
   const multer = require('multer');
   const { cloudinary } = require('./multerCloudinary');

   const channelAttachmentStorage = new CloudinaryStorage({
     cloudinary,
     params: async (req, file) => ({
       folder: 'channel_attachments',
       resource_type: 'auto',
       public_id: `${Date.now()}-${file.originalname}`,
     }),
   });
   const uploadChannelAttachmentMulter = multer({ storage: channelAttachmentStorage });

   module.exports = { uploadChannelAttachmentMulter };