const express = require('express');
const router = express.Router();
const channelsController = require('../controllers/channelsController');

// Create a new channel
router.post('/', channelsController.createChannel);
// Get all channels for a server
router.get('/server/:serverId', channelsController.getChannels);
// Get a single channel by id
router.get('/:id', channelsController.getChannelById);
// Delete a channel by id
router.delete('/:id', channelsController.deleteChannel);

module.exports = router; 