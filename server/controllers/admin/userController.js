// const User = require("../../models/userModel");

// const getCustomerDetails = async (req, res) => {
//   const { page = 1, limit = 10, term } = req.query; // Default values
//   try {
//     const skip = limit * (page - 1);
//     const query = {};
//     if (term) {
//       query.$or = [
//         { name: { $regex: term, $options: "i" } },
//         { email: { $regex: term, $options: "i" } },
//       ];
//     }
//     const users = await User.find(query).sort({ updatedAt: -1 }).skip(skip).limit(parseInt(limit)); // Ensure limit is a number
//     if (users.length === 0) {
//       return res.status(404).json({ success: false, message: "No users found" });
//     }
//     const totalUsers = await User.countDocuments(query); // Count with query for accurate total
//     res.status(200).json({
//       success: true,
//       message: "Customer details fetched",
//       users,
//       totalPages: Math.ceil(totalUsers / limit),
//     });
//   } catch (error) {
//     console.log("Error fetching customer details:", error.message);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// const editCustomerStatus = async (req, res) => {
//   const { userId } = req.params;
//   try {
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }
//     user.isBlocked = !user.isBlocked;
//     await user.save();
//     res.status(200).json({ success: true, message: "Customer status updated", user });
//   } catch (error) {
//     console.log("Customer status update failed:", error.message);
//     res.status(500).json({ success: false, message: "An error occurred while updating status" });
//   }
// };

// module.exports = { getCustomerDetails, editCustomerStatus };










const User = require("../../models/userModel");

const getCustomerDetails = async (req, res) => {
  const { page = 1, limit = 10, term, status } = req.query; // Added status parameter
  try {
    const skip = limit * (page - 1);
    const query = {};

    // Search by term (name or email)
    if (term) {
      query.$or = [
        { name: { $regex: term, $options: "i" } },
        { email: { $regex: term, $options: "i" } },
      ];
    }

    // Filter by status
    if (status) {
      if (status === "active") {
        query.isBlocked = false;
      } else if (status === "blocked") {
        query.isBlocked = true;
      }
      // If status is anything else (e.g., empty or invalid), ignore it
    }

    const users = await User.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: "No users found" });
    }

    const totalUsers = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "Customer details fetched",
      users,
      totalPages: Math.ceil(totalUsers / limit),
    });
  } catch (error) {
    console.log("Error fetching customer details:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const editCustomerStatus = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.status(200).json({ success: true, message: "Customer status updated", user });
  } catch (error) {
    console.log("Customer status update failed:", error.message);
    res.status(500).json({ success: false, message: "An error occurred while updating status" });
  }
};

module.exports = { getCustomerDetails, editCustomerStatus };