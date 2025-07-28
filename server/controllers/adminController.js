const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Game = require('../models/Game');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
const getDashboardStats = async (req, res) => {
  try {
    // Get counts
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeUsers = await User.countDocuments({ 
      role: 'user', 
      isActive: true,
      lastActive: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Active in last 7 days
    });
    const totalGames = await Game.countDocuments();
    const activeGames = await Game.countDocuments({ 
      'gameState.status': { $in: ['waiting', 'starting', 'in_progress'] } 
    });

    // Financial stats
    const totalDeposits = await Transaction.aggregate([
      { $match: { type: 'deposit', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    const totalWithdrawals = await Transaction.aggregate([
      { $match: { type: 'withdrawal', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    const pendingWithdrawals = await Transaction.aggregate([
      { $match: { type: 'withdrawal', status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    // Platform revenue (10% of total game entry fees)
    const platformRevenue = await Transaction.aggregate([
      { $match: { type: 'game_loss', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const revenue = platformRevenue[0]?.total || 0;
    const estimatedPlatformRevenue = revenue * 0.10; // 10% platform fee

    // Recent transactions
    const recentTransactions = await Transaction.find()
      .populate('user', 'username email')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        userStats: {
          total: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers
        },
        gameStats: {
          total: totalGames,
          active: activeGames,
          completed: totalGames - activeGames
        },
        financialStats: {
          totalDeposits: totalDeposits[0]?.total || 0,
          totalDepositCount: totalDeposits[0]?.count || 0,
          totalWithdrawals: totalWithdrawals[0]?.total || 0,
          totalWithdrawalCount: totalWithdrawals[0]?.count || 0,
          pendingWithdrawals: pendingWithdrawals[0]?.total || 0,
          pendingWithdrawalCount: pendingWithdrawals[0]?.count || 0,
          platformRevenue: estimatedPlatformRevenue
        },
        recentTransactions
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats'
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search;
    const isActive = req.query.isActive;

    let query = { role: 'user' };

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

// @desc    Get user details
// @route   GET /api/admin/users/:id
// @access  Private (Admin only)
const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('referral.referredUsers', 'username email')
      .populate('referral.referredBy', 'username email');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's transaction history
    const transactions = await Transaction.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    // Get user's game history
    const games = await Game.find({ 'players.user': user._id })
      .populate('players.user', 'username')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        user,
        transactions,
        games
      }
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user details'
    });
  }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin only)
const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { user }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
};

// @desc    Adjust user wallet
// @route   POST /api/admin/users/:id/wallet-adjustment
// @access  Private (Admin only)
const adjustUserWallet = async (req, res) => {
  try {
    const { amount, description, type } = req.body;
    
    if (!amount || !description || !type) {
      return res.status(400).json({
        success: false,
        message: 'Amount, description, and type are required'
      });
    }

    if (!['add', 'deduct'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either "add" or "deduct"'
      });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const adjustmentAmount = type === 'add' ? Math.abs(amount) : -Math.abs(amount);
    
    if (type === 'deduct' && user.wallet.balance < Math.abs(amount)) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance for deduction'
      });
    }

    const balanceBefore = user.wallet.balance;
    user.wallet.balance += adjustmentAmount;
    await user.save();

    // Create transaction record
    const transaction = await Transaction.create({
      user: user._id,
      type: 'admin_adjustment',
      amount: Math.abs(amount),
      status: 'completed',
      description: `Admin ${type}: ${description}`,
      balanceBefore: balanceBefore,
      balanceAfter: user.wallet.balance,
      processedBy: req.user.id,
      processedAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: `Wallet ${type}ed successfully`,
      data: {
        transaction,
        newBalance: user.wallet.balance
      }
    });
  } catch (error) {
    console.error('Adjust user wallet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to adjust wallet'
    });
  }
};

// @desc    Get all transactions
// @route   GET /api/admin/transactions
// @access  Private (Admin only)
const getAllTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const type = req.query.type;
    const status = req.query.status;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    let query = {};

    if (type) query.type = type;
    if (status) query.status = status;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .populate('user', 'username email')
      .populate('processedBy', 'username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

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
    console.error('Get all transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions'
    });
  }
};

// @desc    Process withdrawal
// @route   PUT /api/admin/transactions/:id/process-withdrawal
// @access  Private (Admin only)
const processWithdrawal = async (req, res) => {
  try {
    const { action, reason } = req.body; // action: 'approve' or 'reject'
    
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action must be either "approve" or "reject"'
      });
    }

    const transaction = await Transaction.findById(req.params.id)
      .populate('user', 'username email wallet');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    if (transaction.type !== 'withdrawal') {
      return res.status(400).json({
        success: false,
        message: 'This is not a withdrawal transaction'
      });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Transaction has already been processed'
      });
    }

    if (action === 'approve') {
      transaction.status = 'completed';
      transaction.processedBy = req.user.id;
      transaction.processedAt = new Date();
      
      // Update user's total withdrawn amount
      const user = await User.findById(transaction.user._id);
      user.wallet.totalWithdrawn += transaction.amount;
      await user.save();

    } else if (action === 'reject') {
      transaction.status = 'failed';
      transaction.processedBy = req.user.id;
      transaction.processedAt = new Date();
      
      if (reason) {
        transaction.metadata = { 
          ...transaction.metadata, 
          rejectionReason: reason 
        };
      }

      // Refund amount to user wallet
      const user = await User.findById(transaction.user._id);
      user.wallet.balance += transaction.amount;
      await user.save();

      // Create refund transaction
      await Transaction.create({
        user: user._id,
        type: 'admin_adjustment',
        amount: transaction.amount,
        status: 'completed',
        description: `Withdrawal refund - ${reason || 'Withdrawal rejected'}`,
        balanceBefore: user.wallet.balance - transaction.amount,
        balanceAfter: user.wallet.balance,
        processedBy: req.user.id,
        processedAt: new Date(),
        metadata: {
          originalTransaction: transaction._id
        }
      });
    }

    await transaction.save();

    res.status(200).json({
      success: true,
      message: `Withdrawal ${action}d successfully`,
      data: { transaction }
    });
  } catch (error) {
    console.error('Process withdrawal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process withdrawal'
    });
  }
};

// @desc    Get all games
// @route   GET /api/admin/games
// @access  Private (Admin only)
const getAllGames = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const gameType = req.query.gameType;
    const status = req.query.status;

    let query = {};

    if (gameType) query.gameType = gameType;
    if (status) query['gameState.status'] = status;

    const games = await Game.find(query)
      .populate('players.user', 'username email')
      .populate('gameState.winner', 'username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Game.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        games,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalGames: total
      }
    });
  } catch (error) {
    console.error('Get all games error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch games'
    });
  }
};

// @desc    Cancel game
// @route   PUT /api/admin/games/:id/cancel
// @access  Private (Admin only)
const cancelGame = async (req, res) => {
  try {
    const { reason } = req.body;
    
    const game = await Game.findById(req.params.id)
      .populate('players.user', 'username email wallet');

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    if (!['waiting', 'starting', 'in_progress'].includes(game.gameState.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed or already cancelled game'
      });
    }

    // Refund entry fees to all players
    for (const player of game.players) {
      const user = await User.findById(player.user._id);
      user.wallet.balance += player.entryFee;
      await user.save();

      // Create refund transaction
      await Transaction.create({
        user: user._id,
        type: 'admin_adjustment',
        amount: player.entryFee,
        status: 'completed',
        description: `Game cancelled refund - ${reason || 'Game cancelled by admin'}`,
        gameId: game._id,
        balanceBefore: user.wallet.balance - player.entryFee,
        balanceAfter: user.wallet.balance,
        processedBy: req.user.id,
        processedAt: new Date()
      });
    }

    // Update game status
    game.gameState.status = 'cancelled';
    game.isActive = false;
    await game.save();

    res.status(200).json({
      success: true,
      message: 'Game cancelled successfully and entry fees refunded',
      data: { game }
    });
  } catch (error) {
    console.error('Cancel game error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel game'
    });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getUserDetails,
  updateUserStatus,
  adjustUserWallet,
  getAllTransactions,
  processWithdrawal,
  getAllGames,
  cancelGame
};