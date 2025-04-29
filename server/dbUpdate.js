// scripts/fixTransactionIds.js

const mongoose = require('mongoose');
const { nanoid } = require('nanoid');
const Wallet = require('./models/walletModel');
const User = require('./models/userModel')
const dotenv = require('dotenv')
dotenv.config()
const uri = process.env.MONGO_URI

// Connect to your MongoDB
mongoose.connect(uri)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    // return fixMissingTransactionIds();
    return addReferralCode();
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });

// const fixMissingTransactionIds = async () => {
//   try {
//     const wallets = await Wallet.findOne({user:"67e249c19d32d3b6533ae5c6"});

//     // for (const wallet of wallets) {
//       let updated = false;

//       wallets.transactions.forEach((txn) => {
//         if (!txn.transactionId) {
//           txn.transactionId = nanoid(10);
//           updated = true;
//         }
//       });

//       if (updated) {
//         await wallets.save();
//         console.log(`🔧 Updated wallet with user ID: ${wallets.user}`);
//       }
//     // }

//     console.log('✅ All wallets processed.');
//   } catch (error) {
//     console.error('❌ Error during transaction ID update:', error);
//   } finally {
//     mongoose.disconnect();
//   }
// };


const addReferralCode = async () => {
  try {
    const user = await User.findOne({_id:"67e249c19d32d3b6533ae5c6"});

    // for (const wallet of wallets) {
      let updated = false;

      if(!user.referralCode){
        user.referralCode = nanoid(8)
        updated = true
      }

      if (updated) {
        await user.save();
        console.log(`🔧 Updated user with user referralCode: ${user.referralCode}`);
      }
    // }

    console.log('✅ user referralCode set.');
  } catch (error) {
    console.error('❌ Error during referralCode setting:', error);
  } finally {
    mongoose.disconnect();
  }
};
