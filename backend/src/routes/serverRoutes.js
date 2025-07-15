const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../utils/cloudinary');
const upload = multer({ storage });
const serverController = require('../controllers/serverController');

router.post('/', upload.single('image'), serverController.createServer);
router.get('/', serverController.getServers);
router.get('/:id', serverController.getServerById);

module.exports = router; 