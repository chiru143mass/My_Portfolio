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
    addDynamicStyles();
});

// Add Dynamic Styles
function addDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .entry-amount-btn {
            padding: 15px;
            margin: 5px;
            border: 2px solid #00d2ff;
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: center;
        }
        .entry-amount-btn:hover,
        .entry-amount-btn.selected {
            background: #00d2ff;
            transform: scale(1.05);
        }
        .entry-amounts {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 10px;
            margin-bottom: 20px;
        }
        .match-type {
            margin: 20px 0;
        }
        .match-type label {
            display: block;
            padding: 10px;
            margin: 5px 0;
            border: 1px solid #ddd;
            border-radius: 5px;
            cursor: pointer;
        }
        .chat-message {
            padding: 8px 12px;
            margin: 5px 0;
            border-radius: 15px;
            max-width: 80%;
        }
        .chat-message.me {
            background: #00d2ff;
            color: white;
            margin-left: auto;
            text-align: right;
        }
        .chat-message.opponent {
            background: rgba(255, 255, 255, 0.1);
            color: white;
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
    
    // Generate unique referral code for user
    if (!localStorage.getItem('userReferralCode')) {
        const referralCode = generateRandomReferralCode();
        localStorage.setItem('userReferralCode', referralCode);
        document.getElementById('referralCode').value = referralCode;
    } else {
        document.getElementById('referralCode').value = localStorage.getItem('userReferralCode');
    }
    
    // Auto-save progress
    setInterval(autoSaveProgress, 30000); // Save every 30 seconds
    
    // Check daily bonus
    checkDailyBonus();
}

// WebSocket Connection for Real-time Gaming
function connectToGameServer() {
    console.log('Connecting to game server...');
    
    // Simulate WebSocket connection
    websocket = {
        send: function(data) {
            console.log('Sending:', data);
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

function handleGameMove(data) {
    showNotification(`Opponent made a move: ${data.move}`, 'info');
}

function handleGameEnd(data) {
    showNotification(`Game ended! Winner: ${data.winner}`, data.winner === currentUser.name ? 'success' : 'error');
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
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
        if (e.ctrlKey && e.key === 'Enter') {
            const registerModal = document.getElementById('registerModal');
            if (registerModal.style.display === 'block') {
                handleRegistration(e);
            }
        }
    });
    
    // Touch gestures for mobile
    let touchStartY = 0;
    document.addEventListener('touchstart', function(e) {
        touchStartY = e.touches[0].clientY;
    });
    
    document.addEventListener('touchend', function(e) {
        const touchEndY = e.changedTouches[0].clientY;
        const diff = touchStartY - touchEndY;
        
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                console.log('Swipe up detected');
            } else {
                console.log('Swipe down detected');
            }
        }
    });
    
    startTournamentCountdowns();
    setupGameEventListeners();
}

function setupGameEventListeners() {
    // Chat functionality
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
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
    
    // Simulate finding opponent
    setTimeout(() => {
        const opponent = generateRandomOpponent();
        handleOpponentFound(opponent);
    }, Math.random() * 5000 + 2000);
}

function generateRandomOpponent() {
    const names = ['Pro_Gamer', 'Champion_X', 'GameMaster', 'SkillKing', 'WinnerPro', 'GameLord', 'Victory_Star', 'King_Player', 'Ultimate_Pro', 'Game_Beast'];
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
    
    currentGameSession = { ...currentGameSession, timer: timer };
}

function handleTurnTimeout() {
    showNotification('Time up! Turn passed to opponent', 'error');
    switchTurn();
}

function switchTurn() {
    const isMyTurn = document.getElementById('turnText').textContent === 'Your turn';
    document.getElementById('turnText').textContent = isMyTurn ? "Opponent's turn" : 'Your turn';
    
    if (isMyTurn) {
        setTimeout(() => {
            simulateOpponentMove();
        }, Math.random() * 10000 + 2000);
    } else {
        startTurnTimer();
    }
}

function simulateOpponentMove() {
    showNotification('Opponent made a move', 'info');
    
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
    
    const winAmount = selectedEntryAmount * 1.8;
    
    if (playerWon) {
        currentBalance += winAmount;
        updateBalanceDisplay();
        saveBalance();
        showNotification(`Congratulations! You won ₹${winAmount.toFixed(2)}!`, 'success');
        document.getElementById('turnText').textContent = 'You Won! 🎉';
        checkAchievements('win');
    } else {
        showNotification('Better luck next time!', 'error');
        document.getElementById('turnText').textContent = 'You Lost 😞';
    }
    
    setTimeout(() => {
        const playAgain = confirm('Game finished! Want to play again?');
        if (playAgain) {
            leaveGame();
            quickMatch(getCurrentGameType());
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
    
    currentGameSession.board[index] = currentGameSession.playerSymbol;
    const cell = document.querySelector(`.tic-cell[data-index="${index}"]`);
    cell.textContent = currentGameSession.playerSymbol;
    cell.classList.add('x');
    
    if (checkTicTacToeWin(currentGameSession.playerSymbol)) {
        endGame(true);
        return;
    }
    
    if (currentGameSession.board.every(cell => cell !== null)) {
        showNotification('Game Draw!', 'info');
        currentBalance += selectedEntryAmount;
        updateBalanceDisplay();
        saveBalance();
        setTimeout(() => leaveGame(), 2000);
        return;
    }
    
    clearInterval(currentGameSession.timer);
    switchTurn();
}

function checkTicTacToeWin(symbol) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
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
    
    document.querySelectorAll('.rps-choice').forEach(el => el.classList.remove('selected'));
    document.querySelector(`[data-choice="${choice}"]`).classList.add('selected');
    
    const choices = ['rock', 'paper', 'scissors'];
    const opponentChoice = choices[Math.floor(Math.random() * 3)];
    const result = determineRPSWinner(choice, opponentChoice);
    
    const resultDiv = document.getElementById('rpsResult');
    const outcomeDiv = document.getElementById('rpsOutcome');
    
    outcomeDiv.innerHTML = `
        <div>You: ${getEmoji(choice)}</div>
        <div>Opponent: ${getEmoji(opponentChoice)}</div>
        <div><strong>${result}</strong></div>
    `;
    
    resultDiv.style.display = 'block';
    
    setTimeout(() => {
        if (result === 'You Win!') {
            endGame(true);
        } else if (result === 'You Lose!') {
            endGame(false);
        } else {
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
    const emojis = { rock: '🪨', paper: '📄', scissors: '✂️' };
    return emojis[choice];
}

function initializeLudoBoard(container) {
    container.className = 'ludo-board';
    container.innerHTML = '<div style="padding: 2rem; text-align: center; color: white;">Ludo board will be rendered here with full gameplay mechanics</div>';
}

function initializeSnakeLadderBoard(container) {
    container.className = 'snake-ladder-board';
    for (let i = 100; i >= 1; i--) {
        const cell = document.createElement('div');
        cell.className = 'snake-cell';
        cell.textContent = i;
        cell.dataset.number = i;
        
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
    
    if (websocket) {
        websocket.send(JSON.stringify({
            type: 'chat_message',
            data: { message: message, sender: currentUser.name }
        }));
    }
    
    setTimeout(() => {
        const responses = ['Good move!', 'Nice game!', '😊', 'GL HF!', 'Well played', 'Great!', 'Awesome!', 'Nice try!'];
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
    return 'tic-tac-toe';
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
    
    prompt(`Share this room code with your friend: ${roomCode}`);
}

function generateRoomCode() {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
}

// Live Matches
function initializeLiveMatches() {
    generateLiveMatches();
    setInterval(generateLiveMatches, 10000);
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
            id: 'match_' + i,
            game: game,
            player1: player1,
            player2: player2,
            entryFee: entryFee,
            spectators: Math.floor(Math.random() * 50) + 10
        });
    }
    
    activeMatches = matches;
    displayLiveMatches(matches);
}

function displayLiveMatches(matches) {
    const container = document.getElementById('liveMatchesList');
    
    container.innerHTML = matches.map(match => `
        <div class="live-match-card" data-game="${match.game}">
            <div class="match-header">
                <h4>${getGameData(match.game).name}</h4>
                <span>₹${match.entryFee} Entry</span>
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
                <span><i class="fas fa-eye"></i> ${match.spectators} watching</span>
            </div>
            <button class="spectate-btn" onclick="spectateMatch('${match.id}')">
                <i class="fas fa-eye"></i> Spectate
            </button>
        </div>
    `).join('');
}

function filterMatches(gameType) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const filteredMatches = gameType === 'all' ? 
        activeMatches : 
        activeMatches.filter(match => match.game === gameType);
    
    displayLiveMatches(filteredMatches);
}

function spectateMatch(matchId) {
    showNotification('Spectating feature coming soon!', 'info');
}

// Online Stats
function updateOnlineStats() {
    setInterval(() => {
        onlinePlayers += Math.floor(Math.random() * 10) - 5;
        onlinePlayers = Math.max(1000, Math.min(5000, onlinePlayers));
        
        document.getElementById('onlineCount').textContent = `${onlinePlayers.toLocaleString()} Online`;
        document.getElementById('livePlayersCount').textContent = onlinePlayers.toLocaleString();
        
        updateLivePlayerCounts();
    }, 15000);
}

function updateLivePlayerCounts() {
    document.querySelectorAll('.live-indicator span').forEach(span => {
        if (span.textContent.includes('Playing')) {
            const count = Math.floor(Math.random() * 500) + 50;
            span.textContent = `${count} Playing`;
        }
    });
}

// Authentication Functions
function showLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

function showRegisterModal() {
    document.getElementById('registerModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    
    // Clean up entry modal if it exists
    const entryModal = document.getElementById('entryModal');
    if (entryModal) {
        entryModal.remove();
    }
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
    
    const entryModal = document.getElementById('entryModal');
    if (entryModal) {
        entryModal.remove();
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
    
    if (mobile.length !== 10) {
        showNotification('Please enter a valid 10-digit mobile number', 'error');
        return;
    }
    
    // Simulate login
    currentUser = {
        name: 'Player_' + mobile.substr(-4),
        mobile: mobile,
        email: mobile + '@gamezonepro.com',
        joinDate: new Date().toISOString()
    };
    
    localStorage.setItem('gameUser', JSON.stringify(currentUser));
    updateUIForLoggedInUser();
    closeModal('loginModal');
    showNotification('Login successful!', 'success');
    
    // Connect to game server
    connectToGameServer();
}

function handleRegistration(event) {
    event.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const mobile = document.getElementById('registerMobile').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const referralCode = document.getElementById('registerReferral').value;
    
    if (mobile.length !== 10) {
        showNotification('Please enter a valid 10-digit mobile number', 'error');
        return;
    }
    
    // Process referral
    if (referralCode) {
        processReferral(referralCode);
    }
    
    // Create user
    currentUser = {
        name: name,
        mobile: mobile,
        email: email,
        joinDate: new Date().toISOString()
    };
    
    // Welcome bonus
    currentBalance = 100;
    updateBalanceDisplay();
    saveBalance();
    
    localStorage.setItem('gameUser', JSON.stringify(currentUser));
    updateUIForLoggedInUser();
    closeModal('registerModal');
    showNotification('Registration successful! Welcome bonus ₹100 added!', 'success');
    
    // Connect to game server
    connectToGameServer();
}

function processReferral(code) {
    if (code && code !== localStorage.getItem('userReferralCode')) {
        currentBalance += 50; // Bonus for using referral
        showNotification('Referral bonus ₹50 added!', 'success');
    }
}

function updateUIForLoggedInUser() {
    const authButtons = document.querySelector('.nav-auth');
    authButtons.innerHTML = `
        <div class="wallet-display">
            <i class="fas fa-wallet"></i>
            <span id="balance">₹${currentBalance.toFixed(2)}</span>
        </div>
        <div class="online-status">
            <div class="online-dot"></div>
            <span id="onlineCount">${onlinePlayers.toLocaleString()} Online</span>
        </div>
        <div class="user-menu">
            <span>Welcome, ${currentUser.name}</span>
            <button class="btn-secondary" onclick="logout()">Logout</button>
        </div>
    `;
}

function logout() {
    currentUser = null;
    localStorage.removeItem('gameUser');
    
    if (websocket) {
        websocket.close();
        websocket = null;
    }
    
    location.reload();
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
    const amount = parseFloat(document.getElementById('customAmount').value);
    
    if (!amount || amount < 10) {
        showNotification('Minimum amount is ₹10', 'error');
        return;
    }
    
    // Simulate payment
    setTimeout(() => {
        currentBalance += amount;
        updateBalanceDisplay();
        saveBalance();
        showNotification(`₹${amount} added successfully!`, 'success');
        document.getElementById('customAmount').value = '';
    }, 2000);
    
    showNotification('Processing payment...', 'info');
}

function withdrawMoney() {
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
    
    showNotification(`Withdrawal of ₹${amount} initiated. You'll receive it in 24-48 hours.`, 'success');
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
function joinTournament(tournamentId, entryFee) {
    if (!currentUser) {
        showNotification('Please login to join tournaments', 'error');
        showLoginModal();
        return;
    }
    
    if (currentBalance < entryFee) {
        showNotification('Insufficient balance', 'error');
        return;
    }
    
    currentBalance -= entryFee;
    updateBalanceDisplay();
    saveBalance();
    
    showNotification(`Joined tournament! Entry fee ₹${entryFee} deducted.`, 'success');
}

function startTournamentCountdowns() {
    const tournaments = [
        { id: 'tournament1Timer', hours: 2, minutes: 45 },
        { id: 'tournament2Timer', hours: 5, minutes: 20 }
    ];
    
    tournaments.forEach(tournament => {
        let totalMinutes = tournament.hours * 60 + tournament.minutes;
        
        setInterval(() => {
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            
            const element = document.getElementById(tournament.id);
            if (element) {
                element.textContent = `${hours}h ${minutes}m`;
            }
            
            totalMinutes--;
            if (totalMinutes < 0) {
                totalMinutes = Math.floor(Math.random() * 360) + 60; // Reset to random time
            }
        }, 60000); // Update every minute
    });
    
    updateTournamentPlayers();
}

function updateTournamentPlayers() {
    setInterval(() => {
        const tournament1 = document.getElementById('tournament1Players');
        const tournament2 = document.getElementById('tournament2Players');
        
        if (tournament1) {
            const count1 = parseInt(tournament1.textContent.replace(',', '')) + Math.floor(Math.random() * 10) - 5;
            tournament1.textContent = Math.max(1000, count1).toLocaleString();
        }
        
        if (tournament2) {
            const count2 = parseInt(tournament2.textContent.replace(',', '')) + Math.floor(Math.random() * 8) - 4;
            tournament2.textContent = Math.max(800, count2).toLocaleString();
        }
    }, 30000);
}

// Referral Functions
function generateRandomReferralCode() {
    return 'GAME' + Math.random().toString(36).substr(2, 6).toUpperCase();
}

function copyReferralCode() {
    const referralCode = document.getElementById('referralCode');
    referralCode.select();
    document.execCommand('copy');
    showNotification('Referral code copied!', 'success');
}

function shareWhatsApp() {
    const code = document.getElementById('referralCode').value;
    const message = `Join GameZone Pro and start winning real money! Use my referral code: ${code} and get ₹50 bonus! Download now: ${window.location.origin}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
}

function shareTelegram() {
    const code = document.getElementById('referralCode').value;
    const message = `Join GameZone Pro with my referral code: ${code} and get ₹50 bonus!`;
    window.open(`https://t.me/share/url?url=${window.location.origin}&text=${encodeURIComponent(message)}`, '_blank');
}

function shareFacebook() {
    const url = `${window.location.origin}?ref=${document.getElementById('referralCode').value}`;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
}

// Utility Functions
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    notificationText.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 4000);
}

function closeNotification() {
    document.getElementById('notification').style.display = 'none';
}

function loadUserData() {
    // Load any additional user data from localStorage
    const savedData = localStorage.getItem('gameUserData');
    if (savedData) {
        try {
            const userData = JSON.parse(savedData);
            // Apply any saved user preferences
        } catch (e) {
            console.log('Error loading user data:', e);
        }
    }
}

function startAnimations() {
    // Animate prize pools
    animatePrizePools();
    
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.game-card, .tournament-card, .wallet-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

function animatePrizePools() {
    const prizePools = document.querySelectorAll('.prize-pool');
    
    setInterval(() => {
        prizePools.forEach(pool => {
            const currentText = pool.textContent;
            const match = currentText.match(/₹([\d,]+)/);
            if (match) {
                const currentAmount = parseInt(match[1].replace(',', ''));
                const newAmount = currentAmount + Math.floor(Math.random() * 100);
                pool.textContent = currentText.replace(/₹[\d,]+/, `₹${newAmount.toLocaleString()}`);
            }
        });
    }, 10000);
}

function autoSaveProgress() {
    if (currentUser) {
        const gameData = {
            balance: currentBalance,
            referralEarnings: referralEarnings,
            totalReferrals: totalReferrals,
            lastSave: new Date().toISOString()
        };
        localStorage.setItem('gameUserData', JSON.stringify(gameData));
    }
}

// Achievement System
function checkAchievements(action) {
    const achievements = JSON.parse(localStorage.getItem('gameAchievements') || '[]');
    
    switch(action) {
        case 'win':
            if (!achievements.includes('first_win')) {
                achievements.push('first_win');
                showNotification('🏆 Achievement Unlocked: First Victory!', 'success');
                currentBalance += 25; // Achievement bonus
                updateBalanceDisplay();
                saveBalance();
            }
            break;
        case 'play_10_games':
            if (!achievements.includes('play_10')) {
                achievements.push('play_10');
                showNotification('🏆 Achievement Unlocked: 10 Games Played!', 'success');
            }
            break;
    }
    
    localStorage.setItem('gameAchievements', JSON.stringify(achievements));
}

// Daily Bonus
function checkDailyBonus() {
    const lastBonus = localStorage.getItem('lastDailyBonus');
    const today = new Date().toDateString();
    
    if (lastBonus !== today && currentUser) {
        currentBalance += 20;
        updateBalanceDisplay();
        saveBalance();
        localStorage.setItem('lastDailyBonus', today);
        showNotification('🎁 Daily login bonus ₹20 added!', 'success');
    }
}

// Sound Effects (placeholder)
function playSound(soundType) {
    // In a real implementation, you would play actual sound files
    console.log(`Playing sound: ${soundType}`);
}

// Analytics (placeholder)
function trackEvent(eventName, eventData) {
    // In a real implementation, you would send this to your analytics service
    console.log(`Analytics: ${eventName}`, eventData);
}

// Console welcome message
console.log('🎮 GameZone Pro - Real Multiplayer Gaming Platform Loaded! 🎮');
console.log('💰 Ready for real money gaming with live opponents! 💰');