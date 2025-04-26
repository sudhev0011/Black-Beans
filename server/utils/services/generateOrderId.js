const Order = require("../../models/orderModel");

// Function to generate a unique order ID
const generateOrderId = async () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const day = String(date.getDate()).padStart(2, "0");

  // Generate a random 4-character string (e.g., A1B2)
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();

  // Base order ID format: ORD-YYYYMMDD-XXXX
  const baseOrderId = `ORD-${year}${month}${day}-${random}`;

  // Check if this orderId already exists in the database
  const existingOrder = await Order.findOne({ orderId: baseOrderId });
  if (existingOrder) {
    // If it exists, recurse to generate a new one
    return generateOrderId();
  }

  return baseOrderId;
};

module.exports = { generateOrderId };