# 🎮 Real-Money Gaming Platform

A comprehensive full-stack gaming platform built with **React.js**, **Node.js**, **Express**, **MongoDB**, and **Socket.IO** that enables users to play real-money multiplayer games like Ludo, Snake & Ladder, and Number Guess.

## ✨ Features

### 🔐 User Authentication & Management
- **Secure Registration & Login** with JWT-based authentication
- **Password Reset** functionality via email
- **User Profile Management** with avatars and game statistics
- **Referral System** with bonus rewards for inviting friends

### 💰 Wallet & Payment System
- **Integrated Wallet** with real-time balance tracking
- **Razorpay Integration** for secure deposits and withdrawals
- **Transaction History** with detailed payment records
- **Daily/Monthly Limits** for responsible gaming
- **Automatic Payouts** for game winners

### 🎯 Gaming Features
- **Real-time Multiplayer Games** powered by Socket.IO
- **Multiple Game Types**: Ludo, Snake & Ladder, Number Guess
- **Game Lobby** with public and private rooms
- **Live Chat** during gameplay
- **Leaderboards** with weekly/monthly rankings
- **Game Statistics** and win/loss tracking

### 👨‍💼 Admin Panel
- **Dashboard** with key metrics and analytics
- **User Management** with account controls
- **Transaction Monitoring** and withdrawal approvals
- **Game Oversight** with the ability to cancel/refund games
- **Revenue Tracking** and platform statistics

### 📱 Modern UI/UX
- **Responsive Design** that works on desktop and mobile
- **Beautiful Animations** with Framer Motion
- **Real-time Notifications** via React Hot Toast
- **Dark/Light Theme** support
- **Progressive Web App** capabilities

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Socket.IO Client** - Real-time communication
- **React Query** - Server state management
- **React Hook Form** - Form handling
- **Framer Motion** - Animations and transitions
- **Axios** - HTTP client

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing
- **Nodemailer** - Email service
- **Razorpay** - Payment gateway integration

### DevOps & Security
- **Helmet** - Security middleware
- **Rate Limiting** - API protection
- **CORS** - Cross-origin resource sharing
- **Environment Variables** - Configuration management
- **Error Handling** - Comprehensive error management

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/gaming-platform.git
cd gaming-platform
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

3. **Environment Setup**

Create `.env` file in the server directory:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/gaming_platform

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Client URL
CLIENT_URL=http://localhost:3000

# Admin Credentials
ADMIN_EMAIL=admin@gamingplatform.com
ADMIN_PASSWORD=admin123
```

Create `.env` file in the client directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

4. **Start the application**
```bash
# Start both server and client concurrently
npm run dev

# Or start individually
npm run server  # Start backend server
npm run client  # Start React development server
```

5. **Access the application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Admin Panel**: http://localhost:3000/admin

## 📊 Database Schema

### User Model
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  phone: String,
  avatar: String,
  wallet: {
    balance: Number,
    totalDeposited: Number,
    totalWithdrawn: Number,
    totalWinnings: Number
  },
  gameStats: {
    totalGamesPlayed: Number,
    totalGamesWon: Number,
    winRate: Number,
    favoriteGame: String
  },
  referral: {
    code: String,
    referredBy: ObjectId,
    referredUsers: [ObjectId],
    totalEarnings: Number
  },
  role: String (user/admin),
  isActive: Boolean,
  isVerified: Boolean
}
```

### Game Model
```javascript
{
  gameType: String (ludo/snake_ladder/number_guess),
  roomId: String,
  players: [{
    user: ObjectId,
    username: String,
    position: Number,
    entryFee: Number,
    status: String
  }],
  gameConfig: {
    maxPlayers: Number,
    entryFee: Number,
    winnerPrize: Number,
    gameMode: String
  },
  gameState: {
    status: String,
    currentTurn: ObjectId,
    boardState: Mixed,
    winner: ObjectId
  },
  chat: [{ user, message, timestamp }]
}
```

### Transaction Model
```javascript
{
  user: ObjectId,
  type: String (deposit/withdrawal/game_win/game_loss),
  amount: Number,
  status: String (pending/completed/failed),
  description: String,
  paymentGateway: String,
  balanceBefore: Number,
  balanceAfter: Number
}
```

## 🎮 Game Types

### 1. Ludo
- **Players**: 2-4
- **Entry Fee**: ₹10 - ₹5000
- **Rules**: Classic Ludo rules with dice rolling and piece movement
- **Winner**: First player to get all pieces home

### 2. Snake & Ladder
- **Players**: 2-4
- **Entry Fee**: ₹10 - ₹5000
- **Rules**: Traditional Snake & Ladder with snakes and ladders
- **Winner**: First player to reach position 100

### 3. Number Guess
- **Players**: 2-4
- **Entry Fee**: ₹10 - ₹5000
- **Rules**: Guess the secret number (1-100) with hints
- **Winner**: Player who guesses the correct number

## 💳 Payment Integration

### Razorpay Setup
1. Create a Razorpay account
2. Get API keys from the dashboard
3. Add keys to environment variables
4. Configure webhooks for payment verification

### Supported Payment Methods
- Credit/Debit Cards
- UPI (Google Pay, PhonePe, Paytm)
- Net Banking
- Wallet payments

## 🔒 Security Features

- **JWT Authentication** with secure token management
- **Password Hashing** using bcrypt
- **Rate Limiting** to prevent API abuse
- **Input Validation** and sanitization
- **CORS Configuration** for cross-origin requests
- **Helmet** for security headers
- **Environment Variables** for sensitive data

## 📱 API Endpoints

### Authentication
```
POST /api/auth/register - User registration
POST /api/auth/login - User login
GET /api/auth/me - Get current user
POST /api/auth/forgot-password - Forgot password
PUT /api/auth/reset-password/:token - Reset password
```

### Wallet
```
GET /api/wallet/balance - Get wallet balance
POST /api/wallet/deposit/create-order - Create deposit order
POST /api/wallet/deposit/verify - Verify payment
POST /api/wallet/withdraw - Request withdrawal
GET /api/wallet/transactions - Get transaction history
```

### Games
```
GET /api/games/lobby - Get game lobby
POST /api/games/create - Create new game
GET /api/games/:roomId - Get game details
POST /api/games/:roomId/join - Join game
POST /api/games/:roomId/leave - Leave game
GET /api/games/leaderboard - Get leaderboard
```

### Admin
```
GET /api/admin/dashboard - Admin dashboard stats
GET /api/admin/users - Get all users
GET /api/admin/transactions - Get all transactions
PUT /api/admin/transactions/:id/process-withdrawal - Process withdrawal
```

## 🌐 Socket Events

### Game Events
```javascript
// Client to Server
'join_game' - Join a game room
'leave_game' - Leave a game room
'game_move' - Make a game move
'chat_message' - Send chat message

// Server to Client
'game_state' - Current game state
'player_joined' - Player joined notification
'player_left' - Player left notification
'move_made' - Move broadcasted to all players
'game_started' - Game started notification
'game_ended' - Game ended with results
'chat_message' - Chat message broadcast
```

## 🚀 Deployment

### Production Build
```bash
# Build client
cd client && npm run build

# Start production server
cd ../server && npm start
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use production MongoDB URI
- Configure production Razorpay keys
- Set up SSL certificates
- Configure domain-specific CORS

### Recommended Hosting
- **Backend**: Heroku, DigitalOcean, AWS EC2
- **Frontend**: Netlify, Vercel, AWS S3 + CloudFront
- **Database**: MongoDB Atlas, AWS DocumentDB
- **File Storage**: AWS S3, Cloudinary

## 🧪 Testing

```bash
# Run server tests
cd server && npm test

# Run client tests
cd client && npm test

# Run end-to-end tests
npm run test:e2e
```

## 📈 Performance Optimizations

- **Code Splitting** with React.lazy()
- **Image Optimization** with lazy loading
- **Caching** strategies for API responses
- **Database Indexing** for faster queries
- **Connection Pooling** for MongoDB
- **CDN** for static asset delivery

## 🔧 Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Nodemon** - Development server auto-restart
- **Concurrently** - Run multiple commands
- **React DevTools** - React debugging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@gamingplatform.com or join our Discord server.

## 🚨 Disclaimer

This platform is for entertainment purposes. Please gamble responsibly and only with money you can afford to lose. Must be 18+ to play.

---

Made with ❤️ by the Gaming Platform Team