const express = require('express');
const { login, verifyToken, refreshToken, logout } = require('./authController');

const router = express.Router();

// ===================== ROUTES =====================

// POST /api/auth/login - Login user
router.post('/login', login);

// GET /api/auth/verify - Verify token
router.get('/verify', verifyToken);

// POST /api/auth/refresh - Refresh token
router.post('/refresh', refreshToken);

// POST /api/auth/logout - Logout user
router.post('/logout', logout);

module.exports = router;
