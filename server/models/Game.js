const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  gameType: {
    type: String,
    enum: ['ludo', 'snake_ladder', 'number_guess'],
    required: true
  },
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  players: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: String,
    avatar: String,
    position: {
      type: Number,
      min: 1,
      max: 4
    },
    entryFee: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['waiting', 'playing', 'winner', 'loser', 'disconnected'],
      default: 'waiting'
    },
    score: {
      type: Number,
      default: 0
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  gameConfig: {
    maxPlayers: {
      type: Number,
      required: true,
      min: 2,
      max: 4
    },
    entryFee: {
      type: Number,
      required: true,
      min: 0
    },
    winnerPrize: {
      type: Number,
      required: true
    },
    gameMode: {
      type: String,
      enum: ['public', 'private'],
      default: 'public'
    },
    timeLimit: {
      type: Number, // in minutes
      default: 30
    }
  },
  gameState: {
    status: {
      type: String,
      enum: ['waiting', 'starting', 'in_progress', 'completed', 'cancelled'],
      default: 'waiting'
    },
    currentTurn: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    boardState: {
      type: mongoose.Schema.Types.Mixed
    },
    moves: [{
      player: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      action: String,
      data: mongoose.Schema.Types.Mixed,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }],
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    startedAt: Date,
    completedAt: Date
  },
  chat: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String,
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  prizeDistribution: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    position: Number,
    amount: Number,
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction'
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Generate room ID before saving
gameSchema.pre('save', function(next) {
  if (this.isNew && !this.roomId) {
    this.roomId = this.gameType.toUpperCase() + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

// Index for faster queries
gameSchema.index({ roomId: 1 });
gameSchema.index({ gameType: 1, 'gameState.status': 1 });
gameSchema.index({ 'players.user': 1 });
gameSchema.index({ createdAt: -1 });

// Methods
gameSchema.methods.addPlayer = function(user, entryFee) {
  if (this.players.length >= this.gameConfig.maxPlayers) {
    throw new Error('Room is full');
  }
  
  if (this.gameState.status !== 'waiting') {
    throw new Error('Game has already started');
  }

  this.players.push({
    user: user._id,
    username: user.username,
    avatar: user.avatar,
    position: this.players.length + 1,
    entryFee: entryFee
  });

  if (this.players.length === this.gameConfig.maxPlayers) {
    this.gameState.status = 'starting';
  }
};

gameSchema.methods.removePlayer = function(userId) {
  this.players = this.players.filter(player => !player.user.equals(userId));
  
  if (this.players.length === 0) {
    this.gameState.status = 'cancelled';
  }
};

gameSchema.methods.startGame = function() {
  if (this.players.length < 2) {
    throw new Error('Not enough players to start the game');
  }

  this.gameState.status = 'in_progress';
  this.gameState.startedAt = new Date();
  this.gameState.currentTurn = this.players[0].user;
};

gameSchema.methods.endGame = function(winnerId) {
  this.gameState.status = 'completed';
  this.gameState.completedAt = new Date();
  this.gameState.winner = winnerId;
  
  // Update player statuses
  this.players.forEach(player => {
    if (player.user.equals(winnerId)) {
      player.status = 'winner';
    } else {
      player.status = 'loser';
    }
  });
};

module.exports = mongoose.model('Game', gameSchema);