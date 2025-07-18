const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../utils/cloudinary');
const upload = multer({ storage });
const serverController = require('../controllers/serverController');

router.post('/', upload.single('image'), serverController.createServer);
router.get('/', serverController.getServers);
router.get('/:id', serverController.getServerById);
router.get('/user/:userId', serverController.getServersForUser);
// Create a new invite link for a server
router.post('/:serverId/invites', serverController.createServerInvite);
// Join a server via invite code (global route, not under /servers)
router.post('/api/invites/:inviteCode/join', serverController.joinServerByInviteCode);

module.exports = router; 