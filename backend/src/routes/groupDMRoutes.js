const express = require('express');
const router = express.Router();
const { upload } = require('../utils/multerCloudinary');
const groupDMController = require('../controllers/groupDMController');
const auth = require('../middleware/authMiddleware');

router.post('/', upload.single('image'), groupDMController.createGroupDM);
router.get('/:id', groupDMController.getGroupDMDetails);
router.get('/user/:userId', groupDMController.getUserGroupDMs);
router.get('/:id/messages', groupDMController.getGroupDMMessages);
router.post('/:id/messages', groupDMController.sendGroupDMMessage);
router.post('/upload', upload.single('file'), groupDMController.uploadGroupDMFile);
router.delete('/:id/leave', auth, groupDMController.leaveGroupDM);

module.exports = router; 