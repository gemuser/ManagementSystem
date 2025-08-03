const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Simple user credentials (in production, this should be stored in database with hashed passwords)
const users = [
    {
        id: 1,
        username: 'admin',
        password: 'admin', // In production, this should be hashed
        role: 'admin',
        name: 'Administrator'
    }
];

// ===================== LOGIN =====================
const login = async (req, res) => {
    try {
        const { username, password, rememberMe } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide username and password'
            });
        }

        // Find user
        const user = users.find(u => u.username === username);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        // Validate password (in production, use bcrypt.compare for hashed passwords)
        if (user.password !== password) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        // Set token expiration based on rememberMe option
        const tokenExpiration = rememberMe ? '30d' : '1h'; // 30 days if remember me, 1 hour otherwise

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username, 
                role: user.role,
                rememberMe: rememberMe || false
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: tokenExpiration }
        );

        // Send response
        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            expiresIn: tokenExpiration,
            rememberMe: rememberMe || false,
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// ===================== VERIFY TOKEN =====================
const verifyToken = async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = users.find(u => u.id === decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Token is valid',
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid token',
            error: error.message
        });
    }
};

// ===================== REFRESH TOKEN =====================
const refreshToken = async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = users.find(u => u.id === decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        // Use the same expiration as the original token if rememberMe was set
        const tokenExpiration = decoded.rememberMe ? '30d' : '1h';

        // Generate new token with fresh expiration
        const newToken = jwt.sign(
            { 
                id: user.id, 
                username: user.username, 
                role: user.role,
                rememberMe: decoded.rememberMe || false
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: tokenExpiration }
        );

        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            token: newToken,
            expiresIn: tokenExpiration,
            rememberMe: decoded.rememberMe || false,
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(401).json({
            success: false,
            message: 'Token refresh failed',
            error: error.message
        });
    }
};

// ===================== LOGOUT =====================
const logout = async (req, res) => {
    try {
        // In a real application, you might want to blacklist the token
        // For now, we'll just return a success message
        res.status(200).json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = {
    login,
    verifyToken,
    refreshToken,
    logout
};
