#!/bin/bash

# Soluciona Remodelaciones - Complete Backend Generator
# This script generates the complete NestJS backend structure with all modules

set -e

echo "🚀 Generating Soluciona Remodelaciones Backend..."
echo ""

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$BASE_DIR"

# Create directory structure
echo "📁 Creating directory structure..."

mkdir -p src/modules/{auth,users,pros,categories,jobs,proposals,contracts,payments,reviews,search,messaging,admin,files,notifications,audit}/{dto,entities,interfaces}
mkdir -p src/common/{guards,decorators,filters,interceptors,pipes,middlewares}
mkdir -p src/config
mkdir -p prisma/migrations
mkdir -p test/e2e
mkdir -p uploads

echo "✅ Directory structure created"
echo ""

# Generate .env if not exists
if [ ! -f .env ]; then
  echo "📝 Creating .env file..."
  cp ../.env.example .env
  echo "✅ .env created"
fi

echo ""
echo "📦 Installing dependencies..."
echo "Run: npm install"
echo ""

echo "🎉 Backend structure generated successfully!"
echo ""
echo "Next steps:"
echo "1. npm install"
echo "2. npx prisma generate"
echo "3. npx prisma migrate dev --name init"
echo "4. npx prisma db seed"
echo "5. npm run start:dev"
