const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../utils/cloudinary');
const upload = multer({ storage });
const serverController = require('../controllers/serverController');

// POST /api/servers - create a new server with image upload
router.post('/', upload.single('image'), serverController.createServer);
// GET /api/servers?userId=123 - get all servers owned by the user
router.get('/', serverController.getServers);
// GET /api/servers/:id - get a single server by ID
router.get('/:id', serverController.getServerById);

module.exports = router; 