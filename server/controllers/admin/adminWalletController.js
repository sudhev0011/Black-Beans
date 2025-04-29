// controllers/adminWalletController.js
const AdminWallet = require("../../models/adminWalletModel");
const Order = require("../../models/orderModel");
const User = require("../../models/userModel");
const Wallet = require("../../models/walletModel");
const { nanoid } = require("nanoid");

async function getAdminWallet() {
  let adminWallet = await AdminWallet.findOne();
  if (!adminWallet) {
    adminWallet = new AdminWallet();
    await adminWallet.save();
  }
  return adminWallet;
}

exports.recordTransaction = async ({
  type,
  amount,
  description,
  orderId,
  userId,
  transactionType,
  status = "completed",
}) => {
  try {
    const adminWallet = await getAdminWallet();
    const transactionId = nanoid(10);

    // Update balance
    if (type === "credit") {
      adminWallet.balance += amount;
    } else if (type === "debit") {
      adminWallet.balance -= amount;
    }

    // Add transaction
    adminWallet.transactions.push({
      transactionId,
      type,
      amount,
      description,
      orderId,
      userId,
      transactionType,
      status,
    });

    await adminWallet.save();
    return { success: true, transactionId };
  } catch (error) {
    console.error("Error recording admin wallet transaction:", error);
    return { success: false, error: error.message };
  }
};

exports.getAdminWallet = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      type,
      search,
    } = req.query;

    const adminWallet = await AdminWallet.findOne().select("transactions balance").lean();
    if (!adminWallet) {
      return res.status(200).json({
        success: true,
        transactions: [],
        pagination: {
          totalTransactions: 0,
          totalPages: 0,
          currentPage: 1,
          limit: parseInt(limit),
        },
        summary: getEmptySummary(),
      });
    }

    // Filter transactions manually
    let transactions = adminWallet.transactions || [];

    if (type) {
      transactions = transactions.filter((t) => t.type === type);
    }

    if (search) {
      const regex = new RegExp(search, "i");
      transactions = transactions.filter(
        (t) => regex.test(t.orderId || "") || regex.test(t.description || "")
      );
    }

    // Sort
    if (sortBy && ["createdAt", "amount", "type", "status", "orderId"].includes(sortBy)) {
      transactions.sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        if (sortOrder === "asc") return aValue > bValue ? 1 : -1;
        else return aValue < bValue ? 1 : -1;
      });
    }

    // Pagination
    const totalTransactions = transactions.length;
    const totalPages = Math.ceil(totalTransactions / limit);
    const start = (page - 1) * limit;
    const paginatedTransactions = transactions.slice(start, start + parseInt(limit));

    // Populate user info
    const populatedTransactions = await Promise.all(
      paginatedTransactions.map(async (txn) => {
        let user = null;
        if (txn.userId) {
          user = await User.findById(txn.userId).select("username email").lean();
          const userWallet = await Wallet.findOne({ user: txn.userId }).select("balance").lean();
          if (user) user.walletBalance = userWallet?.balance || 0;
        }
        return {
          ...txn,
          user,
          _id: txn._id?.toString() || txn.transactionId, // fallback
        };
      })
    );

    const summary = await generateSummaryData();

    res.status(200).json({
      success: true,
      transactions: populatedTransactions,
      pagination: {
        totalTransactions,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
      summary,
    });
  } catch (error) {
    console.error("Error fetching admin wallet transactions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transactions",
      error: error.message,
    });
  }
};

exports.getTransactionDetails = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const adminWallet = await AdminWallet.findOne({
      "transactions.transactionId": transactionId,
    }).lean();

    if (!adminWallet) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    const transaction = adminWallet.transactions.find(
      (t) => t.transactionId === transactionId
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Populate user details
    let user = null;
    if (transaction.userId) {
      user = await User.findById(transaction.userId)
        .select("name email")
        .lean();

      // Get user's wallet balance
      const userWallet = await Wallet.findOne({ user: transaction.userId })
        .select("balance")
        .lean();

      if (user) {
        user.walletBalance = userWallet?.balance || 0;
      }
    }

    // Get order details if available
    let order = null;
    if (transaction.orderId) {
      order = await Order.findOne({ orderId: transaction.orderId })
        .select("orderId status items.total")
        .lean();
    }

    res.status(200).json({
      success: true,
      transaction: {
        ...transaction,
        user,
        order,
        _id: transaction._id.toString(),
      },
    });
  } catch (error) {
    console.error("Error fetching transaction details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transaction details",
      error: error.message,
    });
  }
};

async function generateSummaryData() {
  try {
    // Get all transactions
    const adminWallet = await AdminWallet.findOne().lean();
    const transactions = adminWallet?.transactions || [];

    // Calculate basic summary
    const totalBalance = adminWallet?.balance || 0;
    const totalTransactions = transactions.length;

    const creditTxns = transactions.filter((t) => t.type === "credit");
    const debitTxns = transactions.filter((t) => t.type === "debit");

    const totalCredits = creditTxns.reduce((sum, t) => sum + t.amount, 0);
    const totalDebits = debitTxns.reduce((sum, t) => sum + t.amount, 0);
    const creditCount = creditTxns.length;
    const debitCount = debitTxns.length;

    const pendingTransactions = transactions.filter(
      (t) => t.status === "pending"
    ).length;

    // Get user stats
    const usersWithBalance = await Wallet.countDocuments({
      balance: { $gt: 0 },
    });
    const activeUsers = await User.countDocuments({
      updatedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    // Calculate averages
    const averageBalance = await Wallet.aggregate([
      { $match: { balance: { $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: "$balance" } } },
    ]);

    const averageTransaction = await AdminWallet.aggregate([
      { $unwind: "$transactions" },
      {$match:{"transactions.type": "debit"}},
      { $group: { _id: null, avg: { $avg: "$transactions.amount" } } },
    ]);

    return {
      totalBalance,
      totalCredits,
      totalDebits,
      totalTransactions,
      pendingTransactions,
      creditCount,
      debitCount,
      usersWithBalance,
      activeUsers,
      averageBalance: averageBalance[0]?.avg || 0,
      averageTransaction: averageTransaction[0]?.avg || 0,
    };
  } catch (error) {
    console.error("Error generating summary data:", error);
    return getEmptySummary();
  }
}

function getEmptySummary() {
  return {
    totalBalance: 0,
    totalCredits: 0,
    totalDebits: 0,
    totalTransactions: 0,
    pendingTransactions: 0,
    creditCount: 0,
    debitCount: 0,
    usersWithBalance: 0,
    activeUsers: 0,
    averageBalance: 0,
    averageTransaction: 0,
  };
}
