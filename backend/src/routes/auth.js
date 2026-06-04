const express = require('express');
const { register, login, profile, updateProfile } = require('../controllers/authController');
const authenticate = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticate, profile);
router.put('/profile', authenticate, updateProfile);

module.exports = router;
