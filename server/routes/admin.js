const express = require('express');
const {
  getDashboardStats,
  getAllUsers,
  getUserDetails,
  updateUserStatus,
  adjustUserWallet,
  getAllTransactions,
  processWithdrawal,
  getAllGames,
  cancelGame
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(admin);

// Dashboard
router.get('/dashboard', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id/status', updateUserStatus);
router.post('/users/:id/wallet-adjustment', adjustUserWallet);

// Transaction management
router.get('/transactions', getAllTransactions);
router.put('/transactions/:id/process-withdrawal', processWithdrawal);

// Game management
router.get('/games', getAllGames);
router.put('/games/:id/cancel', cancelGame);

module.exports = router;