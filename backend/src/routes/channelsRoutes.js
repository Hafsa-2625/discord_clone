const express = require('express');
const router = express.Router();
const channelsController = require('../controllers/channelsController');

router.post('/', channelsController.createChannel);
router.get('/server/:serverId', channelsController.getChannels);
router.get('/:id', channelsController.getChannelById);
router.delete('/:id', channelsController.deleteChannel);

module.exports = router; 