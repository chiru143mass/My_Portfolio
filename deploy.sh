#!/bin/bash

echo "🚀 Surya Job Updates - Deployment Script"
echo "========================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Setup Backend
echo "📦 Setting up Backend..."
cd backend
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOL
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/surya-job-updates
JWT_SECRET=surya-job-updates-super-secret-jwt-key-2024
JWT_EXPIRE=30d
FRONTEND_URL=http://localhost:3000
EOL
    echo "✅ Created .env file with default values"
else
    echo "✅ .env file already exists"
fi

echo "📦 Installing backend dependencies..."
npm install

echo "🔧 Starting backend server..."
npm run dev &
BACKEND_PID=$!

# Setup Frontend
echo "📦 Setting up Frontend..."
cd ../frontend

if [ ! -f .env ]; then
    echo "📝 Creating frontend .env file..."
    echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
    echo "✅ Created frontend .env file"
fi

echo "📦 Installing frontend dependencies..."
npm install

echo "🎨 Starting frontend development server..."
npm start &
FRONTEND_PID=$!

echo ""
echo "🎉 Surya Job Updates is now running!"
echo "=================================="
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5000"
echo "📚 API Docs: http://localhost:5000/api"
echo ""
echo "To stop the servers, press Ctrl+C"
echo ""
echo "💡 Tips:"
echo "- Make sure MongoDB is running on your system"
echo "- Check the README.md for detailed setup instructions"
echo "- Visit the frontend URL to see your job portal!"

# Wait for user interrupt
wait