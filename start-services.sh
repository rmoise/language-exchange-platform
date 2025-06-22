#!/bin/bash

echo "🚀 Starting Language Exchange Platform Services..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration before continuing."
    echo "   Especially set your JWT_SECRET and LibreTranslate API key."
fi

# Start services with docker-compose
echo "🐳 Starting PostgreSQL and LibreTranslate services..."
docker-compose up -d postgres libretranslate

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
timeout=60
while [ $timeout -gt 0 ]; do
    if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1 && \
       curl -f http://localhost:5000/languages > /dev/null 2>&1; then
        echo "✅ All services are ready!"
        break
    fi
    echo "   Waiting for services... ($timeout seconds remaining)"
    sleep 2
    timeout=$((timeout-2))
done

if [ $timeout -le 0 ]; then
    echo "❌ Services failed to start within 60 seconds."
    echo "Check logs with: docker-compose logs"
    exit 1
fi

# Show service status
echo ""
echo "📊 Service Status:"
echo "   PostgreSQL: http://localhost:5432"
echo "   LibreTranslate: http://localhost:5000"
echo ""
echo "🔍 Test LibreTranslate API:"
echo "   curl -X POST http://localhost:5000/translate \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"q\":\"Hello world\",\"source\":\"en\",\"target\":\"es\"}'"
echo ""
echo "🏃‍♂️ Next steps:"
echo "   1. Copy backend/.env.example to backend/.env and configure"
echo "   2. Run backend: cd backend && go run cmd/server/main.go"
echo "   3. Run frontend: cd frontend && npm run dev"