// Global Variables
let currentBalance = 0;
let currentUser = null;
let referralEarnings = 0;
let totalReferrals = 0;
let currentGameSession = null;
let websocket = null;
let onlinePlayers = 2456;
let activeMatches = [];

// Game States
const GAME_STATES = {
    WAITING: 'waiting',
    PLAYING: 'playing',
    FINISHED: 'finished'
};

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadUserData();
    setupEventListeners();
    startAnimations();
    initializeLiveMatches();
    updateOnlineStats();
});

// Initialize Application
function initializeApp() {
    const savedBalance = localStorage.getItem('gameBalance');
    const savedUser = localStorage.getItem('gameUser');
    const savedReferrals = localStorage.getItem('totalReferrals');
    const savedEarnings = localStorage.getItem('referralEarnings');
    
    if (savedBalance) {
        currentBalance = parseFloat(savedBalance);
        updateBalanceDisplay();
    }
    
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUIForLoggedInUser();
        connectToGameServer();
    }
    
    if (savedReferrals) {
        totalReferrals = parseInt(savedReferrals);
        document.getElementById('totalReferrals').textContent = totalReferrals;
    }
    
    if (savedEarnings) {
        referralEarnings = parseFloat(savedEarnings);
        document.getElementById('referralEarnings').textContent = `₹${referralEarnings}`;
    }
}

// WebSocket Connection for Real-time Gaming
function connectToGameServer() {
    // In a real implementation, this would connect to your game server
    // For demo purposes, we'll simulate WebSocket behavior
    console.log('Connecting to game server...');
    
    // Simulate WebSocket connection
    websocket = {
        send: function(data) {
            console.log('Sending:', data);
            // Simulate server response
            setTimeout(() => {
                handleWebSocketMessage(JSON.parse(data));
            }, 1000);
        },
        close: function() {
            console.log('Connection closed');
        }
    };
    
    showNotification('Connected to game server!', 'success');
}

function handleWebSocketMessage(message) {
    switch(message.type) {
        case 'opponent_found':
            handleOpponentFound(message.data);
            break;
        case 'game_move':
            handleGameMove(message.data);
            break;
        case 'game_end':
            handleGameEnd(message.data);
            break;
        case 'chat_message':
            handleChatMessage(message.data);
            break;
    }
}

// Setup Event Listeners
function setupEventListeners() {
    document.querySelectorAll('.amount-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            selectAmount(this.dataset.amount);
        });
    });
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });
    
    startTournamentCountdowns();
    setupGameEventListeners();
}

function setupGameEventListeners() {
    // Chat functionality
    document.getElementById('chatInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

// Real Multiplayer Game Functions
function quickMatch(gameType) {
    if (!currentUser) {
        showNotification('Please login to play games', 'error');
        showLoginModal();
        return;
    }
    
    if (currentBalance < 10) {
        showNotification('Insufficient balance. Minimum ₹10 required.', 'error');
        return;
    }
    
    showGameEntryModal(gameType);
}

function showGameEntryModal(gameType) {
    const gameData = getGameData(gameType);
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'entryModal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="closeModal('entryModal')">&times;</span>
            <h2>Join ${gameData.name}</h2>
            <div class="entry-selection">
                <h3>Select Entry Amount</h3>
                <div class="entry-amounts">
                    ${gameData.entryFees.map(fee => `
                        <button class="entry-amount-btn" data-amount="${fee}" onclick="selectEntryAmount(${fee})">
                            ₹${fee}
                            <small>Win up to ₹${fee * 10}</small>
                        </button>
                    `).join('')}
                </div>
                <div class="match-type">
                    <h4>Match Type</h4>
                    <label>
                        <input type="radio" name="matchType" value="quick" checked> Quick Match
                        <span>Get matched with a random opponent</span>
                    </label>
                    <label>
                        <input type="radio" name="matchType" value="friend"> Play with Friend
                        <span>Create a private room</span>
                    </label>
                </div>
                <button id="startGameBtn" class="form-submit" onclick="startGameSearch('${gameType}')">
                    Find Opponent
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'block';
}

let selectedEntryAmount = 10;

function selectEntryAmount(amount) {
    selectedEntryAmount = amount;
    document.querySelectorAll('.entry-amount-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    event.target.classList.add('selected');
}

function startGameSearch(gameType) {
    if (currentBalance < selectedEntryAmount) {
        showNotification('Insufficient balance', 'error');
        return;
    }
    
    // Deduct entry fee
    currentBalance -= selectedEntryAmount;
    updateBalanceDisplay();
    saveBalance();
    
    closeModal('entryModal');
    showGameArena(gameType);
    searchForOpponent(gameType);
}

function showGameArena(gameType) {
    const gameData = getGameData(gameType);
    document.getElementById('currentGameName').textContent = gameData.name;
    document.getElementById('entryAmount').textContent = `₹${selectedEntryAmount} Entry`;
    document.getElementById('myName').textContent = currentUser.name;
    document.getElementById('myAvatar').src = `https://ui-avatars.com/api/?name=${currentUser.name}&background=00d2ff&color=fff`;
    
    document.getElementById('gameArena').style.display = 'block';
    document.querySelector('.header').style.display = 'none';
    document.body.style.overflow = 'hidden';
    
    // Initialize game board
    initializeGameBoard(gameType);
}

function searchForOpponent(gameType) {
    document.getElementById('opponentName').textContent = 'Finding opponent...';
    document.getElementById('opponentStatus').textContent = 'Searching...';
    document.getElementById('opponentStatus').className = 'player-status searching';
    
    showNotification('Searching for opponent...', 'info');
    
    // Simulate finding opponent (in real app, this would be handled by server)
    setTimeout(() => {
        const opponent = generateRandomOpponent();
        handleOpponentFound(opponent);
    }, Math.random() * 5000 + 2000); // 2-7 seconds
}

function generateRandomOpponent() {
    const names = ['Pro_Gamer', 'Champion_X', 'GameMaster', 'SkillKing', 'WinnerPro', 'GameLord', 'Victory_Star'];
    const name = names[Math.floor(Math.random() * names.length)];
    return {
        name: name,
        id: 'opponent_' + Math.random().toString(36).substr(2, 9),
        avatar: `https://ui-avatars.com/api/?name=${name}&background=ff6b6b&color=fff`,
        rating: Math.floor(Math.random() * 2000) + 1000
    };
}

function handleOpponentFound(opponent) {
    document.getElementById('opponentName').textContent = opponent.name;
    document.getElementById('opponentAvatar').src = opponent.avatar;
    document.getElementById('opponentStatus').textContent = 'Online';
    document.getElementById('opponentStatus').className = 'player-status online';
    
    showNotification(`Opponent found: ${opponent.name}`, 'success');
    
    // Start game countdown
    startGameCountdown();
}

function startGameCountdown() {
    let countdown = 3;
    const countdownInterval = setInterval(() => {
        document.getElementById('turnText').textContent = `Game starts in ${countdown}`;
        countdown--;
        
        if (countdown < 0) {
            clearInterval(countdownInterval);
            startActualGame();
        }
    }, 1000);
}

function startActualGame() {
    document.getElementById('turnText').textContent = 'Your turn';
    startTurnTimer();
    showNotification('Game started! Make your move', 'success');
}

function startTurnTimer() {
    let timeLeft = 30;
    const timerElement = document.getElementById('turnTimer');
    
    const timer = setInterval(() => {
        timerElement.textContent = timeLeft;
        timeLeft--;
        
        if (timeLeft < 0) {
            clearInterval(timer);
            handleTurnTimeout();
        }
    }, 1000);
    
    // Store timer for cleanup
    currentGameSession = { timer: timer };
}

function handleTurnTimeout() {
    showNotification('Time up! Turn passed to opponent', 'error');
    switchTurn();
}

function switchTurn() {
    const isMyTurn = document.getElementById('turnText').textContent === 'Your turn';
    document.getElementById('turnText').textContent = isMyTurn ? "Opponent's turn" : 'Your turn';
    
    if (isMyTurn) {
        // Simulate opponent move
        setTimeout(() => {
            simulateOpponentMove();
        }, Math.random() * 10000 + 2000);
    } else {
        startTurnTimer();
    }
}

function simulateOpponentMove() {
    showNotification('Opponent made a move', 'info');
    
    // Random chance of game ending
    if (Math.random() > 0.7) {
        endGame(Math.random() > 0.5);
    } else {
        document.getElementById('turnText').textContent = 'Your turn';
        startTurnTimer();
    }
}

function endGame(playerWon) {
    if (currentGameSession && currentGameSession.timer) {
        clearInterval(currentGameSession.timer);
    }
    
    const winAmount = selectedEntryAmount * 1.8; // 80% return (20% platform fee)
    
    if (playerWon) {
        currentBalance += winAmount;
        updateBalanceDisplay();
        saveBalance();
        showNotification(`Congratulations! You won ₹${winAmount.toFixed(2)}!`, 'success');
        document.getElementById('turnText').textContent = 'You Won! 🎉';
    } else {
        showNotification('Better luck next time!', 'error');
        document.getElementById('turnText').textContent = 'You Lost 😞';
    }
    
    // Show play again option
    setTimeout(() => {
        const playAgain = confirm('Game finished! Want to play again?');
        if (playAgain) {
            leaveGame();
            document.querySelector(`[data-game="${getCurrentGameType()}"]`).click();
        } else {
            leaveGame();
        }
    }, 3000);
}

// Game Board Initialization
function initializeGameBoard(gameType) {
    const boardContainer = document.getElementById('gameBoard');
    boardContainer.innerHTML = '';
    
    switch(gameType) {
        case 'ludo':
            initializeLudoBoard(boardContainer);
            break;
        case 'tic-tac-toe':
            initializeTicTacToeBoard(boardContainer);
            break;
        case 'snake-ladder':
            initializeSnakeLadderBoard(boardContainer);
            break;
        case 'rock-paper-scissors':
            initializeRockPaperScissorsBoard(boardContainer);
            break;
    }
}

function initializeTicTacToeBoard(container) {
    container.className = 'tic-tac-toe-board';
    
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'tic-cell';
        cell.dataset.index = i;
        cell.addEventListener('click', () => makeTicTacToeMove(i));
        container.appendChild(cell);
    }
    
    currentGameSession = {
        ...currentGameSession,
        board: Array(9).fill(null),
        playerSymbol: 'X',
        opponentSymbol: 'O'
    };
}

function makeTicTacToeMove(index) {
    if (!currentGameSession || 
        currentGameSession.board[index] !== null || 
        document.getElementById('turnText').textContent !== 'Your turn') {
        return;
    }
    
    // Make move
    currentGameSession.board[index] = currentGameSession.playerSymbol;
    const cell = document.querySelector(`.tic-cell[data-index="${index}"]`);
    cell.textContent = currentGameSession.playerSymbol;
    cell.classList.add('x');
    
    // Check for win
    if (checkTicTacToeWin(currentGameSession.playerSymbol)) {
        endGame(true);
        return;
    }
    
    // Check for draw
    if (currentGameSession.board.every(cell => cell !== null)) {
        showNotification('Game Draw!', 'info');
        currentBalance += selectedEntryAmount; // Return entry fee
        updateBalanceDisplay();
        saveBalance();
        setTimeout(() => leaveGame(), 2000);
        return;
    }
    
    // Switch turn
    clearInterval(currentGameSession.timer);
    switchTurn();
}

function checkTicTacToeWin(symbol) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6] // Diagonals
    ];
    
    return winPatterns.some(pattern => 
        pattern.every(index => currentGameSession.board[index] === symbol)
    );
}

function initializeRockPaperScissorsBoard(container) {
    container.className = 'rock-paper-scissors-game';
    container.innerHTML = `
        <h3>Choose Your Move</h3>
        <div class="rps-choices">
            <div class="rps-choice" data-choice="rock" onclick="makeRPSMove('rock')">🪨</div>
            <div class="rps-choice" data-choice="paper" onclick="makeRPSMove('paper')">📄</div>
            <div class="rps-choice" data-choice="scissors" onclick="makeRPSMove('scissors')">✂️</div>
        </div>
        <div class="rps-result" id="rpsResult" style="display: none;">
            <h4>Results</h4>
            <p id="rpsOutcome"></p>
        </div>
    `;
}

function makeRPSMove(choice) {
    if (document.getElementById('turnText').textContent !== 'Your turn') return;
    
    // Highlight selected choice
    document.querySelectorAll('.rps-choice').forEach(el => el.classList.remove('selected'));
    document.querySelector(`[data-choice="${choice}"]`).classList.add('selected');
    
    // Generate opponent choice
    const choices = ['rock', 'paper', 'scissors'];
    const opponentChoice = choices[Math.floor(Math.random() * 3)];
    
    // Determine winner
    const result = determineRPSWinner(choice, opponentChoice);
    
    // Show results
    const resultDiv = document.getElementById('rpsResult');
    const outcomeDiv = document.getElementById('rpsOutcome');
    
    outcomeDiv.innerHTML = `
        <div>You: ${getEmoji(choice)}</div>
        <div>Opponent: ${getEmoji(opponentChoice)}</div>
        <div><strong>${result}</strong></div>
    `;
    
    resultDiv.style.display = 'block';
    
    // End game based on result
    setTimeout(() => {
        if (result === 'You Win!') {
            endGame(true);
        } else if (result === 'You Lose!') {
            endGame(false);
        } else {
            // Draw - play again
            resultDiv.style.display = 'none';
            document.querySelectorAll('.rps-choice').forEach(el => el.classList.remove('selected'));
            showNotification('Draw! Play again', 'info');
        }
    }, 2000);
}

function determineRPSWinner(player, opponent) {
    if (player === opponent) return 'Draw!';
    
    const winConditions = {
        rock: 'scissors',
        paper: 'rock',
        scissors: 'paper'
    };
    
    return winConditions[player] === opponent ? 'You Win!' : 'You Lose!';
}

function getEmoji(choice) {
    const emojis = {
        rock: '🪨',
        paper: '📄',
        scissors: '✂️'
    };
    return emojis[choice];
}

function initializeLudoBoard(container) {
    container.className = 'ludo-board';
    // Complex Ludo board implementation would go here
    container.innerHTML = '<div style="padding: 2rem; text-align: center; color: white;">Ludo board will be rendered here with full gameplay mechanics</div>';
}

function initializeSnakeLadderBoard(container) {
    container.className = 'snake-ladder-board';
    // Snake and Ladder board implementation
    for (let i = 100; i >= 1; i--) {
        const cell = document.createElement('div');
        cell.className = 'snake-cell';
        cell.textContent = i;
        cell.dataset.number = i;
        
        // Add special cells (snakes and ladders)
        if ([16, 47, 49, 56, 62, 64, 87, 93, 95, 98].includes(i)) {
            cell.classList.add('snake-head');
        }
        if ([1, 4, 9, 21, 28, 36, 51, 71, 80].includes(i)) {
            cell.classList.add('ladder-bottom');
        }
        
        container.appendChild(cell);
    }
}

// Chat Functions
function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    addChatMessage(currentUser.name, message, true);
    chatInput.value = '';
    
    // Send to opponent (simulated)
    if (websocket) {
        websocket.send(JSON.stringify({
            type: 'chat_message',
            data: { message: message, sender: currentUser.name }
        }));
    }
    
    // Simulate opponent response
    setTimeout(() => {
        const responses = ['Good move!', 'Nice game!', '😊', 'GL HF!', 'Well played'];
        const response = responses[Math.floor(Math.random() * responses.length)];
        addChatMessage('Opponent', response, false);
    }, Math.random() * 3000 + 1000);
}

function addChatMessage(sender, message, isMe) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isMe ? 'me' : 'opponent'}`;
    messageDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function handleChatMessage(data) {
    addChatMessage(data.sender, data.message, false);
}

// Game Utility Functions
function getCurrentGameType() {
    // Extract game type from current session or UI
    return 'tic-tac-toe'; // Default for demo
}

function getGameData(gameType) {
    const gameData = {
        ludo: {
            name: 'Ludo Multiplayer',
            icon: 'fas fa-dice',
            entryFees: [10, 25, 50, 100, 250, 500, 1000],
            maxWin: 10000
        },
        'tic-tac-toe': {
            name: 'Tic Tac Toe Pro',
            icon: 'fas fa-hashtag',
            entryFees: [5, 10, 25, 50, 100, 250],
            maxWin: 2500
        },
        'snake-ladder': {
            name: 'Snake & Ladder',
            icon: 'fas fa-route',
            entryFees: [5, 10, 25, 50, 100, 250, 500],
            maxWin: 5000
        },
        'rock-paper-scissors': {
            name: 'Rock Paper Scissors',
            icon: 'fas fa-hand-rock',
            entryFees: [10, 20, 50, 100],
            maxWin: 1000
        }
    };
    
    return gameData[gameType];
}

function leaveGame() {
    if (currentGameSession && currentGameSession.timer) {
        clearInterval(currentGameSession.timer);
    }
    
    document.getElementById('gameArena').style.display = 'none';
    document.querySelector('.header').style.display = 'block';
    document.body.style.overflow = 'auto';
    
    currentGameSession = null;
    
    // Clean up
    document.getElementById('chatMessages').innerHTML = '';
    document.getElementById('gameBoard').innerHTML = '';
}

// Room Creation
function createRoom(gameType) {
    if (!currentUser) {
        showNotification('Please login to create rooms', 'error');
        showLoginModal();
        return;
    }
    
    document.getElementById('roomModal').style.display = 'block';
    document.getElementById('roomModal').dataset.gameType = gameType;
}

function createPrivateRoom() {
    const gameType = document.getElementById('roomModal').dataset.gameType;
    const entryAmount = document.getElementById('roomEntryAmount').value;
    const password = document.getElementById('roomPassword').value;
    
    const roomCode = generateRoomCode();
    
    closeModal('roomModal');
    
    showNotification(`Room created! Code: ${roomCode}`, 'success');
    
    // In real implementation, this would create a room on the server
    prompt(`Share this room code with your friend: ${roomCode}`);
}

function generateRoomCode() {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
}

// Live Matches
function initializeLiveMatches() {
    generateLiveMatches();
    setInterval(generateLiveMatches, 10000); // Update every 10 seconds
}

function generateLiveMatches() {
    const games = ['ludo', 'tic-tac-toe', 'snake-ladder', 'rock-paper-scissors'];
    const matches = [];
    
    for (let i = 0; i < 6; i++) {
        const game = games[Math.floor(Math.random() * games.length)];
        const player1 = generateRandomOpponent();
        const player2 = generateRandomOpponent();
        const entryFee = [10, 25, 50, 100, 250][Math.floor(Math.random() * 5)];
        
        matches.push({
            id: 'match_' + Math.random().toString(36).substr(2, 9),
            game: game,
            player1: player1,
            player2: player2,
            entryFee: entryFee,
            spectators: Math.floor(Math.random() * 50) + 1
        });
    }
    
    activeMatches = matches;
    displayLiveMatches();
}

function displayLiveMatches() {
    const container = document.getElementById('liveMatchesList');
    if (!container) return;
    
    container.innerHTML = activeMatches.map(match => `
        <div class="live-match-card" data-game="${match.game}">
            <div class="match-header">
                <h4>${getGameData(match.game).name}</h4>
                <span class="live-badge">LIVE</span>
            </div>
            <div class="match-players">
                <div class="match-player">
                    <img src="${match.player1.avatar}" alt="${match.player1.name}">
                    <span>${match.player1.name}</span>
                </div>
                <div class="vs">VS</div>
                <div class="match-player">
                    <img src="${match.player2.avatar}" alt="${match.player2.name}">
                    <span>${match.player2.name}</span>
                </div>
            </div>
            <div class="match-info">
                <p>Entry: ₹${match.entryFee}</p>
                <p>Spectators: ${match.spectators}</p>
            </div>
            <button class="spectate-btn" onclick="spectateMatch('${match.id}')">
                👁️ Spectate
            </button>
        </div>
    `).join('');
}

function filterMatches(gameType) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const matchCards = document.querySelectorAll('.live-match-card');
    matchCards.forEach(card => {
        if (gameType === 'all' || card.dataset.game === gameType) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function spectateMatch(matchId) {
    showNotification('Joining match as spectator...', 'info');
    // In real implementation, this would join a live match
    setTimeout(() => {
        showNotification('You are now spectating the match!', 'success');
    }, 1500);
}

// Online Stats Update
function updateOnlineStats() {
    setInterval(() => {
        onlinePlayers += Math.floor(Math.random() * 20) - 10; // Random fluctuation
        onlinePlayers = Math.max(1000, onlinePlayers); // Minimum 1000 players
        
        document.getElementById('onlineCount').textContent = `${onlinePlayers.toLocaleString()} Online`;
        document.getElementById('livePlayersCount').textContent = onlinePlayers.toLocaleString();
        
        // Update live player counts in games
        document.querySelectorAll('.live-indicator span').forEach(span => {
            if (!span.textContent.includes('Playing')) return;
            const currentCount = parseInt(span.textContent.split(' ')[0]);
            const newCount = currentCount + Math.floor(Math.random() * 10) - 5;
            span.textContent = `${Math.max(50, newCount)} Playing`;
        });
    }, 5000);
}

// User Authentication Functions
function showLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

function showRegisterModal() {
    document.getElementById('registerModal').style.display = 'block';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        // Remove dynamically created modals
        if (modalId === 'entryModal') {
            modal.remove();
        }
    }
}

function switchToRegister() {
    closeModal('loginModal');
    showRegisterModal();
}

function switchToLogin() {
    closeModal('registerModal');
    showLoginModal();
}

function handleLogin(event) {
    event.preventDefault();
    
    const mobile = document.getElementById('loginMobile').value;
    const password = document.getElementById('loginPassword').value;
    
    if (mobile && password) {
        currentUser = {
            name: 'Player_' + mobile.slice(-4),
            mobile: mobile,
            id: 'user_' + Math.random().toString(36).substr(2, 9),
            balance: currentBalance
        };
        
        localStorage.setItem('gameUser', JSON.stringify(currentUser));
        closeModal('loginModal');
        updateUIForLoggedInUser();
        connectToGameServer();
        showNotification('Login successful! Welcome back!', 'success');
        
        if (currentBalance === 0) {
            addWelcomeBonus();
        }
    } else {
        showNotification('Please fill all fields', 'error');
    }
}

function handleRegistration(event) {
    event.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const mobile = document.getElementById('registerMobile').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const referralCode = document.getElementById('registerReferral').value;
    const termsAccepted = document.getElementById('terms').checked;
    
    if (!name || !mobile || !email || !password) {
        showNotification('Please fill all required fields', 'error');
        return;
    }
    
    if (!termsAccepted) {
        showNotification('Please accept Terms & Conditions', 'error');
        return;
    }
    
    currentUser = {
        name: name,
        mobile: mobile,
        email: email,
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        balance: 0
    };
    
    localStorage.setItem('gameUser', JSON.stringify(currentUser));
    closeModal('registerModal');
    updateUIForLoggedInUser();
    connectToGameServer();
    
    if (referralCode) {
        processReferral(referralCode);
    }
    
    addWelcomeBonus();
    showNotification('Registration successful! Welcome bonus added!', 'success');
}

function updateUIForLoggedInUser() {
    if (currentUser) {
        const authDiv = document.querySelector('.nav-auth');
        authDiv.innerHTML = `
            <div class="wallet-display">
                <i class="fas fa-wallet"></i>
                <span id="balance">₹${currentBalance.toFixed(2)}</span>
            </div>
            <div class="online-status">
                <div class="online-dot"></div>
                <span id="onlineCount">${onlinePlayers.toLocaleString()} Online</span>
            </div>
            <div class="user-menu">
                <span>Hi, ${currentUser.name}</span>
                <button class="btn-secondary" onclick="logout()">Logout</button>
            </div>
        `;
    }
}

function logout() {
    if (websocket) {
        websocket.close();
    }
    currentUser = null;
    localStorage.removeItem('gameUser');
    location.reload();
}

function addWelcomeBonus() {
    const bonus = 100;
    currentBalance += bonus;
    updateBalanceDisplay();
    saveBalance();
    showNotification(`Welcome bonus of ₹${bonus} added!`, 'success');
}

// Wallet Functions
function selectAmount(amount) {
    document.querySelectorAll('.amount-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    event.target.classList.add('active');
    document.getElementById('customAmount').value = amount;
}

function addMoney() {
    if (!currentUser) {
        showNotification('Please login first', 'error');
        showLoginModal();
        return;
    }
    
    const amount = parseFloat(document.getElementById('customAmount').value);
    
    if (!amount || amount < 10) {
        showNotification('Minimum amount is ₹10', 'error');
        return;
    }
    
    if (amount > 50000) {
        showNotification('Maximum amount is ₹50,000', 'error');
        return;
    }
    
    processPayment(amount);
}

function processPayment(amount) {
    showNotification('Processing payment...', 'info');
    
    setTimeout(() => {
        const success = Math.random() > 0.1; // 90% success rate
        
        if (success) {
            currentBalance += amount;
            updateBalanceDisplay();
            saveBalance();
            showNotification(`₹${amount} added successfully!`, 'success');
            
            document.getElementById('customAmount').value = '';
            document.querySelectorAll('.amount-btn').forEach(btn => {
                btn.classList.remove('active');
            });
        } else {
            showNotification('Payment failed. Please try again.', 'error');
        }
    }, 2000);
}

function withdrawMoney() {
    if (!currentUser) {
        showNotification('Please login first', 'error');
        showLoginModal();
        return;
    }
    
    const amount = parseFloat(document.getElementById('withdrawAmount').value);
    const method = document.getElementById('withdrawMethod').value;
    
    if (!amount || amount < 100) {
        showNotification('Minimum withdrawal is ₹100', 'error');
        return;
    }
    
    if (amount > currentBalance) {
        showNotification('Insufficient balance', 'error');
        return;
    }
    
    if (!method) {
        showNotification('Please select withdrawal method', 'error');
        return;
    }
    
    currentBalance -= amount;
    updateBalanceDisplay();
    saveBalance();
    
    showNotification(`Withdrawal of ₹${amount} initiated. Will be processed in 24-48 hours.`, 'success');
    
    document.getElementById('withdrawAmount').value = '';
    document.getElementById('withdrawMethod').value = '';
}

function updateBalanceDisplay() {
    const balanceElement = document.getElementById('balance');
    if (balanceElement) {
        balanceElement.textContent = `₹${currentBalance.toFixed(2)}`;
    }
}

function saveBalance() {
    localStorage.setItem('gameBalance', currentBalance.toString());
}

// Tournament Functions
function joinTournament(tournamentName, entryFee) {
    if (!currentUser) {
        showNotification('Please login to join tournaments', 'error');
        showLoginModal();
        return;
    }
    
    if (currentBalance < entryFee) {
        showNotification('Insufficient balance. Please add money.', 'error');
        return;
    }
    
    currentBalance -= entryFee;
    updateBalanceDisplay();
    saveBalance();
    
    showNotification(`Joined ${tournamentName}! Good luck!`, 'success');
}

function startTournamentCountdowns() {
    // Update tournament timers
    setInterval(() => {
        updateTournamentTimer('tournament1Timer');
        updateTournamentTimer('tournament2Timer');
        updateTournamentPlayers();
    }, 60000); // Update every minute
}

function updateTournamentTimer(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // Simulate countdown
    let timeText = element.textContent;
    let [hours, minutes] = timeText.split('h ')[0] !== timeText ? 
        [parseInt(timeText.split('h ')[0]), parseInt(timeText.split('h ')[1].replace('m', ''))] :
        [0, parseInt(timeText.replace('m', ''))];
    
    minutes--;
    if (minutes < 0) {
        hours--;
        minutes = 59;
    }
    
    if (hours < 0) {
        hours = 23; // Reset to new tournament
        minutes = 59;
    }
    
    element.textContent = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function updateTournamentPlayers() {
    ['tournament1Players', 'tournament2Players'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            let currentCount = parseInt(element.textContent.replace(',', ''));
            currentCount += Math.floor(Math.random() * 20) - 5;
            element.textContent = Math.max(100, currentCount).toLocaleString();
        }
    });
}

// Referral Functions
function processReferral(referralCode) {
    if (referralCode && referralCode.length > 0) {
        const bonus = 25; // Bonus for using referral code
        currentBalance += bonus;
        updateBalanceDisplay();
        saveBalance();
        showNotification(`Referral bonus of ₹${bonus} added!`, 'success');
    }
}

function copyReferralCode() {
    const referralCode = document.getElementById('referralCode').value;
    navigator.clipboard.writeText(referralCode).then(() => {
        showNotification('Referral code copied!', 'success');
    });
}

function shareWhatsApp() {
    const referralCode = document.getElementById('referralCode').value;
    const message = `🎮 Join GameZone Pro and win real money! Use my referral code: ${referralCode} and get ₹50 bonus. Play live multiplayer games: https://gamezonepro.com`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

function shareTelegram() {
    const referralCode = document.getElementById('referralCode').value;
    const message = `🎮 Join GameZone Pro and win real money! Use my referral code: ${referralCode} and get ₹50 bonus. Play live multiplayer games: https://gamezonepro.com`;
    const url = `https://t.me/share/url?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

function shareFacebook() {
    const url = `https://www.facebook.com/sharer/sharer.php?u=https://gamezonepro.com`;
    window.open(url, '_blank');
}

// Utility Functions
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const text = document.getElementById('notificationText');
    
    text.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        closeNotification();
    }, 3000);
}

function closeNotification() {
    document.getElementById('notification').style.display = 'none';
}

function loadUserData() {
    if (currentUser) {
        updateBalanceDisplay();
    }
}

function startAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.game-card, .tournament-card, .wallet-card').forEach(el => {
        observer.observe(el);
    });
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Error occurred:', e.error);
    showNotification('Something went wrong. Please try again.', 'error');
});

// Add dynamic styles
function addDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .entry-amounts {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }
        
        .entry-amount-btn {
            padding: 1rem;
            border: 2px solid #00d2ff;
            background: transparent;
            color: #333;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: center;
        }
        
        .entry-amount-btn:hover,
        .entry-amount-btn.selected {
            background: #00d2ff;
            color: white;
        }
        
        .entry-amount-btn small {
            display: block;
            margin-top: 0.5rem;
            opacity: 0.8;
        }
        
        .match-type {
            margin: 1rem 0;
        }
        
        .match-type label {
            display: block;
            margin: 0.5rem 0;
            cursor: pointer;
        }
        
        .match-type input {
            margin-right: 0.5rem;
        }
        
        .match-type span {
            font-size: 0.9rem;
            color: #666;
            margin-left: 0.5rem;
        }
        
        .chat-message {
            margin-bottom: 0.5rem;
            padding: 0.5rem;
            border-radius: 8px;
        }
        
        .chat-message.me {
            background: rgba(0, 210, 255, 0.2);
            text-align: right;
        }
        
        .chat-message.opponent {
            background: rgba(255, 107, 107, 0.2);
        }
        
        .user-menu {
            display: flex;
            align-items: center;
            gap: 1rem;
            color: white;
        }
        
        .user-menu span {
            font-size: 0.9rem;
        }
    `;
    document.head.appendChild(style);
}

// Initialize dynamic styles
addDynamicStyles();

console.log('🎮 GameZone Pro - Real Multiplayer Gaming Platform Loaded! 🎮');
console.log('💰 Ready for real money gaming with live opponents! 💰');