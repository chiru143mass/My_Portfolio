const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Game = require('../models/Game');
const Transaction = require('../models/Transaction');

let io;

const initializeSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"]
    }
  });

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.username = user.username;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.username} connected: ${socket.id}`);

    // Join user to their personal room for notifications
    socket.join(`user_${socket.userId}`);

    // Join game room
    socket.on('join_game', async (data) => {
      try {
        const { roomId } = data;
        const game = await Game.findOne({ roomId })
          .populate('players.user', 'username avatar');

        if (!game) {
          socket.emit('error', { message: 'Game room not found' });
          return;
        }

        // Check if user is in this game
        const playerExists = game.players.some(player => 
          player.user._id.toString() === socket.userId
        );

        if (!playerExists) {
          socket.emit('error', { message: 'You are not in this game' });
          return;
        }

        socket.join(roomId);
        socket.currentRoom = roomId;

        // Send current game state to user
        socket.emit('game_state', {
          game: game,
          message: 'Joined game room successfully'
        });

        // Notify other players
        socket.to(roomId).emit('player_joined', {
          userId: socket.userId,
          username: socket.username,
          message: `${socket.username} joined the game`
        });

        // Auto-start game if all players are connected and game is waiting
        if (game.gameState.status === 'waiting' && 
            game.players.length === game.gameConfig.maxPlayers) {
          setTimeout(() => startGame(roomId), 3000); // 3 second delay
        }

      } catch (error) {
        console.error('Join game error:', error);
        socket.emit('error', { message: 'Failed to join game room' });
      }
    });

    // Leave game room
    socket.on('leave_game', async (data) => {
      try {
        const { roomId } = data;
        
        if (socket.currentRoom) {
          socket.leave(socket.currentRoom);
          socket.to(socket.currentRoom).emit('player_left', {
            userId: socket.userId,
            username: socket.username,
            message: `${socket.username} left the game`
          });
          socket.currentRoom = null;
        }

      } catch (error) {
        console.error('Leave game error:', error);
      }
    });

    // Game move
    socket.on('game_move', async (data) => {
      try {
        const { roomId, move } = data;
        
        const game = await Game.findOne({ roomId });
        
        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }

        if (game.gameState.status !== 'in_progress') {
          socket.emit('error', { message: 'Game is not in progress' });
          return;
        }

        // Check if it's player's turn
        if (game.gameState.currentTurn.toString() !== socket.userId) {
          socket.emit('error', { message: 'Not your turn' });
          return;
        }

        // Process move based on game type
        const result = await processGameMove(game, socket.userId, move);
        
        if (result.success) {
          // Broadcast move to all players in the room
          io.to(roomId).emit('move_made', {
            playerId: socket.userId,
            username: socket.username,
            move: move,
            gameState: result.gameState,
            nextPlayer: result.nextPlayer
          });

          // Check for game end
          if (result.gameEnd) {
            await endGame(game, result.winner);
          }
        } else {
          socket.emit('error', { message: result.message });
        }

      } catch (error) {
        console.error('Game move error:', error);
        socket.emit('error', { message: 'Failed to process move' });
      }
    });

    // Chat message
    socket.on('chat_message', async (data) => {
      try {
        const { roomId, message } = data;
        
        if (!message || message.trim().length === 0) {
          return;
        }

        if (message.length > 200) {
          socket.emit('error', { message: 'Message too long' });
          return;
        }

        const game = await Game.findOne({ roomId });
        
        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }

        // Check if user is in this game
        const playerExists = game.players.some(player => 
          player.user.toString() === socket.userId
        );

        if (!playerExists) {
          socket.emit('error', { message: 'You are not in this game' });
          return;
        }

        // Add message to game chat
        game.chat.push({
          user: socket.userId,
          username: socket.username,
          message: message.trim()
        });
        await game.save();

        // Broadcast message to all players in the room
        io.to(roomId).emit('chat_message', {
          userId: socket.userId,
          username: socket.username,
          message: message.trim(),
          timestamp: new Date()
        });

      } catch (error) {
        console.error('Chat message error:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.username} disconnected: ${socket.id}`);
      
      if (socket.currentRoom) {
        socket.to(socket.currentRoom).emit('player_disconnected', {
          userId: socket.userId,
          username: socket.username,
          message: `${socket.username} disconnected`
        });
      }
    });
  });

  return io;
};

// Helper function to start a game
const startGame = async (roomId) => {
  try {
    const game = await Game.findOne({ roomId });
    
    if (!game || game.gameState.status !== 'waiting') {
      return;
    }

    game.startGame();
    await game.save();

    // Initialize game board based on game type
    let initialGameState = {};
    
    switch (game.gameType) {
      case 'ludo':
        initialGameState = initializeLudoBoard();
        break;
      case 'snake_ladder':
        initialGameState = initializeSnakeLadderBoard();
        break;
      case 'number_guess':
        initialGameState = initializeNumberGuessGame();
        break;
    }

    game.gameState.boardState = initialGameState;
    await game.save();

    // Notify all players that game has started
    io.to(roomId).emit('game_started', {
      message: 'Game has started!',
      gameState: game.gameState,
      currentPlayer: game.gameState.currentTurn
    });

  } catch (error) {
    console.error('Start game error:', error);
  }
};

// Helper function to process game moves
const processGameMove = async (game, playerId, move) => {
  try {
    let result = { success: false };

    switch (game.gameType) {
      case 'ludo':
        result = processLudoMove(game, playerId, move);
        break;
      case 'snake_ladder':
        result = processSnakeLadderMove(game, playerId, move);
        break;
      case 'number_guess':
        result = processNumberGuessMove(game, playerId, move);
        break;
    }

    if (result.success) {
      // Add move to game history
      game.gameState.moves.push({
        player: playerId,
        action: move.action,
        data: move.data
      });

      // Update current turn
      if (result.nextPlayer) {
        game.gameState.currentTurn = result.nextPlayer;
      }

      // Update board state
      if (result.boardState) {
        game.gameState.boardState = result.boardState;
      }

      await game.save();
    }

    return result;
  } catch (error) {
    console.error('Process game move error:', error);
    return { success: false, message: 'Failed to process move' };
  }
};

// Helper function to end a game
const endGame = async (game, winnerId) => {
  try {
    game.endGame(winnerId);
    await game.save();

    // Update user stats and distribute winnings
    for (const player of game.players) {
      const user = await User.findById(player.user);
      
      const gameResult = {
        won: player.user.toString() === winnerId.toString(),
        winAmount: player.user.toString() === winnerId.toString() ? game.gameConfig.winnerPrize : 0
      };

      user.updateGameStats(gameResult);
      
      if (gameResult.won) {
        // Award prize to winner
        user.wallet.balance += game.gameConfig.winnerPrize;
        
        // Create winning transaction
        await Transaction.create({
          user: user._id,
          type: 'game_win',
          amount: game.gameConfig.winnerPrize,
          status: 'completed',
          description: `Won ${game.gameType} game`,
          gameId: game._id,
          balanceBefore: user.wallet.balance - game.gameConfig.winnerPrize,
          balanceAfter: user.wallet.balance
        });
      }

      await user.save();
    }

    // Notify all players about game end
    io.to(game.roomId).emit('game_ended', {
      winnerId: winnerId,
      winnerUsername: game.players.find(p => p.user.toString() === winnerId.toString())?.username,
      prize: game.gameConfig.winnerPrize,
      finalGameState: game.gameState
    });

  } catch (error) {
    console.error('End game error:', error);
  }
};

// Game-specific initialization and move processing functions
const initializeLudoBoard = () => {
  return {
    players: {},
    diceValue: 0,
    lastRoll: null
  };
};

const initializeSnakeLadderBoard = () => {
  return {
    players: {},
    diceValue: 0,
    lastRoll: null,
    snakes: {
      16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 78
    },
    ladders: {
      1: 38, 4: 14, 9: 21, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 100
    }
  };
};

const initializeNumberGuessGame = () => {
  return {
    targetNumber: Math.floor(Math.random() * 100) + 1,
    guesses: {},
    attempts: {},
    maxAttempts: 10
  };
};

const processLudoMove = (game, playerId, move) => {
  // Simplified Ludo move processing
  const { action, data } = move;
  
  if (action === 'roll_dice') {
    const diceValue = Math.floor(Math.random() * 6) + 1;
    const boardState = { ...game.gameState.boardState };
    boardState.diceValue = diceValue;
    boardState.lastRoll = playerId;
    
    const nextPlayerIndex = (game.players.findIndex(p => p.user.toString() === playerId) + 1) % game.players.length;
    const nextPlayer = game.players[nextPlayerIndex].user;
    
    return {
      success: true,
      boardState,
      nextPlayer,
      gameEnd: false
    };
  }
  
  return { success: false, message: 'Invalid move' };
};

const processSnakeLadderMove = (game, playerId, move) => {
  // Simplified Snake & Ladder move processing
  const { action } = move;
  
  if (action === 'roll_dice') {
    const diceValue = Math.floor(Math.random() * 6) + 1;
    const boardState = { ...game.gameState.boardState };
    
    if (!boardState.players[playerId]) {
      boardState.players[playerId] = 0;
    }
    
    let newPosition = boardState.players[playerId] + diceValue;
    
    // Check for snakes and ladders
    if (boardState.snakes[newPosition]) {
      newPosition = boardState.snakes[newPosition];
    } else if (boardState.ladders[newPosition]) {
      newPosition = boardState.ladders[newPosition];
    }
    
    // Cap at 100
    if (newPosition > 100) {
      newPosition = boardState.players[playerId];
    }
    
    boardState.players[playerId] = newPosition;
    boardState.diceValue = diceValue;
    
    // Check for win
    const gameEnd = newPosition === 100;
    const winner = gameEnd ? playerId : null;
    
    const nextPlayerIndex = (game.players.findIndex(p => p.user.toString() === playerId) + 1) % game.players.length;
    const nextPlayer = game.players[nextPlayerIndex].user;
    
    return {
      success: true,
      boardState,
      nextPlayer: gameEnd ? null : nextPlayer,
      gameEnd,
      winner
    };
  }
  
  return { success: false, message: 'Invalid move' };
};

const processNumberGuessMove = (game, playerId, move) => {
  // Number guessing game move processing
  const { action, data } = move;
  
  if (action === 'guess_number') {
    const guess = parseInt(data.number);
    const boardState = { ...game.gameState.boardState };
    
    if (!boardState.guesses[playerId]) {
      boardState.guesses[playerId] = [];
      boardState.attempts[playerId] = 0;
    }
    
    boardState.guesses[playerId].push(guess);
    boardState.attempts[playerId]++;
    
    let hint = '';
    if (guess === boardState.targetNumber) {
      return {
        success: true,
        boardState,
        nextPlayer: null,
        gameEnd: true,
        winner: playerId
      };
    } else if (guess < boardState.targetNumber) {
      hint = 'Too low!';
    } else {
      hint = 'Too high!';
    }
    
    // Check if max attempts reached
    const gameEnd = boardState.attempts[playerId] >= boardState.maxAttempts;
    
    const nextPlayerIndex = (game.players.findIndex(p => p.user.toString() === playerId) + 1) % game.players.length;
    const nextPlayer = game.players[nextPlayerIndex].user;
    
    return {
      success: true,
      boardState: { ...boardState, lastHint: hint },
      nextPlayer: gameEnd ? null : nextPlayer,
      gameEnd: gameEnd && Object.values(boardState.attempts).every(attempts => attempts >= boardState.maxAttempts),
      winner: null
    };
  }
  
  return { success: false, message: 'Invalid move' };
};

// Function to emit to specific user
const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user_${userId}`).emit(event, data);
  }
};

// Function to emit to specific room
const emitToRoom = (roomId, event, data) => {
  if (io) {
    io.to(roomId).emit(event, data);
  }
};

module.exports = {
  initializeSocket,
  emitToUser,
  emitToRoom
};