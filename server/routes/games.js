const express = require('express');
const {
  getGameLobby,
  createGame,
  joinGame,
  leaveGame,
  getGame,
  getMyGames,
  getLeaderboard
} = require('../controllers/gameController');
const { protect } = require('../middleware/auth');
const { gameLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Public routes
router.get('/leaderboard', getLeaderboard);

// Protected routes
router.use(protect);

// Game lobby and management
router.get('/lobby', getGameLobby);
router.post('/create', gameLimiter, createGame);
router.get('/my-games', getMyGames);

// Game room operations
router.get('/:roomId', getGame);
router.post('/:roomId/join', gameLimiter, joinGame);
router.post('/:roomId/leave', leaveGame);

module.exports = router;