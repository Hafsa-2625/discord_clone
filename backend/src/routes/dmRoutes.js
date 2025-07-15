const express = require('express');
const router = express.Router();
const { upload } = require('../utils/multerCloudinary');
const dmController = require('../controllers/dmController');

// GET /api/dms/list?userId=123 - get all DM sessions for the user
router.get('/list', dmController.getDMSessions);

// DM file upload
router.post('/upload', upload.single('file'), dmController.uploadDMFile);

// GET /api/dms/:sessionId/messages - get all text and file messages for a DM session
router.get('/:sessionId/messages', dmController.getDMMessages);

module.exports = router; 