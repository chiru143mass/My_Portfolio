const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Razorpay = require('razorpay');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Get wallet balance
// @route   GET /api/wallet/balance
// @access  Private
const getBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: {
        balance: user.wallet.balance,
        totalDeposited: user.wallet.totalDeposited,
        totalWithdrawn: user.wallet.totalWithdrawn,
        totalWinnings: user.wallet.totalWinnings
      }
    });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create deposit order
// @route   POST /api/wallet/deposit/create-order
// @access  Private
const createDepositOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount < 10) {
      return res.status(400).json({
        success: false,
        message: 'Minimum deposit amount is ₹10'
      });
    }

    if (amount > 50000) {
      return res.status(400).json({
        success: false,
        message: 'Maximum deposit amount is ₹50,000'
      });
    }

    const options = {
      amount: amount * 100, // amount in paisa
      currency: 'INR',
      receipt: `dep_${req.user.id}_${Date.now()}`,
      notes: {
        userId: req.user.id,
        type: 'deposit'
      }
    };

    const order = await razorpay.orders.create(options);

    // Create pending transaction
    const transaction = await Transaction.create({
      user: req.user.id,
      type: 'deposit',
      amount: amount,
      status: 'pending',
      description: `Deposit of ₹${amount}`,
      paymentGateway: 'razorpay',
      gatewayTransactionId: order.id,
      balanceBefore: req.user.wallet.balance,
      balanceAfter: req.user.wallet.balance,
      metadata: {
        orderId: order.id,
        receipt: order.receipt
      }
    });

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        transactionId: transaction._id
      }
    });
  } catch (error) {
    console.error('Create deposit order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create deposit order'
    });
  }
};

// @desc    Verify deposit payment
// @route   POST /api/wallet/deposit/verify
// @access  Private
const verifyDeposit = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      transactionId 
    } = req.body;

    const crypto = require('crypto');
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Get payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    // Find and update transaction
    const transaction = await Transaction.findById(transactionId);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    if (payment.status === 'captured') {
      const amount = payment.amount / 100; // convert from paisa to rupees
      
      // Update user wallet
      const user = await User.findById(req.user.id);
      user.wallet.balance += amount;
      user.wallet.totalDeposited += amount;
      await user.save();

      // Update transaction
      transaction.status = 'completed';
      transaction.balanceAfter = user.wallet.balance;
      transaction.gatewayResponse = payment;
      transaction.processedAt = new Date();
      await transaction.save();

      // Referral bonus (5% of deposit for referrer)
      if (user.referral.referredBy && amount >= 100) {
        const referralBonus = Math.floor(amount * 0.05); // 5% bonus
        const referrer = await User.findById(user.referral.referredBy);
        
        if (referrer) {
          referrer.wallet.balance += referralBonus;
          referrer.referral.totalEarnings += referralBonus;
          await referrer.save();

          // Create referral bonus transaction
          await Transaction.create({
            user: referrer._id,
            type: 'referral_bonus',
            amount: referralBonus,
            status: 'completed',
            description: `Referral bonus from ${user.username}'s deposit`,
            balanceBefore: referrer.wallet.balance - referralBonus,
            balanceAfter: referrer.wallet.balance,
            metadata: {
              referredUser: user._id,
              originalTransaction: transaction._id
            }
          });
        }
      }

      res.status(200).json({
        success: true,
        message: 'Deposit successful',
        data: {
          transaction: transaction,
          newBalance: user.wallet.balance
        }
      });
    } else {
      transaction.status = 'failed';
      transaction.gatewayResponse = payment;
      await transaction.save();

      res.status(400).json({
        success: false,
        message: 'Payment failed'
      });
    }
  } catch (error) {
    console.error('Verify deposit error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed'
    });
  }
};

// @desc    Request withdrawal
// @route   POST /api/wallet/withdraw
// @access  Private
const requestWithdrawal = async (req, res) => {
  try {
    const { amount, bankDetails } = req.body;
    const user = await User.findById(req.user.id);

    if (!amount || amount < 100) {
      return res.status(400).json({
        success: false,
        message: 'Minimum withdrawal amount is ₹100'
      });
    }

    if (amount > user.wallet.balance) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    if (amount > 25000) {
      return res.status(400).json({
        success: false,
        message: 'Maximum withdrawal amount is ₹25,000 per transaction'
      });
    }

    // Check daily withdrawal limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayWithdrawals = await Transaction.aggregate([
      {
        $match: {
          user: user._id,
          type: 'withdrawal',
          status: { $in: ['completed', 'pending'] },
          createdAt: { $gte: today }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const todayTotal = todayWithdrawals[0]?.total || 0;
    
    if (todayTotal + amount > 50000) {
      return res.status(400).json({
        success: false,
        message: 'Daily withdrawal limit of ₹50,000 exceeded'
      });
    }

    // Deduct amount from wallet (temporarily)
    user.wallet.balance -= amount;
    await user.save();

    // Create withdrawal transaction
    const transaction = await Transaction.create({
      user: user._id,
      type: 'withdrawal',
      amount: amount,
      status: 'pending',
      description: `Withdrawal request of ₹${amount}`,
      balanceBefore: user.wallet.balance + amount,
      balanceAfter: user.wallet.balance,
      metadata: {
        bankDetails: bankDetails,
        requestedAt: new Date()
      }
    });

    res.status(200).json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      data: {
        transaction: transaction,
        newBalance: user.wallet.balance,
        estimatedProcessingTime: '2-4 business hours'
      }
    });
  } catch (error) {
    console.error('Request withdrawal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process withdrawal request'
    });
  }
};

// @desc    Get transaction history
// @route   GET /api/wallet/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const type = req.query.type;
    const status = req.query.status;

    const query = { user: req.user.id };
    
    if (type) query.type = type;
    if (status) query.status = status;

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('gameId', 'gameType roomId');

    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        transactions,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalTransactions: total
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions'
    });
  }
};

// @desc    Add money to wallet (for testing/admin)
// @route   POST /api/wallet/add-money
// @access  Private (Admin only in production)
const addMoney = async (req, res) => {
  try {
    const { amount, description } = req.body;
    const user = await User.findById(req.user.id);

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }

    // Update user wallet
    const balanceBefore = user.wallet.balance;
    user.wallet.balance += amount;
    await user.save();

    // Create transaction record
    const transaction = await Transaction.create({
      user: user._id,
      type: 'admin_adjustment',
      amount: amount,
      status: 'completed',
      description: description || `Admin credit of ₹${amount}`,
      balanceBefore: balanceBefore,
      balanceAfter: user.wallet.balance,
      processedBy: req.user.id,
      processedAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Money added successfully',
      data: {
        transaction,
        newBalance: user.wallet.balance
      }
    });
  } catch (error) {
    console.error('Add money error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add money'
    });
  }
};

module.exports = {
  getBalance,
  createDepositOrder,
  verifyDeposit,
  requestWithdrawal,
  getTransactions,
  addMoney
};