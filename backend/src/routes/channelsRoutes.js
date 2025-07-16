const express = require('express');
const router = express.Router();
const channelsController = require('../controllers/channelsController');
const { upload } = require('../utils/multerCloudinary');
const { uploadChannelAttachmentMulter } = require('../utils/multerChannelAttachments');

router.post('/', channelsController.createChannel);
router.get('/server/:serverId', channelsController.getChannels);

// Channel invite endpoints (STATIC FIRST)
router.get('/invites', channelsController.getChannelInvites);
router.post('/invites/:inviteId/respond', channelsController.respondToChannelInvite);

router.post('/:channelId/invite', channelsController.sendChannelInvite);
router.get('/:id', channelsController.getChannelById);
router.delete('/:id', channelsController.deleteChannel);

// Channel message endpoints
router.post('/:channelId/messages', (req, res) => {
  // Attach channelId from params to body for controller
  req.body.channelId = req.params.channelId;
  channelsController.sendChannelMessage(req, res);
});
router.get('/:channelId/messages', channelsController.getChannelMessages);

// Channel attachment upload endpoint
router.post('/:channelId/attachments', uploadChannelAttachmentMulter.single('file'), (req, res) => {
  channelsController.uploadChannelAttachment(req, res);
});

// Channel attachment fetch endpoint
router.get('/:channelId/attachments', channelsController.getChannelAttachments);

module.exports = router; 