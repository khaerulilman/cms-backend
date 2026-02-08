#!/bin/bash
# ============================================
# EC2 Server Initial Setup Script
# Run this once on a fresh Ubuntu EC2 instance
# ============================================

set -e

echo "========== Updating system =========="
sudo apt-get update && sudo apt-get upgrade -y

echo "========== Installing Node.js 20 =========="
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"

echo "========== Installing PM2 =========="
sudo npm install -g pm2

echo "========== Installing Git =========="
sudo apt-get install -y git

echo "========== Cloning repository =========="
# Replace with your actual repository URL
if [ ! -d ~/portfolio-cms-backend ]; then
  echo "Enter your GitHub repository URL (e.g., https://github.com/user/repo.git):"
  read REPO_URL
  git clone "$REPO_URL" ~/portfolio-cms-backend
else
  echo "Repository already exists, pulling latest..."
  cd ~/portfolio-cms-backend
  git pull origin main
fi

echo "========== Setting up application =========="
cd ~/portfolio-cms-backend/backend-express

# Install dependencies
npm ci --production

# Generate Prisma Client
npx prisma generate

echo "========== Creating .env file =========="
if [ ! -f .env ]; then
  cat > .env << 'ENVEOF'
# Production Environment Variables
# Fill in the values below

DATABASE_URL=
JWT_SECRET=
NODE_ENV=production
PORT=4000

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=

FRONTEND_URL=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
ENVEOF
  echo "⚠️  Please edit .env file with your production values: nano ~/portfolio-cms-backend/backend-express/.env"
else
  echo ".env file already exists, skipping..."
fi

echo "========== Running database migrations =========="
npx prisma migrate deploy

echo "========== Starting application with PM2 =========="
pm2 start src/server.js --name portfolio-cms --env production
pm2 save
pm2 startup | tail -1 | bash

echo ""
echo "========== Setup Complete! =========="
echo "Application is running on port 4000"
echo ""
echo "Useful PM2 commands:"
echo "  pm2 status          - Check app status"
echo "  pm2 logs portfolio-cms  - View logs"
echo "  pm2 restart portfolio-cms - Restart app"
echo "  pm2 stop portfolio-cms   - Stop app"
