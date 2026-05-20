#!/bin/bash
# CivicPulse AI - Quick Start Script

echo "🚀 Starting CivicPulse AI..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Copy env if not exists
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env from .env.example"
fi

# Build and start
echo "🔨 Building containers..."
docker-compose up --build -d

echo "⏳ Waiting for services to start..."
sleep 15

# Run migrations and seed data
echo "🌱 Running migrations and seeding data..."
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py seed_data

echo ""
echo "✅ CivicPulse AI is running!"
echo ""
echo "🌐 Frontend:    http://localhost:3000"
echo "🔌 Backend API: http://localhost:8000/api"
echo "📚 API Docs:    http://localhost:8000/api/docs"
echo "⚙️  Admin:       http://localhost:8000/admin"
echo ""
echo "👤 Demo Accounts:"
echo "   Admin:   admin@civicpulse.gov / Admin@123"
echo "   Officer: officer@civicpulse.gov / Officer@123"
echo "   Citizen: citizen@civicpulse.gov / Citizen@123"
