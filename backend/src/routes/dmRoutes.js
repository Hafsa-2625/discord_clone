const express = require('express');
const router = express.Router();
const { upload } = require('../utils/multerCloudinary');
const { getDMSessions, uploadDMFile, getDMMessages, startCall, endCall } = require('../controllers/dmController');

router.get('/list', getDMSessions);
router.post('/upload', upload.single('file'), uploadDMFile);
router.get('/:sessionId/messages', getDMMessages);
router.post('/:sessionId/call/start', startCall);
router.post('/:sessionId/call/end', endCall);

module.exports = router;