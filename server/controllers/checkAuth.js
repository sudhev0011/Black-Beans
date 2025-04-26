const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Admin = require('../models/adminModel');


const checkAuth = async (req, res) => {
  console.log("call received at the bacckend for check auth");
  const token = req.cookies.userAccessToken;
  const adminToken = req.cookies.adminAccessToken;
  if (!token && !adminToken) {
    console.log('No admin token or user token');
    return res.status(401).json({ success: false, message: "No token provided" });
  }


  if(token){
    try {
      const decoded = jwt.verify(token, process.env.TOKEN_KEY);
      const user = await User.findById(decoded.id);
      // console.log('user data from check auth',user);
      
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

      // Convert created_at to Month Year format
    const formattedDate = new Date(user.created_at).toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });
      res.json({
        success: true,
        user: {
          _id: user._id,
          googleId:user.googleId,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
          image_url: user.image_url,
          joinDate: formattedDate,
          isFirstUser: user.isFirstUser
        },
      });
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ success: false, message: "Token expired" });
      }
      res.status(403).json({ success: false, message: "Invalid token" });
    }
  }
  if(adminToken){
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
        return res.status(401).json({ success: false, message: "Token expired" });
      }
      res.status(403).json({ success: false, message: "Invalid token" });
    }
  }
};



module.exports = {checkAuth}