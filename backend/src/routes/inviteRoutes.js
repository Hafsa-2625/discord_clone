const express = require('express');
const router = express.Router();
const { joinServerByInviteCode } = require('../controllers/serverController');

// Join a server via invite code
router.post('/:inviteCode/join', joinServerByInviteCode);

module.exports = router; 