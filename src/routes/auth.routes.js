const express = require('express');
const authController = require('../controllers/auth.controller');
const asyncHandler = require('../lib/asyncHandler');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', asyncHandler(authController.register));
router.post('/login', asyncHandler(authController.login));
router.get('/me', requireAuth, asyncHandler(authController.me));

module.exports = router;
