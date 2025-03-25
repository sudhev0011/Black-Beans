const jwt = require('jsonwebtoken');
const dotenv = require('dotenv')
const Admin = require('../../models/adminModel');
dotenv.config();

const authenticateAdminToken = async (req, res, next) => {
  try {
    console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%\nChecking admin authentication...');
    const accessToken = req.cookies?.adminAccessToken;
    
    if (!accessToken) {
      console.log('No access token found in cookies');
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied, no token provided' 
      });
    }

    console.log('Verifying access token...');
    const decoded = jwt.verify(accessToken, process.env.ADMIN_TOKEN_KEY);
    console.log('Token verified, checking admin...');
    
    const admin = await Admin.findById(decoded.id);
    
    if (!admin) {
      console.log('Admin not found in database');
      return res.status(403).json({ 
        success: false, 
        message: 'Admin not found' 
      });
    }

    console.log('Admin authenticated successfully');
    req.user = { 
      id: admin._id, 
      email: admin.email, 
      role: admin.role 
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
      error: error.message
    });
  }
};

module.exports = authenticateAdminToken;