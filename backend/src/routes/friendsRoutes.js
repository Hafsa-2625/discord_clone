const express = require('express');
const router = express.Router();
const { sendFriendRequest, getFriendRequests, respondToFriendRequest, getFriends } = require('../controllers/friendsController');
const auth = require('../middleware/authMiddleware');
const friendsController = require('../controllers/friendsController');

router.post('/request', auth, sendFriendRequest);
router.get('/requests', auth, getFriendRequests);
router.post('/respond', auth, respondToFriendRequest);
router.get('/list', auth, getFriends);

module.exports = router; 