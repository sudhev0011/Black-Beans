const dotenv = require('dotenv');
dotenv.config();
const jwt = require('jsonwebtoken');

const generateAccessToken = (data, model) => {
  try {
    const payload = { id: data.id, email: data.email, role: data.role };
    if (model === 'Admin') {
      console.log('Generating access token for admin with expiration:', process.env.ACCESS_TOKEN_EXPIRATION);
      return jwt.sign(payload, process.env.TOKEN_KEY, { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION });
    }
    console.log('Generating access token for user with expiration:', process.env.ACCESS_TOKEN_EXPIRATION);
    return jwt.sign(payload, process.env.TOKEN_KEY, { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION });
  } catch (error) {
    console.error('Error generating access token:', error);
    throw error;
  }
};

const generateRefreshToken = (data, model) => {
  try {
    const payload = { id: data.id, email: data.email, role: data.role };
    if (model === 'Admin') {
      console.log('Generating refresh token for admin with expiration:', process.env.REFRESH_TOKEN_EXPIRATION);
      return jwt.sign(payload, process.env.REFRESH_TOKEN_KEY, { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION });
    }
    console.log('Generating refresh token for user with expiration:', process.env.REFRESH_TOKEN_EXPIRATION);
    return jwt.sign(payload, process.env.REFRESH_TOKEN_KEY, { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION });
  } catch (error) {
    console.error('Error generating refresh token:', error);
    throw error;
  }
};

module.exports = { generateAccessToken, generateRefreshToken };