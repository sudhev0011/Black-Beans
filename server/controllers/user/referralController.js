// const { nanoid } = require("nanoid");
// const User = require("../../models/userModel");
// const ReferralCoupon = require("../../models/referralCouponModel");

// const applyReferralCode = async (req, res) => {
//   const { referralCode } = req.body;
//   const userId = req.user.id;

//   try {
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     if (!user.isVerified) {
//       return res.status(403).json({
//         success: false,
//         message: "Please verify your email before applying a referral code",
//       });
//     }

//     if (user.referredBy) {
//       return res.status(400).json({
//         success: false,
//         message: "Referral code already applied",
//       });
//     }

//     const referrer = await User.findOne({ referralCode });
//     if (!referrer) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid referral code",
//       });
//     }

//     if (referrer._id.equals(user._id)) {
//       return res.status(400).json({
//         success: false,
//         message: "You cannot use your own referral code",
//       });
//     }

//     // Update user and referrer
//     user.referredBy = referralCode;
//     user.referralBonusApplied = true;
//     referrer.referredUsers.push(user._id);
//     user.isFirstUser = false;
//     await Promise.all([user.save(), referrer.save()]);

//     // Create referral coupon (10% off, one-time use)
//     const couponCode = nanoid(10).toUpperCase();
//     const coupon = new ReferralCoupon({
//       code: couponCode,
//       discountValue: 10,
//       minPurchase: 0,
//       usageLimit: 1,
//       usageCount: 0,
//       user: user._id,
//       restrictions: {
//         newCustomersOnly: true,
//         onePerCustomer: true,
//       },
//       description: "Referral discount for new customers",
//     });

//     await coupon.save();

//     res.status(200).json({
//       success: true,
//       message: "Referral code applied successfully. Coupon issued.",
//       coupon: {
//         code: coupon.code,
//         discountType: coupon.discountType,
//         discountValue: coupon.discountValue,
//         description: coupon.description,
//       },
//     });
//   } catch (error) {
//     console.error("Apply referral code error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Something went wrong",
//       error,
//     });
//   }
// };

// module.exports = { applyReferralCode };

//above is the code withput any email functionalities rollback to it if anything goes wrong




const { nanoid } = require("nanoid");
const User = require("../../models/userModel");
const ReferralCoupon = require("../../models/referralCouponModel");
const Wallet = require("../../models/walletModel");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const applyReferralCode = async (req, res) => {
  const { referralCode } = req.body;
  
  const userId = req.user.id;
  
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before applying a referral code",
      });
    }
    
    if (user.referredBy) {
      return res.status(400).json({
        success: false,
        message: "Referral code already applied",
      });
    }
    
    const referrer = await User.findOne({ referralCode });
    if (!referrer) {
      return res.status(400).json({
        success: false,
        message: "Invalid referral code",
      });
    }

    if (referrer._id.equals(user._id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot use your own referral code",
      });
    }

    user.referredBy = referralCode;
    user.referralBonusApplied = true;
    referrer.referredUsers.push(user._id);
    user.isFirstUser = false;
    await Promise.all([user.save(), referrer.save()]);

    const couponCode = nanoid(10).toUpperCase();
    const coupon = new ReferralCoupon({
      code: couponCode,
      discountValue: 10,
      minPurchase: 0,
      usageLimit: 1,
      usageCount: 0,
      user: user._id,
      restrictions: {
        newCustomersOnly: true,
        onePerCustomer: true,
      },
      description: "Referral discount for new customers",
    });

    await coupon.save();

    res.status(200).json({
      success: true,
      message: "Referral code applied successfully. Coupon issued.",
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        description: coupon.description,
      },
    });
  } catch (error) {
    console.error("Apply referral code error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

const getReferrals = async (req, res) => {
console.log("hit the backend controler");

  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate("referredUsers");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const wallet = await Wallet.findOne({ user: userId });
    const referralHistory = await Promise.all(
      user.referredUsers.map(async (referredUser) => {
        const referredWallet = await Wallet.findOne({ user: referredUser._id });
        const rewardTransaction = referredWallet?.transactions.find(
          (t) => t.description.includes("Referral bonus") && t.orderId
        );

        return {
          id: `REF-${nanoid(6)}`,
          name: referredUser.username || "Unknown",
          email: referredUser.email,
          status: rewardTransaction ? "completed" : "pending",
          date: referredUser.createdAt,
          reward: rewardTransaction ? 500 : 0,
        };
      })
    );

    const totalEarned = wallet?.transactions
      .filter((t) => t.description.includes("Referral bonus") && t.type === "credit")
      .reduce((sum, t) => sum + t.amount, 0) || 0;

    const pendingEarned = referralHistory
      .filter((r) => r.status === "pending")
      .reduce((sum, r) => sum + 500, 0);

    res.status(200).json({
      success: true,
      referrals: {
        code: user.referralCode,
        totalEarned,
        pendingEarned,
        referralLink: `${process.env.FRONTEND_URL}/signup?ref=${user.referralCode}`,
        rewards: {
          referrerReward: "₹500 wallet credit",
          refereeReward: "10% off first purchase",
        },
        history: referralHistory,
      },
    });
  } catch (error) {
    console.error("Get referrals error:", error);
    res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
  }
};

const sendReferralInvite = async (req, res) => {
  try {
    const { email } = req.body;
    const userId = req.user.id;

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email address" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const referralLink = `${process.env.FRONTEND_URL}/signup?ref=${user.referralCode}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `${user.username} invited you to join our store!`,
      html: `
        <h2>Join Our Store and Save!</h2>
        <p>${user.username} has invited you to shop at our store. Sign up using their referral link to get <strong>10% off your first purchase</strong>!</p>
        <p><a href="${referralLink}">Click here to sign up</a></p>
        <p>Use referral code: <strong>${user.referralCode}</strong></p>
        <p>Happy shopping!</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: `Referral invitation sent to ${email}` });
  } catch (error) {
    console.error("Send referral invite error:", error);
    res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
  }
};

module.exports = { applyReferralCode, getReferrals, sendReferralInvite };