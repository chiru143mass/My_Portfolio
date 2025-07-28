#!/bin/bash

echo "🎮 Gaming Platform Setup Script"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if Node.js is installed
check_nodejs() {
    if command -v node >/dev/null 2>&1; then
        NODE_VERSION=$(node --version)
        print_status "Node.js is installed: $NODE_VERSION"
        
        # Check if version is >= 16
        MAJOR_VERSION=$(echo $NODE_VERSION | sed 's/v//' | cut -d. -f1)
        if [ "$MAJOR_VERSION" -ge 16 ]; then
            print_status "Node.js version is compatible"
        else
            print_warning "Node.js version should be 16 or higher"
            print_info "Please upgrade Node.js: https://nodejs.org/"
        fi
    else
        print_error "Node.js is not installed"
        print_info "Please install Node.js: https://nodejs.org/"
        exit 1
    fi
}

# Check if MongoDB is installed
check_mongodb() {
    if command -v mongod >/dev/null 2>&1; then
        MONGO_VERSION=$(mongod --version | head -n 1)
        print_status "MongoDB is installed: $MONGO_VERSION"
    else
        print_warning "MongoDB is not installed locally"
        print_info "You can use MongoDB Atlas (cloud) instead"
        print_info "Visit: https://www.mongodb.com/atlas"
    fi
}

# Create environment files
create_env_files() {
    print_info "Creating environment files..."
    
    # Server .env
    if [ ! -f "server/.env" ]; then
        cat > server/.env << EOL
# Database
MONGODB_URI=mongodb://localhost:27017/gaming_platform

# JWT
JWT_SECRET=your_super_secret_jwt_key_$(date +%s)
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# Razorpay (Get these from https://razorpay.com)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Email Configuration (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Client URL
CLIENT_URL=http://localhost:3000

# Admin Credentials
ADMIN_EMAIL=admin@gamingplatform.com
ADMIN_PASSWORD=admin123

# Socket.IO
SOCKET_PORT=5001
EOL
        print_status "Created server/.env file"
    else
        print_warning "server/.env already exists"
    fi
    
    # Client .env
    if [ ! -f "client/.env" ]; then
        cat > client/.env << EOL
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000

# App Configuration
REACT_APP_APP_NAME=Gaming Platform
REACT_APP_VERSION=1.0.0
EOL
        print_status "Created client/.env file"
    else
        print_warning "client/.env already exists"
    fi
}

# Install dependencies
install_dependencies() {
    print_info "Installing dependencies..."
    
    # Root dependencies
    print_info "Installing root dependencies..."
    npm install
    
    # Server dependencies
    print_info "Installing server dependencies..."
    cd server && npm install
    if [ $? -eq 0 ]; then
        print_status "Server dependencies installed"
    else
        print_error "Failed to install server dependencies"
        exit 1
    fi
    
    # Client dependencies
    print_info "Installing client dependencies..."
    cd ../client && npm install
    if [ $? -eq 0 ]; then
        print_status "Client dependencies installed"
    else
        print_error "Failed to install client dependencies"
        exit 1
    fi
    
    cd ..
}

# Create necessary directories
create_directories() {
    print_info "Creating necessary directories..."
    
    mkdir -p logs
    mkdir -p uploads
    mkdir -p client/public/images
    mkdir -p server/uploads
    
    print_status "Directories created"
}

# Setup Git hooks (if Git is available)
setup_git_hooks() {
    if command -v git >/dev/null 2>&1; then
        if [ -d ".git" ]; then
            print_info "Setting up Git hooks..."
            
            # Create pre-commit hook
            cat > .git/hooks/pre-commit << EOL
#!/bin/bash
echo "Running pre-commit checks..."

# Run ESLint on client
cd client && npm run lint --silent
if [ \$? -ne 0 ]; then
    echo "ESLint failed. Please fix the errors before committing."
    exit 1
fi

# Run ESLint on server (if configured)
cd ../server
if [ -f "package.json" ] && grep -q "lint" package.json; then
    npm run lint --silent
    if [ \$? -ne 0 ]; then
        echo "Server ESLint failed. Please fix the errors before committing."
        exit 1
    fi
fi

echo "Pre-commit checks passed!"
EOL
            
            chmod +x .git/hooks/pre-commit
            print_status "Git hooks configured"
        fi
    fi
}

# Create sample admin user (if MongoDB is running)
create_admin_user() {
    print_info "Checking MongoDB connection..."
    
    # Try to connect to MongoDB
    if command -v mongo >/dev/null 2>&1; then
        if mongo --eval "db.runCommand('ping')" >/dev/null 2>&1; then
            print_status "MongoDB is running"
            print_info "Admin user will be created automatically when you first run the server"
        else
            print_warning "MongoDB is not running"
            print_info "Start MongoDB with: sudo systemctl start mongod (Linux) or brew services start mongodb/brew/mongodb-community (macOS)"
        fi
    else
        print_info "MongoDB client not found. Using MongoDB Atlas is recommended for production."
    fi
}

# Main setup function
main() {
    echo "Starting Gaming Platform setup..."
    echo ""
    
    # Check prerequisites
    check_nodejs
    check_mongodb
    echo ""
    
    # Setup project
    create_env_files
    create_directories
    install_dependencies
    setup_git_hooks
    create_admin_user
    
    echo ""
    echo "🎉 Setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Update the environment variables in server/.env and client/.env"
    echo "2. Start MongoDB (if using local installation)"
    echo "3. Run 'npm run dev' to start both server and client"
    echo ""
    echo "Important:"
    echo "- Configure Razorpay keys for payment functionality"
    echo "- Set up email credentials for password reset"
    echo "- Review security settings before production deployment"
    echo ""
    echo "Happy gaming! 🎮"
}

# Run main function
main