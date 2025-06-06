const { OAuth2Client } = require("google-auth-library");
const bcrypt = require("bcrypt");
const { nanoid } = require("nanoid");
const jwt = require("jsonwebtoken");
//models
const User = require("../../models/userModel");
const Admin = require("../../models/adminModel");
const OTP = require("../../models/otpModel");
const RefreshToken = require("../../models/refreshTokenModel");
const Wallet = require("../../models/walletModel");

//utils
const setCookie = require("../../utils/jwt/setCookie");
const hashPassword = require("../../utils/hashPassword");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../utils/jwt/generateToken");
const generateOTP = require("../../utils/otp/generateOTP");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleAuth = async (req, res) => {
  const { token } = req.body;
  console.log("Received Token from google auth:", token);

  try {
    const ticket = await client.verifyIdToken({
      idToken: token.token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      // Generate unique referral code
      let referralCode = nanoid(8).toUpperCase();
      let existingReferral = await User.findOne({ referralCode });
      while (existingReferral) {
        referralCode = nanoid(8).toUpperCase();
        existingReferral = await User.findOne({ referralCode });
      }

      user = await User.create({
        username: name,
        email,
        googleId,
        image_url: picture,
        referralCode,
        isVerified: true,
      });

      // Create wallet for the new user
      await Wallet.create({
        user: user._id,
        balance: 0,
        transactions: [],
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    if (user.isBlocked) {
      return res
        .status(403)
        .json({ success: false, message: "Account is blocked" });
    }

    const userData = { id: user._id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(userData, "User");
    const refreshToken = generateRefreshToken(userData, "User");

    await RefreshToken.create({
      token: refreshToken,
      userId: user._id,
      expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    });

    setCookie("userRefreshToken", refreshToken, 15 * 24 * 60 * 60 * 1000, res);
    setCookie("userAccessToken", accessToken, 90 * 60 * 1000, res);

    res.json({
      success: true,
      message: "Google login successful",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        image_url: user.image_url,
        referralCode: user.referralCode,
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res
      .status(401)
      .json({ success: false, message: "Google authentication failed" });
  }
};



const checkAuth = async (req, res) => {
  console.log("call received at the bacckend for check auth");

  console.log("req.cookies.userAccessToken");
  const token = req.cookies.userAccessToken;
  
  const adminToken = req.cookies.adminAccessToken;
  if (!token && !adminToken) {
    console.log("No admin token or user token");
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.TOKEN_KEY);
      const user = await User.findById(decoded.id);
      console.log("user data from check auth", user);

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
      if (user.isBlocked) {
        return res
          .status(403)
          .json({ success: false, message: "Account is blocked" });
      }
      res.json({
        success: true,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          image_url: user.image_url,
        },
      });
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ success: false, message: "Token expired" });
      }
      res.status(403).json({ success: false, message: "Invalid token" });
    }
  }
  if (adminToken) {
    try {
      const decoded = jwt.verify(adminToken, process.env.TOKEN_KEY);
      const admin = await Admin.findById(decoded.id);
      if (!admin) {
        return res
          .status(404)
          .json({ success: false, message: "Admin not found" });
      }
      if (admin.isBlocked) {
        return res
          .status(403)
          .json({ success: false, message: "Account is blocked" });
      }
      res.status(200).json({
        success: true,
        admin: {
          _id: admin._id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
          image_url: admin.image_url,
        },
      });
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ success: false, message: "Token expired" });
      }
      res.status(403).json({ success: false, message: "Invalid token" });
    }
  }
};

const refreshToken = async (req, res) => {
  console.log("Refresh token request received at user controller");
  const oldRefreshToken = req.cookies.userRefreshToken;

  if (!oldRefreshToken) {
    console.log("No refresh token found in cookies");
    return res
      .status(401)
      .json({ success: false, message: "No refresh token provided" });
  }

  try {
    console.log("Verifying refresh token...",oldRefreshToken);
    // Verify the stored refresh token
    const storedToken = await RefreshToken.findOne({ token: oldRefreshToken });
    if (!storedToken) {
      console.log("Refresh token not found in database");
      return res
        .status(403)
        .json({ success: false, message: "Invalid refresh token" });
    }

    if (storedToken.expiresAt < new Date()) {
      console.log("Refresh token expired in database");
      await RefreshToken.deleteOne({ token: oldRefreshToken });
      return res
        .status(403)
        .json({ success: false, message: "Refresh token expired" });
    }
    console.log('refresh token verified successfully');
    
    // Verify the JWT refresh token
    console.log("Verifying JWT token...");
    const decoded = jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_KEY);
    const user = await User.findById(decoded.id);

    if (!user) {
      console.log("User not found for refresh token");
      await RefreshToken.deleteOne({ token: oldRefreshToken });
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.isBlocked) {
      console.log("Blocked user attempted to refresh token,responded with 403");
      await RefreshToken.deleteOne({ token: oldRefreshToken });
      return res
        .status(403)
        .json({ success: false, message: "Account is blocked" });
    }

    // Generate new tokens
    console.log("Generating new tokens...");
    const userData = { id: user._id, email: user.email, role: user.role };
    const newAccessToken = generateAccessToken(userData, "User");
    const newRefreshToken = generateRefreshToken(userData, "User");

    // Delete old refresh token and save new one
    await RefreshToken.deleteOne({ token: oldRefreshToken });
    await RefreshToken.create({
      token: newRefreshToken,
      userId: user._id,
      expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), 
    });

    // Set new cookies
    setCookie(
      "userRefreshToken",
      newRefreshToken,
      15 * 24 * 60 * 60 * 1000,
      res
    );
    setCookie("userAccessToken", newAccessToken, 90 * 60 * 1000, res);

    console.log("Token refresh successful");
    res.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        image_url: user.image_url,
      },
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    // Clean up invalid refresh token if present
    if (oldRefreshToken) {
      await RefreshToken.deleteOne({ token: oldRefreshToken }).catch(
        console.error
      );
    }

    if (error.name === "JsonWebTokenError") {
      return res
        .status(403)
        .json({ success: false, message: "Invalid refresh token" });
    }
    if (error.name === "TokenExpiredError") {
      return res
        .status(403)
        .json({ success: false, message: "Refresh token expired" });
    }
    res.status(500).json({
      success: false,
      message: "Token refresh failed",
      error: error.message,
    });
  }
};


const signup = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username?.trim() || !email?.trim() || !password?.trim()) {
    return res.status(400).json({
      success: false,
      message: "Username, email, and password are required",
    });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });
    }

    // Generate unique referral code
    let referralCode = nanoid(8).toUpperCase();
    let existingReferral = await User.findOne({ referralCode });
    while (existingReferral) {
      referralCode = nanoid(8).toUpperCase();
      existingReferral = await User.findOne({ referralCode });
    }

    const securePassword = await hashPassword(password);
    const newUser = await User.create({
      username,
      email,
      password: securePassword,
      referralCode,
      isVerified: false,
    });

    // Create wallet for the new user
    await Wallet.create({
      user: newUser._id,
      balance: 0,
      transactions: [],
    });

    const otp = generateOTP();
    await OTP.create({
      email,
      otp,
      type: "signup",
    });

    res.status(201).json({
      success: true,
      message: "User registered. Please verify your email with the OTP sent.",
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        referralCode: newUser.referralCode,
      },
    });
  } catch (error) {
    console.error("User signup error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong", error });
  }
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpEntry = await OTP.findOne({ email, otp, type: "signup" });
    if (!otpEntry) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    const user = await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    await OTP.deleteOne({ _id: otpEntry._id });

    const userData = { id: user._id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(userData, "User");
    const refreshToken = generateRefreshToken(userData, "User");

    await RefreshToken.create({
      token: refreshToken,
      userId: user._id,
      expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    });

    setCookie("userRefreshToken", refreshToken, 15 * 24 * 60 * 60 * 1000, res);
    setCookie("userAccessToken", accessToken, 90 * 60 * 1000, res);

    res.json({
      success: true,
      message: "Email verified successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong", error });
  }
};

const verifyResetOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpEntry = await OTP.findOne({ email, otp, type: "reset" });
    if (!otpEntry) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    if (!otpEntry.tempPassword) {
      return res.status(400).json({
        success: false,
        message: "No new password set. Please start over.",
      });
    }

    const user = await User.findOneAndUpdate(
      { email },
      { password: otpEntry.tempPassword },
      { new: true }
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    await OTP.deleteOne({ _id: otpEntry._id });

    res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset OTP verification error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong", error });
  }
};

const resendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "User already verified" });
    }

    await OTP.deleteMany({ email, type: "signup" });
    const otp = generateOTP();
    await OTP.create({
      email,
      otp,
      type: "signup",
    });

    res.json({ success: true, message: "New OTP sent successfully" });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong", error });
  }
};

// Forget Password
const forgetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: "Email verified. Please proceed to reset your password.",
    });
  } catch (error) {
    console.error("Forget password error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong", error });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Delete any existing reset OTPs
    await OTP.deleteMany({ email, type: "reset" });

    // Generate and store OTP with temp password
    const otp = generateOTP();
    await OTP.create({
      email,
      otp,
      type: "reset",
      tempPassword: await hashPassword(password), // Store hashed password
    });

    res.json({
      success: true,
      message: "OTP sent to your email. Please verify to reset your password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong", error });
  }
};

// Login
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userExist = await User.findOne({ email });
    if (!userExist) {
      return res.status(404).json({
        success: false,
        message: "User doesn't exist. Please create a new account.",
      });
    }
    if (!userExist.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in.",
        isVerify: true,
      });
    }
    if (userExist.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Account is blocked. Please contact support.",
      });
    }
    const isPasswordCorrect = await bcrypt.compare(
      password,
      userExist.password
    );
    if (!isPasswordCorrect) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect Password" });
    }
    const userData = {
      id: userExist._id,
      email: userExist.email,
      role: userExist.role,
    };
    const accessToken = generateAccessToken(userData, "User");
    const refreshToken = generateRefreshToken(userData, "User");

    await RefreshToken.create({
      token: refreshToken,
      userId: userExist._id,
      expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    });

    setCookie("userRefreshToken", refreshToken, 15 * 24 * 60 * 60 * 1000, res);
    setCookie("userAccessToken", accessToken, 90 * 60 * 1000, res);

    return res.json({
      success: true,
      message: "Login successful",
      user: {
        _id: userExist._id,
        name: userExist.username,
        email: userExist.email,
        role: userExist.role,
      },
    });
  } catch (error) {
    console.error("User login error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong", error });
  }
};

const logout = async (req, res) => {
  try {
    const userRefreshToken = req.cookies.userRefreshToken;
    if (userRefreshToken) {
      await RefreshToken.deleteOne({ token: userRefreshToken });
    }
    setCookie("userRefreshToken", "", 0, res);
    setCookie("userAccessToken", "", 0, res);
    res
      .status(200)
      .json({ success: true, message: "User logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ success: false, message: "Logout failed" });
  }
};

module.exports = {
  signup,
  login,
  refreshToken,
  logout,
  verifyOTP,
  resendOTP,
  forgetPassword,
  resetPassword,
  verifyResetOTP,
  googleAuth,
  checkAuth,
};
