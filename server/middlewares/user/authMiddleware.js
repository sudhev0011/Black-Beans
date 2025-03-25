const jwt = require('jsonwebtoken');
const User = require('../../models/userModel');

const authenticateToken = async (req, res, next) => {
  try {
    console.log('Checking user authentication...');
    const accessToken = req.cookies.userAccessToken;
    
    if (!accessToken) {
      console.log('No access token found in cookies');
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied, no token provided',
        code: 'TOKEN_MISSING'
      });
    }

    console.log('Verifying access token...');
    const decoded = jwt.verify(accessToken, process.env.TOKEN_KEY);
    console.log('Token verified, checking user...');
    
    const user = await User.findById(decoded.id);
    
    if (!user) {
      console.log('User not found in database');
      return res.status(403).json({ 
        success: false, 
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    if (user.isBlocked) {
      console.log('User account is blocked');
      return res.status(403).json({ 
        success: false, 
        message: 'Account is blocked',
        code: 'USER_BLOCKED'
      });
    }

    console.log('User authenticated successfully');
    req.user = { 
      id: user._id, 
      email: user.email, 
      role: user.role 
    };
    next();
  } catch (error) {
    console.error('Auth error:', error.name, error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid token',
        code: 'TOKEN_INVALID'
      });
    }
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication error',
      error: error.message,
      code: 'AUTH_ERROR'
    });
  }
};

module.exports = { authenticateToken };