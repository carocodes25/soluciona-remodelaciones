#!/bin/sh
set -e

echo "🔄 Running Prisma migrations..."
npx prisma migrate deploy

echo "🌱 Skipping seed in production..."

echo "🚀 Starting application..."
exec node dist/main
