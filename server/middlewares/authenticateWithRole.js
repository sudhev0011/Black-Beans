const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Admin = require('../models/adminModel');
const dotenv = require('dotenv');
dotenv.config();

const authenticateWithRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      console.log(`Checking authentication for roles: ${allowedRoles}...`);
      const userAccessToken = req.cookies?.userAccessToken;
      const adminAccessToken = req.cookies?.adminAccessToken;

      // If no token is provided, reject the request
      if (!userAccessToken && !adminAccessToken) {
        console.log('No token provided');
        return res.status(401).json({
          success: false,
          message: 'Please login to enjoy our services',
          code: 'TOKEN_MISSING',
        });
      }

      let decoded;
      let entity;
      let userRole;

      // Verify the user token first
      if (userAccessToken) {
        try {
          decoded = jwt.verify(userAccessToken, process.env.TOKEN_KEY);
          entity = await User.findById(decoded.id);
          userRole = decoded.role;

          if (!entity) {
            console.log('User not found in database');
            return res.status(403).json({
              success: false,
              message: 'User not found',
              code: 'USER_NOT_FOUND',
            });
          }

          if (entity.isBlocked) {
            console.log('User account is blocked');
            return res.status(403).json({
              success: false,
              message: 'Account is blocked',
              code: 'USER_BLOCKED',
            });
          }
        } catch (error) {
          console.warn('User token verification failed:', error.message);
        }
      }

      // If user token fails, check admin token
      if ( adminAccessToken) {
        try {
          decoded = jwt.verify(adminAccessToken, process.env.TOKEN_KEY);
          entity = await Admin.findById(decoded.id);
          userRole = decoded.role;

          if (!entity) {
            console.log('Admin not found in database');
            return res.status(403).json({
              success: false,
              message: 'Admin not found',
              code: 'ADMIN_NOT_FOUND',
            });
          }
        } catch (error) {
          console.warn('Admin token verification failed:', error.message);
          return res.status(403).json({
            success: false,
            message: 'Invalid or expired admin token',
            code: 'TOKEN_INVALID',
          });
        }
      }

      // If no valid user/admin found, reject the request
      if (!entity) {
        console.log('No valid user or admin found');
        return res.status(401).json({
          success: false,
          message: 'Access denied, invalid token',
          code: 'TOKEN_INVALID',
        });
      }

      // Check if the role is allowed
      if (!allowedRoles.includes(userRole)) {
        console.log(`Role ${userRole} not authorized for this route`);
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          code: 'ROLE_UNAUTHORIZED',
        });
      }

      console.log(`Authentication and authorization successful for ${userAccessToken ? 'user' : 'admin'}`);
      req.user = { id: entity._id, email: entity.email, password: entity.password, role: userRole };
      next();
    } catch (error) {
      console.error('Auth error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Authentication error',
        error: error.message,
        code: 'AUTH_ERROR',
      });
    }
  };
};

module.exports = authenticateWithRole;
