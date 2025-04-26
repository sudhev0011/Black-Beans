const User = require("../../models/userModel");
const OTP = require("../../models/otpModel");
const cloudinaryDeleteImages = require("../../utils/cloudinary/deleteImages");
const {
  cloudinaryImageUploadMethod,
} = require("../../utils/cloudinary/cloudinaryUpload");
const comparePass = require("../../utils/comparePassword");
const hashedPassword = require("../../utils/hashPassword");
const generateOTP = require("../../utils/otp/generateOTP");

const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params; // Get user ID from request params

    if (!userId) {
      return res.status(404).json({ success: false, message: "No userid" });
    }

    const user = await User.findById(userId)
      .select("-password")
      .populate("address", "addressLine city state");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        image_url: user.image_url,
        isVerified: user.isVerified,
        isBlocked: user.isBlocked,
        address: user.address,
      },
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong", error });
  }
};

const editProfile = async (req, res) => {
  const { userId } = req.params;
  const { email, username, phone, address } = req.body;

  try {
    const user = await User.findById({ _id: userId });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "user not found" });
    }
    if (user.isBlocked) {
      return res
        .status(403)
        .json({ success: false, message: "User is blocked" });
    }

    if (email) {
      const existingUser = await User.findOne({
        email: { $regex: new RegExp(`^${email}$`, "i") },
        _id: { $ne: userId },
      });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "User already exists with the same email",
        });
      }
    }

    // Update fields
    const updateData = {
      username: username || user.username,
      email: email || user.email,
      phone: phone || user.phone,
      address: address || user.address,
    };

    if (req.file) {
      try {
        const image_url = await cloudinaryImageUploadMethod(req.file.buffer);
        if (image_url) {
          updateData.image_url = image_url || "";
        }
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "error during couldinary upload",
          error,
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { ...updateData, updatedAt: Date.now() },
      { new: true }
    ).select("-password");
    res
      .status(200)
      .json({ success: true, updatedUser, message: "User profile updated." });
  } catch (error) {
    console.log("ERROR IN EDITING USER", error);
    res.status(500).json({ message: "Internal servere error", error });
  }
};

const changePassword = async (req, res) => {
  const { newPassword, currentPassword } = req.body;

  if (!newPassword.trim() || !currentPassword.trim()) {
    return res
      .status(400)
      .json({ sussess: false, message: "Missing required fields" });
  }
  const trimmedCurrentPassword = currentPassword?.trim();
  const trimmedNewPassword = newPassword?.trim();
  const trimmedConfirmPassword = confirmPassword?.trim();

  if (!trimmedCurrentPassword) {
    return res
      .status(400)
      .json({ success: false, message: "Current password is required" });
  }

  if (!trimmedNewPassword) {
    return res
      .status(400)
      .json({ success: false, message: "New password is required" });
  } else if (trimmedNewPassword.length < 8 || trimmedNewPassword.length > 32) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Password must be between 8 and 32 characters",
      });
  } else if (!passwordRegex.test(trimmedNewPassword)) {
    return res
      .status(400)
      .json({
        success: false,
        message:
          "Password must contain uppercase, lowercase, number, and special character",
      });
  } else if (trimmedNewPassword === trimmedCurrentPassword) {
    return res
      .status(400)
      .json({
        success: false,
        message: "New password must be different from current password",
      });
  }

  if (!trimmedConfirmPassword) {
    return res
      .status(400)
      .json({ success: false, message: "Please confirm your new password" });
  } else if (trimmedNewPassword !== trimmedConfirmPassword) {
    return res
      .status(400)
      .json({ success: false, message: "Passwords do not match" });
  }
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ sussess: false, message: "User not found" });
    }

    const passwordMatch = await comparePass(currentPassword, user.password);
    if (!passwordMatch) {
      return res.status(400).json({
        sussess: false,
        message: "Current password is incorrect",
      });
    }

    const checkOld = await comparePass(newPassword, user.password);
    if (checkOld) {
      return res.status(400).json({
        sussess: false,
        message: "New password cannot be same as old password",
      });
    }

    const hashedNewPassword = await hashedPassword(newPassword);
    user.password = hashedNewPassword;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const sendEmailChangeOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== req.user?.id) {
      return res
        .status(409)
        .json({ success: false, message: "Email already in use" });
    }

    await OTP.deleteMany({ email, type: "email_change" });
    const otp = generateOTP();
    await OTP.create({
      email,
      otp,
      type: "email_change",
    });

    res.json({ success: true, message: "Verification email sent" });
  } catch (error) {
    console.error("Send email change OTP error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong", error });
  }
};

// Verify Email Change OTP
const verifyEmailChangeOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpEntry = await OTP.findOne({ email, otp, type: "email_change" });
    if (!otpEntry) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    const user = await User.findOneAndUpdate(
      { _id: req.user.id }, // Assumes user is authenticated
      { email, isVerified: true },
      { new: true }
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    await OTP.deleteOne({ _id: otpEntry._id });

    res.json({
      success: true,
      message: "Email updated successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Verify email change OTP error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong", error });
  }
};

module.exports = {
  getUserDetails,
  editProfile,
  changePassword,
  sendEmailChangeOTP,
  verifyEmailChangeOTP,
};
