// Global Variables
let currentBalance = 0;
let currentUser = null;
let referralEarnings = 0;
let totalReferrals = 0;

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadUserData();
    setupEventListeners();
    startAnimations();
});

// Initialize Application
function initializeApp() {
    // Load saved data from localStorage
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

// Setup Event Listeners
function setupEventListeners() {
    // Amount button listeners
    document.querySelectorAll('.amount-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            selectAmount(this.dataset.amount);
        });
    });
    
    // Form submissions
    document.querySelectorAll('.auth-form').forEach(form => {
        form.addEventListener('submit', handleFormSubmission);
    });
    
    // Smooth scrolling for navigation
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
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });
    
    // Tournament countdown timers
    startTournamentCountdowns();
}

// User Authentication Functions
function showLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

function showRegisterModal() {
    document.getElementById('registerModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function switchToRegister() {
    closeModal('loginModal');
    showRegisterModal();
}

function switchToLogin() {
    closeModal('registerModal');
    showLoginModal();
}

function handleFormSubmission(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const isLoginForm = e.target.closest('#loginModal');
    
    if (isLoginForm) {
        handleLogin(formData);
    } else {
        handleRegistration(formData);
    }
}

function handleLogin(formData) {
    // Simulate login process
    const mobile = formData.get('mobile') || document.querySelector('#loginModal input[type="tel"]').value;
    const password = formData.get('password') || document.querySelector('#loginModal input[type="password"]').value;
    
    if (mobile && password) {
        currentUser = {
            name: 'Player',
            mobile: mobile,
            balance: currentBalance
        };
        
        localStorage.setItem('gameUser', JSON.stringify(currentUser));
        closeModal('loginModal');
        updateUIForLoggedInUser();
        showNotification('Login successful! Welcome back!', 'success');
        
        // Add welcome bonus
        if (currentBalance === 0) {
            addWelcomeBonus();
        }
    } else {
        showNotification('Please fill all fields', 'error');
    }
}

function handleRegistration(formData) {
    // Get form values
    const name = document.querySelector('#registerModal input[placeholder="Full Name"]').value;
    const mobile = document.querySelector('#registerModal input[placeholder="Mobile Number"]').value;
    const email = document.querySelector('#registerModal input[placeholder="Email Address"]').value;
    const password = document.querySelector('#registerModal input[placeholder="Create Password"]').value;
    const referralCode = document.querySelector('#registerModal input[placeholder="Referral Code (Optional)"]').value;
    const termsAccepted = document.querySelector('#registerModal input[type="checkbox"]').checked;
    
    if (!name || !mobile || !email || !password) {
        showNotification('Please fill all required fields', 'error');
        return;
    }
    
    if (!termsAccepted) {
        showNotification('Please accept Terms & Conditions', 'error');
        return;
    }
    
    // Simulate registration
    currentUser = {
        name: name,
        mobile: mobile,
        email: email,
        balance: 0
    };
    
    localStorage.setItem('gameUser', JSON.stringify(currentUser));
    closeModal('registerModal');
    updateUIForLoggedInUser();
    
    // Process referral if provided
    if (referralCode) {
        processReferral(referralCode);
    }
    
    // Add welcome bonus
    addWelcomeBonus();
    showNotification('Registration successful! Welcome bonus added!', 'success');
}

function updateUIForLoggedInUser() {
    if (currentUser) {
        // Update nav buttons
        const authDiv = document.querySelector('.nav-auth');
        authDiv.innerHTML = `
            <div class="wallet-display">
                <i class="fas fa-wallet"></i>
                <span id="balance">₹${currentBalance.toFixed(2)}</span>
            </div>
            <div class="user-menu">
                <span>Hi, ${currentUser.name}</span>
                <button class="btn-secondary" onclick="logout()">Logout</button>
            </div>
        `;
    }
}

function logout() {
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
    // Remove active class from all buttons
    document.querySelectorAll('.amount-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Set the custom amount input
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
    
    // Simulate payment processing
    processPayment(amount);
}

function processPayment(amount) {
    // Show loading
    showNotification('Processing payment...', 'info');
    
    // Simulate payment gateway delay
    setTimeout(() => {
        const success = Math.random() > 0.1; // 90% success rate
        
        if (success) {
            currentBalance += amount;
            updateBalanceDisplay();
            saveBalance();
            showNotification(`₹${amount} added successfully!`, 'success');
            
            // Clear form
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
    
    // Process withdrawal
    currentBalance -= amount;
    updateBalanceDisplay();
    saveBalance();
    
    showNotification(`Withdrawal of ₹${amount} initiated. Will be processed in 24-48 hours.`, 'success');
    
    // Clear form
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

// Game Functions
function playGame(gameType) {
    if (!currentUser) {
        showNotification('Please login to play games', 'error');
        showLoginModal();
        return;
    }
    
    // Show game selection modal
    showGameModal(gameType);
}

function showGameModal(gameType) {
    const modal = document.getElementById('gameModal');
    const content = document.getElementById('gameContent');
    
    const gameData = {
        ludo: {
            name: 'Ludo King',
            icon: 'fas fa-dice',
            entryFees: [10, 25, 50, 100, 250, 500, 1000],
            maxWin: 10000
        },
        rummy: {
            name: 'Rummy',
            icon: 'fas fa-layer-group',
            entryFees: [25, 50, 100, 250, 500, 1000, 2500],
            maxWin: 25000
        },
        carrom: {
            name: 'Carrom',
            icon: 'fas fa-circle',
            entryFees: [5, 10, 25, 50, 100, 250, 500],
            maxWin: 5000
        },
        fantasy: {
            name: 'Fantasy Cricket',
            icon: 'fas fa-trophy',
            entryFees: [20, 50, 100, 200, 500, 1000, 2000],
            maxWin: 20000
        }
    };
    
    const game = gameData[gameType];
    
    content.innerHTML = `
        <div class="game-lobby">
            <div class="game-header">
                <i class="${game.icon}"></i>
                <h2>${game.name}</h2>
            </div>
            <div class="entry-options">
                <h3>Select Entry Fee</h3>
                <div class="entry-grid">
                    ${game.entryFees.map(fee => `
                        <div class="entry-option" onclick="startGame('${gameType}', ${fee})">
                            <div class="entry-fee">₹${fee}</div>
                            <div class="win-amount">Win up to ₹${fee * 10}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="game-rules">
                <h4>How to Play</h4>
                <ul>
                    <li>Select your entry fee</li>
                    <li>Get matched with players of similar skill</li>
                    <li>Win real money based on your performance</li>
                    <li>Withdraw winnings instantly</li>
                </ul>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

function startGame(gameType, entryFee) {
    if (currentBalance < entryFee) {
        showNotification('Insufficient balance. Please add money.', 'error');
        return;
    }
    
    // Deduct entry fee
    currentBalance -= entryFee;
    updateBalanceDisplay();
    saveBalance();
    
    closeModal('gameModal');
    
    // Simulate game
    simulateGame(gameType, entryFee);
}

function simulateGame(gameType, entryFee) {
    showNotification('Finding opponents...', 'info');
    
    setTimeout(() => {
        showNotification('Game started! Good luck!', 'info');
        
        // Simulate game duration (3-10 seconds)
        const gameDuration = Math.random() * 7000 + 3000;
        
        setTimeout(() => {
            const won = Math.random() > 0.4; // 60% win rate
            
            if (won) {
                const winAmount = entryFee * (Math.random() * 8 + 2); // 2x to 10x multiplier
                currentBalance += winAmount;
                updateBalanceDisplay();
                saveBalance();
                showNotification(`Congratulations! You won ₹${winAmount.toFixed(2)}!`, 'success');
            } else {
                showNotification('Better luck next time!', 'error');
            }
        }, gameDuration);
    }, 2000);
}

// Referral Functions
function processReferral(referralCode) {
    // Simulate referral processing
    if (referralCode && referralCode.length > 0) {
        // Add bonus to referrer (simulated)
        showNotification('Referral code applied! Both you and your friend will get bonuses.', 'success');
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
    const message = `Join GameZone Pro and win real money! Use my referral code: ${referralCode} and get ₹50 bonus. Download now: https://gamezonepro.com`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

function shareTelegram() {
    const referralCode = document.getElementById('referralCode').value;
    const message = `Join GameZone Pro and win real money! Use my referral code: ${referralCode} and get ₹50 bonus. Download now: https://gamezonepro.com`;
    const url = `https://t.me/share/url?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

function shareFacebook() {
    const url = `https://www.facebook.com/sharer/sharer.php?u=https://gamezonepro.com`;
    window.open(url, '_blank');
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
    
    // Deduct entry fee
    currentBalance -= entryFee;
    updateBalanceDisplay();
    saveBalance();
    
    showNotification(`Joined ${tournamentName}! Good luck!`, 'success');
}

function startTournamentCountdowns() {
    const countdowns = document.querySelectorAll('.tournament-details p:last-child');
    
    countdowns.forEach(countdown => {
        if (countdown.textContent.includes('Ends in:')) {
            updateCountdown(countdown);
            setInterval(() => updateCountdown(countdown), 1000);
        }
    });
}

function updateCountdown(element) {
    // Simulate countdown - this would normally come from server
    const now = new Date().getTime();
    const endTime = now + (Math.random() * 6 * 60 * 60 * 1000); // Random time up to 6 hours
    const distance = endTime - now;
    
    const hours = Math.floor(distance / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    
    element.innerHTML = `<i class="fas fa-clock"></i> Ends in: ${hours}h ${minutes}m`;
}

// Utility Functions
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const text = document.getElementById('notificationText');
    
    text.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        closeNotification();
    }, 3000);
}

function closeNotification() {
    document.getElementById('notification').style.display = 'none';
}

function loadUserData() {
    // Simulate loading user data from server
    if (currentUser) {
        // Update UI with user data
        updateBalanceDisplay();
    }
}

function startAnimations() {
    // Add entrance animations to elements
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
    
    // Observe all game cards and other elements
    document.querySelectorAll('.game-card, .tournament-card, .wallet-card').forEach(el => {
        observer.observe(el);
    });
}

// Game Lobby CSS (added via JavaScript)
function addGameLobbyStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .game-lobby {
            padding: 2rem;
            text-align: center;
        }
        
        .game-header {
            margin-bottom: 2rem;
        }
        
        .game-header i {
            font-size: 4rem;
            color: #00d2ff;
            margin-bottom: 1rem;
        }
        
        .game-header h2 {
            color: #1a1a2e;
            margin-bottom: 1rem;
        }
        
        .entry-options h3 {
            margin-bottom: 1.5rem;
            color: #1a1a2e;
        }
        
        .entry-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }
        
        .entry-option {
            background: white;
            border: 2px solid #00d2ff;
            border-radius: 15px;
            padding: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .entry-option:hover {
            background: #00d2ff;
            color: white;
            transform: translateY(-3px);
        }
        
        .entry-fee {
            font-size: 1.2rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
        }
        
        .win-amount {
            font-size: 0.9rem;
            opacity: 0.8;
        }
        
        .game-rules {
            background: #f8f9fa;
            padding: 1.5rem;
            border-radius: 15px;
            text-align: left;
        }
        
        .game-rules h4 {
            margin-bottom: 1rem;
            color: #1a1a2e;
        }
        
        .game-rules ul {
            list-style-position: inside;
        }
        
        .game-rules li {
            margin-bottom: 0.5rem;
            color: #666;
        }
    `;
    document.head.appendChild(style);
}

// Initialize game lobby styles
addGameLobbyStyles();

// Add click handlers for tournament join buttons
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('join-tournament')) {
        const entryFee = parseInt(e.target.textContent.match(/₹(\d+)/)[1]);
        const tournamentName = e.target.closest('.tournament-card').querySelector('h3').textContent;
        joinTournament(tournamentName, entryFee);
    }
});

// Smooth scroll to top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Add scroll to top button
window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 300) {
        if (!document.getElementById('scrollTopBtn')) {
            const btn = document.createElement('button');
            btn.id = 'scrollTopBtn';
            btn.innerHTML = '<i class="fas fa-arrow-up"></i>';
            btn.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 50px;
                height: 50px;
                background: linear-gradient(45deg, #00d2ff, #3a7bd5);
                color: white;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                z-index: 1000;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                transition: all 0.3s ease;
            `;
            btn.onclick = scrollToTop;
            document.body.appendChild(btn);
        }
    } else {
        const btn = document.getElementById('scrollTopBtn');
        if (btn) {
            btn.remove();
        }
    }
});

// Performance optimization - lazy load images
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading
lazyLoadImages();

// Error handling for network requests
window.addEventListener('error', function(e) {
    console.error('Error occurred:', e.error);
    showNotification('Something went wrong. Please try again.', 'error');
});

// Service Worker for PWA functionality (if needed)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(err) {
                console.log('ServiceWorker registration failed');
            });
    });
}