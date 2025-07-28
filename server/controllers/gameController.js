const Game = require('../models/Game');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// @desc    Get available games lobby
// @route   GET /api/games/lobby
// @access  Private
const getGameLobby = async (req, res) => {
  try {
    const { gameType, status = 'waiting' } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const query = {
      'gameState.status': status,
      'gameConfig.gameMode': 'public',
      isActive: true
    };

    if (gameType) {
      query.gameType = gameType;
    }

    const games = await Game.find(query)
      .populate('players.user', 'username avatar gameStats')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Game.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        games: games.map(game => ({
          id: game._id,
          roomId: game.roomId,
          gameType: game.gameType,
          players: game.players,
          gameConfig: game.gameConfig,
          gameState: {
            status: game.gameState.status,
            startedAt: game.gameState.startedAt
          },
          createdAt: game.createdAt
        })),
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalGames: total
      }
    });
  } catch (error) {
    console.error('Get game lobby error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch game lobby'
    });
  }
};

// @desc    Create new game room
// @route   POST /api/games/create
// @access  Private
const createGame = async (req, res) => {
  try {
    const { gameType, entryFee, maxPlayers = 2, gameMode = 'public' } = req.body;
    const user = await User.findById(req.user.id);

    // Validate game type
    const validGameTypes = ['ludo', 'snake_ladder', 'number_guess'];
    if (!validGameTypes.includes(gameType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid game type'
      });
    }

    // Validate entry fee
    if (entryFee < 10 || entryFee > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Entry fee must be between ₹10 and ₹5000'
      });
    }

    // Check user balance
    if (user.wallet.balance < entryFee) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance'
      });
    }

    // Check if user is already in an active game
    const existingGame = await Game.findOne({
      'players.user': user._id,
      'gameState.status': { $in: ['waiting', 'starting', 'in_progress'] },
      isActive: true
    });

    if (existingGame) {
      return res.status(400).json({
        success: false,
        message: 'You are already in an active game'
      });
    }

    // Calculate winner prize (90% of total entry fees, 10% platform fee)
    const platformFeePercentage = 0.10;
    const winnerPrize = Math.floor(entryFee * maxPlayers * (1 - platformFeePercentage));

    // Create game
    const game = await Game.create({
      gameType,
      gameConfig: {
        maxPlayers,
        entryFee,
        winnerPrize,
        gameMode
      }
    });

    // Add creator as first player
    game.addPlayer(user, entryFee);
    await game.save();

    // Deduct entry fee from user wallet
    user.wallet.balance -= entryFee;
    await user.save();

    // Create transaction for entry fee
    await Transaction.create({
      user: user._id,
      type: 'game_loss',
      amount: entryFee,
      status: 'completed',
      description: `Entry fee for ${gameType} game`,
      gameId: game._id,
      balanceBefore: user.wallet.balance + entryFee,
      balanceAfter: user.wallet.balance
    });

    // Populate the game before sending response
    const populatedGame = await Game.findById(game._id)
      .populate('players.user', 'username avatar gameStats');

    res.status(201).json({
      success: true,
      message: 'Game room created successfully',
      data: {
        game: populatedGame
      }
    });
  } catch (error) {
    console.error('Create game error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create game room'
    });
  }
};

// @desc    Join game room
// @route   POST /api/games/:roomId/join
// @access  Private
const joinGame = async (req, res) => {
  try {
    const { roomId } = req.params;
    const user = await User.findById(req.user.id);

    const game = await Game.findOne({ roomId, isActive: true })
      .populate('players.user', 'username avatar gameStats');

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game room not found'
      });
    }

    if (game.gameState.status !== 'waiting') {
      return res.status(400).json({
        success: false,
        message: 'Game has already started or is completed'
      });
    }

    if (game.players.length >= game.gameConfig.maxPlayers) {
      return res.status(400).json({
        success: false,
        message: 'Game room is full'
      });
    }

    // Check if user is already in this game
    const isAlreadyInGame = game.players.some(player => 
      player.user._id.toString() === user._id.toString()
    );

    if (isAlreadyInGame) {
      return res.status(400).json({
        success: false,
        message: 'You are already in this game'
      });
    }

    // Check user balance
    if (user.wallet.balance < game.gameConfig.entryFee) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance'
      });
    }

    // Check if user is in any other active game
    const existingGame = await Game.findOne({
      'players.user': user._id,
      'gameState.status': { $in: ['waiting', 'starting', 'in_progress'] },
      isActive: true,
      _id: { $ne: game._id }
    });

    if (existingGame) {
      return res.status(400).json({
        success: false,
        message: 'You are already in another active game'
      });
    }

    // Add player to game
    game.addPlayer(user, game.gameConfig.entryFee);
    await game.save();

    // Deduct entry fee from user wallet
    user.wallet.balance -= game.gameConfig.entryFee;
    await user.save();

    // Create transaction for entry fee
    await Transaction.create({
      user: user._id,
      type: 'game_loss',
      amount: game.gameConfig.entryFee,
      status: 'completed',
      description: `Entry fee for ${game.gameType} game`,
      gameId: game._id,
      balanceBefore: user.wallet.balance + game.gameConfig.entryFee,
      balanceAfter: user.wallet.balance
    });

    // Populate the updated game
    const updatedGame = await Game.findById(game._id)
      .populate('players.user', 'username avatar gameStats');

    res.status(200).json({
      success: true,
      message: 'Joined game successfully',
      data: {
        game: updatedGame
      }
    });
  } catch (error) {
    console.error('Join game error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join game'
    });
  }
};

// @desc    Leave game room
// @route   POST /api/games/:roomId/leave
// @access  Private
const leaveGame = async (req, res) => {
  try {
    const { roomId } = req.params;
    const user = await User.findById(req.user.id);

    const game = await Game.findOne({ roomId, isActive: true });

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game room not found'
      });
    }

    if (game.gameState.status !== 'waiting') {
      return res.status(400).json({
        success: false,
        message: 'Cannot leave game after it has started'
      });
    }

    // Check if user is in the game
    const playerIndex = game.players.findIndex(player => 
      player.user.toString() === user._id.toString()
    );

    if (playerIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'You are not in this game'
      });
    }

    // Refund entry fee
    user.wallet.balance += game.gameConfig.entryFee;
    await user.save();

    // Create refund transaction
    await Transaction.create({
      user: user._id,
      type: 'game_win',
      amount: game.gameConfig.entryFee,
      status: 'completed',
      description: `Entry fee refund for leaving ${game.gameType} game`,
      gameId: game._id,
      balanceBefore: user.wallet.balance - game.gameConfig.entryFee,
      balanceAfter: user.wallet.balance
    });

    // Remove player from game
    game.removePlayer(user._id);
    await game.save();

    res.status(200).json({
      success: true,
      message: 'Left game successfully and entry fee refunded'
    });
  } catch (error) {
    console.error('Leave game error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave game'
    });
  }
};

// @desc    Get game details
// @route   GET /api/games/:roomId
// @access  Private
const getGame = async (req, res) => {
  try {
    const { roomId } = req.params;

    const game = await Game.findOne({ roomId, isActive: true })
      .populate('players.user', 'username avatar gameStats')
      .populate('gameState.currentTurn', 'username')
      .populate('gameState.winner', 'username');

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game room not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        game
      }
    });
  } catch (error) {
    console.error('Get game error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch game details'
    });
  }
};

// @desc    Get user's game history
// @route   GET /api/games/my-games
// @access  Private
const getMyGames = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;

    const query = {
      'players.user': req.user.id,
      isActive: true
    };

    if (status) {
      query['gameState.status'] = status;
    }

    const games = await Game.find(query)
      .populate('players.user', 'username avatar')
      .populate('gameState.winner', 'username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Game.countDocuments(query);

    // Add user's result to each game
    const gamesWithResults = games.map(game => {
      const userPlayer = game.players.find(player => 
        player.user._id.toString() === req.user.id.toString()
      );
      
      return {
        ...game.toObject(),
        userResult: {
          position: userPlayer?.position,
          status: userPlayer?.status,
          isWinner: game.gameState.winner && 
                   game.gameState.winner._id.toString() === req.user.id.toString()
        }
      };
    });

    res.status(200).json({
      success: true,
      data: {
        games: gamesWithResults,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalGames: total
      }
    });
  } catch (error) {
    console.error('Get my games error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch game history'
    });
  }
};

// @desc    Get leaderboard
// @route   GET /api/games/leaderboard
// @access  Public
const getLeaderboard = async (req, res) => {
  try {
    const { period = 'all', gameType } = req.query;
    const limit = parseInt(req.query.limit) || 10;

    // Calculate date range based on period
    let dateFilter = {};
    if (period === 'daily') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dateFilter = { lastActive: { $gte: today } };
    } else if (period === 'weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = { lastActive: { $gte: weekAgo } };
    } else if (period === 'monthly') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = { lastActive: { $gte: monthAgo } };
    }

    // Get top players by win rate and total winnings
    const topPlayers = await User.find({
      ...dateFilter,
      'gameStats.totalGamesPlayed': { $gte: 5 }, // Minimum 5 games played
      isActive: true
    })
    .select('username avatar gameStats wallet.totalWinnings')
    .sort({ 
      'gameStats.winRate': -1,
      'wallet.totalWinnings': -1,
      'gameStats.totalGamesWon': -1
    })
    .limit(limit);

    res.status(200).json({
      success: true,
      data: {
        leaderboard: topPlayers.map((player, index) => ({
          rank: index + 1,
          username: player.username,
          avatar: player.avatar,
          totalGamesPlayed: player.gameStats.totalGamesPlayed,
          totalGamesWon: player.gameStats.totalGamesWon,
          winRate: player.gameStats.winRate,
          totalWinnings: player.wallet.totalWinnings
        })),
        period
      }
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard'
    });
  }
};

module.exports = {
  getGameLobby,
  createGame,
  joinGame,
  leaveGame,
  getGame,
  getMyGames,
  getLeaderboard
};