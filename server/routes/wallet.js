const express = require('express');
const {
  getBalance,
  createDepositOrder,
  verifyDeposit,
  requestWithdrawal,
  getTransactions,
  addMoney
} = require('../controllers/walletController');
const { protect } = require('../middleware/auth');
const { paymentLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// All routes are protected
router.use(protect);

// Wallet routes
router.get('/balance', getBalance);
router.get('/transactions', getTransactions);

// Deposit routes
router.post('/deposit/create-order', paymentLimiter, createDepositOrder);
router.post('/deposit/verify', verifyDeposit);

// Withdrawal routes
router.post('/withdraw', paymentLimiter, requestWithdrawal);

// Admin/Testing route (should be admin-only in production)
router.post('/add-money', addMoney);

module.exports = router;