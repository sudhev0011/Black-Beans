// controllers/dashboardController.js
const Order = require("../../models/orderModel");
const User = require("../../models/userModel");
const Product = require("../../models/productModel");
const mongoose = require("mongoose");

exports.getStatistics = async (req, res) => {
    try {
      const timeFilter = req.query.timeFilter || "monthly";
      let dateFilter = {};
  
      const now = new Date();
      if (timeFilter === "daily") {
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        dateFilter = { createdAt: { $gte: startOfDay } };
      } else if (timeFilter === "weekly") {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        dateFilter = { createdAt: { $gte: startOfWeek } };
      } else if (timeFilter === "monthly") {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilter = { createdAt: { $gte: startOfMonth } };
      } else if (timeFilter === "yearly") {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        dateFilter = { createdAt: { $gte: startOfYear } };
      }
  
      let previousPeriodFilter = {};
      if (timeFilter === "daily") {
        const previousDay = new Date(now);
        previousDay.setDate(previousDay.getDate() - 1);
        previousDay.setHours(0, 0, 0, 0);
        const endOfPreviousDay = new Date(now);
        endOfPreviousDay.setHours(0, 0, 0, 0);
        previousPeriodFilter = {
          createdAt: {
            $gte: previousDay,
            $lt: endOfPreviousDay,
          },
        };
      } else if (timeFilter === "weekly") {
        const startOfPreviousWeek = new Date(now);
        startOfPreviousWeek.setDate(now.getDate() - now.getDay() - 7);
        startOfPreviousWeek.setHours(0, 0, 0, 0);
        const endOfPreviousWeek = new Date(now);
        endOfPreviousWeek.setDate(now.getDate() - now.getDay());
        endOfPreviousWeek.setHours(0, 0, 0, 0);
        previousPeriodFilter = {
          createdAt: {
            $gte: startOfPreviousWeek,
            $lt: endOfPreviousWeek,
          },
        };
      } else if (timeFilter === "monthly") {
        const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        previousPeriodFilter = {
          createdAt: {
            $gte: startOfPreviousMonth,
            $lt: endOfPreviousMonth,
          },
        };
      } else if (timeFilter === "yearly") {
        const startOfPreviousYear = new Date(now.getFullYear() - 1, 0, 1);
        const endOfPreviousYear = new Date(now.getFullYear(), 0, 1);
        previousPeriodFilter = {
          createdAt: {
            $gte: startOfPreviousYear,
            $lt: endOfPreviousYear,
          },
        };
      }
  
      const revenueData = await Order.aggregate([
        { $match: { ...dateFilter, status: { $nin: ["cancelled", "failed", "processing"] } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]);
  
      const previousRevenueData = await Order.aggregate([
        { $match: { ...previousPeriodFilter, status: { $nin: ["cancelled", "failed"] } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]);
  
      // Get total orders
      const orderCount = await Order.countDocuments({
        ...dateFilter,
        status: { $nin: ["cancelled", "failed"] },
      });
  
      const previousOrderCount = await Order.countDocuments({
        ...previousPeriodFilter,
        status: { $nin: ["cancelled", "failed"] },
      });
  
      const activeUsersData = await Order.aggregate([
        { $match: dateFilter },
        { $group: { _id: "$user" } },
        { $count: "activeUsers" },
      ]);
  
      const previousActiveUsersData = await Order.aggregate([
        { $match: previousPeriodFilter },
        { $group: { _id: "$user" } },
        { $count: "activeUsers" },
      ]);
  
      const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;
      const previousRevenue = previousRevenueData.length > 0 ? previousRevenueData[0].total : 0;
      const revenuePercentChange =
        previousRevenue === 0 ? 0 : ((totalRevenue - previousRevenue) / previousRevenue) * 100;
  
      const orderPercentChange =
        previousOrderCount === 0 ? 0 : ((orderCount - previousOrderCount) / previousOrderCount) * 100;
  
      const activeUsers = activeUsersData.length > 0 ? activeUsersData[0].activeUsers : 0;
      const previousActiveUsers = previousActiveUsersData.length > 0 ? previousActiveUsersData[0].activeUsers : 0;
      const activeUsersPercentChange =
        previousActiveUsers === 0 ? 0 : ((activeUsers - previousActiveUsers) / previousActiveUsers) * 100;
  
      res.json({
        totalRevenue,
        totalOrders: orderCount,
        activeUsers,
        percentChanges: {
          revenue: revenuePercentChange.toFixed(1),
          orders: orderPercentChange.toFixed(1),
          activeUsers: activeUsersPercentChange.toFixed(1),
        },
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({ message: "Error fetching dashboard statistics" });
    }
  };
  
  exports.getRevenueData = async (req, res) => {
    try {
      const timeFilter = req.query.timeFilter || "monthly";
      const now = new Date();
      let groupFormat, startDate, limit, dateFormat;
  
      if (timeFilter === "daily") {
        groupFormat = { $hour: "$createdAt" };
        startDate = new Date(now.setHours(0, 0, 0, 0));
        limit = 24;
        dateFormat = "%H:00";
      } else if (timeFilter === "weekly") {
        groupFormat = { $dayOfWeek: "$createdAt" };
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        startDate = startOfWeek;
        limit = 7;
        dateFormat = "%a"; 
      } else if (timeFilter === "monthly") {
        groupFormat = { $week: "$createdAt" };
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate = startOfMonth;
        limit = 5; 
        dateFormat = "Week %V"; 
      } else if (timeFilter === "yearly") {
        groupFormat = { $month: "$createdAt" };
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        startDate = startOfYear;
        limit = 12;
        dateFormat = "%b"; 
      }
  
      const revenueData = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            status: { $nin: ["cancelled", "failed", "processing"] },
          },
        },
        {
          $group: {
            _id: groupFormat,
            revenue: { $sum: "$total" },
          },
        },
        { $sort: { _id: 1 } },
      ]);
  
      let formattedData = [];
  
      if (timeFilter === "daily") {
        // For hourly data
        for (let i = 0; i < 24; i++) {
          const dataPoint = revenueData.find((item) => item._id === i);
          formattedData.push({
            name: `${i}:00`,
            revenue: dataPoint ? dataPoint.revenue : 0,
          });
        }
      } else if (timeFilter === "weekly") {
        // For daily data (week)
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        for (let i = 0; i < 7; i++) {
          const dataPoint = revenueData.find((item) => item._id === i + 1); // MongoDB $dayOfWeek is 1-7
          formattedData.push({
            name: dayNames[i],
            revenue: dataPoint ? dataPoint.revenue : 0,
          });
        }
      } else if (timeFilter === "monthly") {
        // For weekly data (month)
        const currentWeek = new Date().getWeek();
        for (let i = 0; i < 5; i++) {
          const weekNum = currentWeek - 4 + i;
          const dataPoint = revenueData.find((item) => item._id === weekNum);
          formattedData.push({
            name: `Week ${i + 1}`,
            revenue: dataPoint ? dataPoint.revenue : 0,
          });
        }
      } else if (timeFilter === "yearly") {
        // For monthly data (year)
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        for (let i = 0; i < 12; i++) {
          const dataPoint = revenueData.find((item) => item._id === i + 1); // MongoDB $month is 1-12
          formattedData.push({
            name: monthNames[i],
            revenue: dataPoint ? dataPoint.revenue : 0,
          });
        }
      }
  
      res.json(formattedData);
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      res.status(500).json({ message: "Error fetching revenue data" });
    }
  };
  
  exports.getCategorySales = async (req, res) => {
    try {
      const timeFilter = req.query.timeFilter || "monthly";
  
      // Calculate date filter based on timeFilter
      const now = new Date();
      let dateFilter = {};
  
      if (timeFilter === "daily") {
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        dateFilter = { createdAt: { $gte: startOfDay } };
      } else if (timeFilter === "weekly") {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        dateFilter = { createdAt: { $gte: startOfWeek } };
      } else if (timeFilter === "monthly") {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilter = { createdAt: { $gte: startOfMonth } };
      } else if (timeFilter === "yearly") {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        dateFilter = { createdAt: { $gte: startOfYear } };
      }
  
      const categorySales = await Order.aggregate([
        {
          $match: {
            ...dateFilter,
            status: { $nin: ["cancelled", "failed", "processing"] },
          },
        },
        { $unwind: "$items" },
        {
          $lookup: {
            from: "products",
            localField: "items.productId",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "categories",
            localField: "product.category",
            foreignField: "_id",
            as: "category",
          },
        },
        { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: "$category._id",
            name: { $first: "$category.name" },
            value: { $sum: "$items.quantity" },
          },
        },
        {
          $match: {
            name: { $ne: null }, 
          },
        },
        {
          $project: {
            name: 1,
            value: 1,
            _id: 0,
          },
        },
        {
          $sort: { value: -1 },
        },
      ]);
  
      res.json(categorySales);
    } catch (error) {
      console.error("Error fetching category sales:", error);
      res.status(500).json({ message: "Error fetching category sales" });
    }
  };
  
  exports.getBestSellingProducts = async (req, res) => {
    console.log("control at get best selling product");
    try {
      const timeFilter = req.query.timeFilter || "monthly";
      const limit = parseInt(req.query.limit) || 5;
  
      const now = new Date();
      let dateFilter = {};
  
      if (timeFilter === "daily") {
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        dateFilter = { createdAt: { $gte: startOfDay } };
      } else if (timeFilter === "weekly") {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        dateFilter = { createdAt: { $gte: startOfWeek } };
      } else if (timeFilter === "monthly") {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilter = { createdAt: { $gte: startOfMonth } };
      } else if (timeFilter === "yearly") {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        dateFilter = { createdAt: { $gte: startOfYear } };
      }
  
      const bestSellingProducts = await Order.aggregate([
        {
          $match: {
            ...dateFilter,
            status: { $nin: ["cancelled", "failed", "processing"] },
          },
        },
        { $unwind: "$items" },
        {
          $lookup: {
            from: "products",
            localField: "items.productId",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        {
          $group: {
            _id: "$items.productId",
            name: { $first: "$product.name" },
            sales: { $sum: "$items.quantity" },
            revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          },
        },
        { $sort: { sales: -1 } },
        { $limit: limit },
      ]);
  
      res.json(bestSellingProducts);
    } catch (error) {
      console.error("Error fetching best selling products:", error);
      res.status(500).json({ message: "Error fetching best selling products" });
    }
  };
  
  exports.getRecentOrders = async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 5;
  
      const recentOrders = await Order.find()
        .populate("user", "fullname email")
        .sort({ createdAt: -1 })
        .limit(limit);
  
      res.json(recentOrders);
    } catch (error) {
      console.error("Error fetching recent orders:", error);
      res.status(500).json({ message: "Error fetching recent orders" });
    }
  };
  
  exports.getBestSellingCategory = async (req, res) => {
    try {
      const timeFilter = req.query.timeFilter || "monthly";
  
      // Calculate date filter based on timeFilter
      const now = new Date();
      let dateFilter = {};
  
      if (timeFilter === "daily") {
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        dateFilter = { createdAt: { $gte: startOfDay } };
      } else if (timeFilter === "weekly") {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        dateFilter = { createdAt: { $gte: startOfWeek } };
      } else if (timeFilter === "monthly") {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilter = { createdAt: { $gte: startOfMonth } };
      } else if (timeFilter === "yearly") {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        dateFilter = { createdAt: { $gte: startOfYear } };
      }
  
      const bestSellingCategory = await Order.aggregate([
        {
          $match: {
            ...dateFilter,
            status: { $nin: ["cancelled", "failed", "processing"] },
          },
        },
        { $unwind: "$items" },
        {
          $lookup: {
            from: "products",
            localField: "items.productId",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "categories",
            localField: "product.category",
            foreignField: "_id",
            as: "category",
          },
        },
        { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: "$category._id",
            name: { $first: "$category.name" },
            value: { $sum: "$items.quantity" },
          },
        },
        {
          $match: {
            name: { $ne: null }, 
          },
        },
        {
          $sort: { value: -1 }, 
        },
        {
          $limit: 1, 
        },
        {
          $project: {
            name: 1,
            value: 1,
            _id: 0,
          },
        },
      ]);
  
      res.json(bestSellingCategory.length > 0 ? bestSellingCategory[0] : { name: "None", value: 0 });
    } catch (error) {
      console.error("Error fetching best-selling category:", error);
      res.status(500).json({ message: "Error fetching best-selling category" });
    }
  };
  
  Date.prototype.getWeek = function () {
    var date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
    var week1 = new Date(date.getFullYear(), 0, 4);
    return (
      1 +
      Math.round(
        ((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7
      )
    );
  };

