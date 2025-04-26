const Wallet = require("../../models/walletModel");
const Order = require("../../models/orderModel");
const { nanoid } = require("nanoid");

exports.getWallet = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder || 'desc';
    const type = req.query.type; // Filter by transaction type

    const skip = (page - 1) * limit;

    const wallet = await Wallet.findOne({ user: req.user.id })
      .populate("user", "username email");
      
      
      if (!wallet) {
        return res.json({ 
          success: true, 
          balance: 0, 
          transactions: [],
          pagination: {
            totalTransactions: 0,
            totalPages: 0,
            currentPage: page,
            limit
          }
        });
      }
      
      let transactions = [...wallet.transactions];
      
      if (type && ['credit', 'debit'].includes(type)) {
        transactions = transactions.filter(transaction => transaction.type === type);
      }

    const totalTransactions = transactions.length;
    const totalPages = Math.ceil(totalTransactions / limit);

    const sortMultiplier = sortOrder === 'desc' ? -1 : 1;
    transactions.sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return -1 * sortMultiplier;
      if (a[sortBy] > b[sortBy]) return 1 * sortMultiplier;
      return 0;
    });

    const paginatedTransactions = transactions.slice(skip, skip + limit);
    
    res.json({
      success: true,
      balance: wallet.balance,
      transactions: paginatedTransactions,
      pagination: {
        totalTransactions,
        totalPages,
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    console.error("Get wallet error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong", error });
  }
};

exports.addFunds = async (req, res) => {
  const { amount } = req.body;
  console.log("amount received at the backend", amount);

  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, message: "Invalid amount" });
  }

  try {
    let wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) {
      wallet = new Wallet({ user: req.user.id });
    }

    wallet.balance += amount;
    wallet.transactions.push({
      transactionId: nanoid(10),
      type: "credit",
      amount,
      description: "Added funds to wallet",
    });

    await wallet.save();
    res
      .status(201)
      .json({
        success: true,
        message: "Funds added successfully",
        balance: wallet.balance,
      });
  } catch (error) {
    console.error("Add funds error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong", error });
  }
};