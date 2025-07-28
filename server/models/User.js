const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number']
  },
  avatar: {
    type: String,
    default: 'https://via.placeholder.com/150'
  },
  wallet: {
    balance: {
      type: Number,
      default: 0,
      min: [0, 'Balance cannot be negative']
    },
    totalDeposited: {
      type: Number,
      default: 0
    },
    totalWithdrawn: {
      type: Number,
      default: 0
    },
    totalWinnings: {
      type: Number,
      default: 0
    }
  },
  gameStats: {
    totalGamesPlayed: {
      type: Number,
      default: 0
    },
    totalGamesWon: {
      type: Number,
      default: 0
    },
    winRate: {
      type: Number,
      default: 0
    },
    favoriteGame: {
      type: String,
      default: ''
    }
  },
  referral: {
    code: {
      type: String,
      unique: true
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    referredUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    totalEarnings: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

// Generate referral code before saving
userSchema.pre('save', async function(next) {
  if (this.isNew && !this.referral.code) {
    this.referral.code = this.username.toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Update game stats method
userSchema.methods.updateGameStats = function(gameResult) {
  this.gameStats.totalGamesPlayed += 1;
  if (gameResult.won) {
    this.gameStats.totalGamesWon += 1;
    this.wallet.totalWinnings += gameResult.winAmount || 0;
  }
  this.gameStats.winRate = (this.gameStats.totalGamesWon / this.gameStats.totalGamesPlayed) * 100;
  this.lastActive = new Date();
};

module.exports = mongoose.model('User', userSchema);