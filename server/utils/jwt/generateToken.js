const dotenv = require('dotenv');
dotenv.config();
const jwt = require('jsonwebtoken');

// User token secrets and expirations
const USER_ACCESS_TOKEN_SECRET = process.env.TOKEN_KEY;
const USER_REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_KEY;
const USER_ACCESS_EXPIRATION = '2m'; // 2 minutes
const USER_REFRESH_EXPIRATION = '15d'; // 15 days

// Admin token secrets and expirations
const ADMIN_ACCESS_TOKEN_SECRET = process.env.ADMIN_TOKEN_KEY;
const ADMIN_REFRESH_TOKEN_SECRET = process.env.ADMIN_REFRESH_TOKEN_KEY;
const ADMIN_ACCESS_EXPIRATION = '2m'; // 2 minutes
const ADMIN_REFRESH_EXPIRATION = '15d'; // 15 days

const generateAccessToken = (data, model) => {
  try {
    const payload = { id: data.id, email: data.email, role: data.role };
    if (model === 'Admin') {
      console.log('Generating access token for admin with expiration:', ADMIN_ACCESS_EXPIRATION);
      return jwt.sign(payload, ADMIN_ACCESS_TOKEN_SECRET, { expiresIn: process.env.ADMIN_ACCESS_TOKEN_EXPIRATION });
    }
    console.log('Generating access token for user with expiration:', USER_ACCESS_EXPIRATION);
    return jwt.sign(payload, USER_ACCESS_TOKEN_SECRET, { expiresIn: USER_ACCESS_EXPIRATION });
  } catch (error) {
    console.error('Error generating access token:', error);
    throw error;
  }
};

const generateRefreshToken = (data, model) => {
  try {
    const payload = { id: data.id, email: data.email, role: data.role };
    if (model === 'Admin') {
      console.log('Generating refresh token for admin with expiration:', ADMIN_REFRESH_EXPIRATION);
      return jwt.sign(payload, ADMIN_REFRESH_TOKEN_SECRET, { expiresIn: ADMIN_REFRESH_EXPIRATION });
    }
    console.log('Generating refresh token for user with expiration:', USER_REFRESH_EXPIRATION);
    return jwt.sign(payload, USER_REFRESH_TOKEN_SECRET, { expiresIn: USER_REFRESH_EXPIRATION });
  } catch (error) {
    console.error('Error generating refresh token:', error);
    throw error;
  }
};

module.exports = { generateAccessToken, generateRefreshToken };