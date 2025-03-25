const bcrypt = require('bcrypt');
const Admin = require('../../models/adminModel');
const RefreshToken = require('../../models/refreshTokenModel');
const { generateAccessToken, generateRefreshToken } = require('../../utils/jwt/generateToken');
const setCookie = require('../../utils/jwt/setCookie');
const hashPassword = require('../../utils/hashPassword');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const registerAdmin = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: 'Admin already exists' });
    }
    const hashedPassword = await hashPassword(password);
    const admin = await Admin.create({ name, email, password: hashedPassword, role: 'admin' });
    const adminData = { id: admin._id, name: admin.name, email: admin.email, role: admin.role };

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      admin: adminData,
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ success: false, message: 'Error registering admin', error: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ success: false, message: 'Admin doesn\'t exist' });
    }
    const checkPassword = await bcrypt.compare(password, admin.password);
    if (!checkPassword) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    // Delete any existing refresh tokens for this admin
    await RefreshToken.deleteMany({ userId: admin._id });

    const adminData = { id: admin._id, email: admin.email, role: admin.role };
    const accessToken = generateAccessToken(adminData, 'Admin');
    const refreshToken = generateRefreshToken(adminData, 'Admin');
    
    // Store refresh token in database with expiration
    const refreshTokenExpiry = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // 15 days
    await RefreshToken.create({
      token: refreshToken,
      userId: admin._id,
      expiresAt: refreshTokenExpiry,
    });

    // Set cookies with proper expiration
    setCookie('adminRefreshToken', refreshToken, 15 * 24 * 60 * 60 * 1000, res); // 15 days
    setCookie('adminAccessToken', accessToken, 30 * 60 * 1000, res); // 2 minutes
    console.log('Admin login successful, tokens set:', {
      accessTokenExpiry: '30 minutes',
      refreshTokenExpiry: refreshTokenExpiry.toISOString()
    });

    res.status(200).json({
      success: true,
      message: 'Admin logged in successfully',
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
};

const adminRefreshToken = async (req, res) => {
  console.log('Refresh token request received');
  const refreshToken = req.cookies?.adminRefreshToken;
  
  if (!refreshToken) {
    console.log('No refresh token in cookies');
    return res.status(401).json({ success: false, message: 'No refresh token provided' });
  }

  try {
    // Verify the stored refresh token
    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken) {
      console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%\nRefresh token not found in database');
      return res.status(403).json({ success: false, message: 'Invalid refresh token' });
    }

    if (storedToken.expiresAt < new Date()) {
      console.log('Refresh token expired in database');
      await RefreshToken.deleteOne({ _id: storedToken._id });
      return res.status(403).json({ success: false, message: 'Refresh token expired' });
    }

    // Verify JWT and extract admin data
    console.log('Verifying refresh token JWT...');
    const decoded = jwt.verify(refreshToken, process.env.ADMIN_REFRESH_TOKEN_KEY);
    const admin = await Admin.findById(decoded.id);
    
    if (!admin) {
      console.log('Admin not found for refresh token');
      await RefreshToken.deleteOne({ _id: storedToken._id });
      return res.status(403).json({ success: false, message: 'Admin not found' });
    }

    // Generate new access token with admin data
    console.log('Generating new access token for admin:', admin._id);
    const adminData = { id: admin._id, email: admin.email, role: admin.role };
    const newAccessToken = generateAccessToken(adminData, 'Admin');
    
    // Set new access token cookie with proper expiration
    setCookie('adminAccessToken', newAccessToken, 30 * 60 * 1000, res); // 2 minutes
    console.log('New access token generated and set in cookie');
    res.status(200).json({ 
      success: true, 
      message: 'Access token refreshed successfully',
      admin: adminData
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ success: false, message: 'Invalid refresh token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ success: false, message: 'Refresh token expired' });
    }
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.adminRefreshToken;
    if (refreshToken) {
      await RefreshToken.deleteOne({ token: refreshToken });
    }
    
    // Clear both cookies
    setCookie('adminRefreshToken', '', 0, res);
    setCookie('adminAccessToken', '', 0, res);
    
    console.log('Admin logged out successfully, cookies cleared');
    res.status(200).json({ success: true, message: 'Admin logged out successfully' });
  } catch (error) {
    console.error('Admin logout error:', error);
    res.status(500).json({ success: false, message: 'Logout failed', error: error.message });
  }
};

module.exports = { registerAdmin, login, adminRefreshToken, logout };