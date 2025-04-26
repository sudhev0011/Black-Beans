const Coupon = require("../../models/couponModel");
const Order = require("../../models/orderModel");
const ReferralCoupon = require("../../models/referralCouponModel");
const mongoose = require('mongoose')
// Create a new coupon (Admin)
const createCoupon = async (req, res) => {
    try {
      const {
        code,
        discountType,
        discountValue,
        minPurchase,
        startDate,
        endDate,
        usageLimit,
        restrictions,
        description,
      } = req.body;
  
      if (!code || !discountType || !discountValue || !startDate || !endDate || !usageLimit) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
      }

      if(discountType === 'percentage' && discountValue > 80){
        return res.status(422).json({success: false, message: 'cannot set discount percentage above 80% please set a value!'});
      }
  
      const coupon = new Coupon({
        code,
        discountType,
        discountValue,
        minPurchase: minPurchase || 0,
        startDate,
        endDate,
        usageLimit,
        restrictions: {
          newCustomersOnly: restrictions?.newCustomersOnly || false,
          onePerCustomer: restrictions?.onePerCustomer || false,
        },
        description,
      });
  
      const createdCoupon = await coupon.save();
      res.status(201).json(createdCoupon);
    } catch (error) {
      console.error("Create coupon error:", error);
      res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
    }
  };
  
  // Get all coupons (Admin)
  const getCoupons = async (req, res) => {
    try {
      const { search, status, page = 1, limit = 10 } = req.query;
  
      const query = {};
      if (search) {
        query.code = { $regex: search, $options: "i" };
      }
      if (status) {
        query.status = status;
      }
  
      const coupons = await Coupon.find(query)
        .skip((page - 1) * limit)
        .limit(Number(limit)).sort({createdAt: -1})
        .lean();
  
      const total = await Coupon.countDocuments(query);
  
      res.json({
        coupons,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      console.error("Get coupons error:", error);
      res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
    }
  };
  
  // Update a coupon (Admin)
  const updateCoupon = async (req, res) => {
    try {
      const coupon = await Coupon.findById(req.params.id);
  
      if (!coupon) {
        return res.status(404).json({ success: false, message: "Coupon not found" });
      }
  
      const {
        code,
        discountType,
        discountValue,
        minPurchase,
        startDate,
        endDate,
        usageLimit,
        restrictions,
        description,
      } = req.body;
  
      coupon.code = code || coupon.code;
      coupon.discountType = discountType || coupon.discountType;
      coupon.discountValue = discountValue || coupon.discountValue;
      coupon.minPurchase = minPurchase !== undefined ? minPurchase : coupon.minPurchase;
      coupon.startDate = startDate || coupon.startDate;
      coupon.endDate = endDate || coupon.endDate;
      coupon.usageLimit = usageLimit || coupon.usageLimit;
      coupon.restrictions = {
        newCustomersOnly: restrictions?.newCustomersOnly ?? coupon.restrictions.newCustomersOnly,
        onePerCustomer: restrictions?.onePerCustomer ?? coupon.restrictions.onePerCustomer,
      };
      coupon.description = description || coupon.description;
  
      const updatedCoupon = await coupon.save();
      res.json(updatedCoupon);
    } catch (error) {
      console.error("Update coupon error:", error);
      res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
    }
  };
  
  // Delete a coupon (Admin)
  const deleteCoupon = async (req, res) => {
    try {
      const coupon = await Coupon.findById(req.params.id);
  
      if (!coupon) {
        return res.status(404).json({ success: false, message: "Coupon not found" });
      }
  
      await coupon.deleteOne();
      res.json({ success: true, message: "Coupon deleted successfully" });
    } catch (error) {
      console.error("Delete coupon error:", error);
      res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
    }
  };
  
  const applyCoupon = async (req, res) => {
    try {
      const { code, subtotal, shipping, userId } = req.body;
  
      if (!code || !subtotal || !userId) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
      }
  
      let coupon = await Coupon.findOne({ code: code.toUpperCase() });
      let isReferral = false;
  
      if (!coupon) {
        coupon = await ReferralCoupon.findOne({ code: code.toUpperCase() });
        isReferral = true;
        if (!coupon || coupon.user.toString() !== userId) {
          return res.status(400).json({ success: false, message: "Invalid coupon code" });
        }
      }
  
      const now = new Date();
      if (!isReferral && (now < coupon.startDate || now > coupon.endDate)) {
        return res.status(400).json({ success: false, message: "This coupon has expired" });
      }
  
      if (coupon.status === "Expired" || coupon.usageCount >= coupon.usageLimit) {
        return res.status(400).json({ success: false, message: "This coupon has reached its usage limit or is expired" });
      }
  
      if (coupon.minPurchase > subtotal) {
        return res.status(400).json({
          success: false,
          message: `This coupon requires a minimum purchase of ₹${coupon.minPurchase}`,
        });
      }
  
      if (coupon.restrictions.newCustomersOnly) {
        const hasPreviousOrders = await Order.exists({ user: userId });
        if (hasPreviousOrders) {
          return res.status(400).json({ success: false, message: "This coupon is only for new customers" });
        }
      }
  
      if (coupon.restrictions.onePerCustomer) {
        const hasUsedCoupon = await Order.exists({
          user: userId,
          "appliedCoupons.code": coupon.code,
        });
        if (hasUsedCoupon) {
          return res.status(400).json({
            success: false,
            message: "This coupon can only be used once per customer",
          });
        }
      }
  
      let discount = 0;
      if (coupon.discountType === "percentage" || coupon.discountType === "referral") {
        discount = (subtotal * coupon.discountValue) / 100;
      } else if (coupon.discountType === "fixed") {
        discount = coupon.discountValue;
      } else if (coupon.discountType === "shipping") {
        discount = shipping || 0;
      }
  
      discount = Math.min(discount, subtotal);
  
      res.json({
        success: true,
        coupon: {
          id: coupon._id,
          code: coupon.code,
          discount: coupon.discountType === "percentage" || coupon.discountType === "referral"
            ? `${coupon.discountValue}% off`
            : coupon.discountType === "fixed"
              ? `₹${coupon.discountValue} off`
              : "Free Shipping",
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          minPurchase: coupon.minPurchase,
          validUntil: isReferral ? null : coupon.endDate,
          description: coupon.description,
        },
        discount,
        message: "Coupon applied successfully",
      });
    } catch (error) {
      console.error("Apply coupon error:", error);
      res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
    }
  };
  
  const getAvailableCoupons = async (req, res) => {
    try {
      const { subtotal, userId } = req.query;
  
      const regularCoupons = await Coupon.find({
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
        minPurchase: { $lte: Number(subtotal) || 0 },
        $expr: { $lt: ["$usageCount", "$usageLimit"] },
      }).lean();
  
      const referralCoupons = await ReferralCoupon.find({
        user: userId,
        minPurchase: { $lte: Number(subtotal) || 0 },
        $expr: { $lt: ["$usageCount", "$usageLimit"] },
        status: "Active",
      }).lean();
  
      const coupons = [...regularCoupons, ...referralCoupons];
  
      res.json(
        coupons.map((coupon) => ({
          id: coupon._id,
          code: coupon.code,
          discount:
            coupon.discountType === "percentage" || coupon.discountType === "referral"
              ? `${coupon.discountValue}% off`
              : coupon.discountType === "fixed"
                ? `₹${coupon.discountValue} off`
                : "Free Shipping",
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          minPurchase: coupon.minPurchase,
          validUntil: coupon.discountType === "referral" ? null : coupon.endDate,
          description: coupon.description,
        }))
      );
    } catch (error) {
      console.error("Get available coupons error:", error);
      res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
    }
  };











  module.exports = {
    createCoupon,
    getCoupons,
    updateCoupon,
    deleteCoupon,
    applyCoupon,
    getAvailableCoupons,
  };