const express = require('express');
const router = express.Router();
const { register, login, updateProfile, uploadProfilePicture, getProfile } = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');
const upload = require('../utils/multerProfilePicture');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', auth, getProfile);
router.put('/update-profile', auth, updateProfile);
router.post('/upload-profile-picture', auth, upload.single('profilePicture'), uploadProfilePicture);

module.exports = router; 