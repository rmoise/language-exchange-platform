# Language Exchange Platform MVP

A full-stack web application that helps users find language partners based on their native and target languages.

## 🚀 Quick Start

### Prerequisites
- Go 1.21+
- Node.js 18+
- PostgreSQL 13+

### Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials

# Install dependencies
go mod tidy

# Run migrations
psql -U your_user -d your_db -f internal/database/migrations/001_init.sql

# Start server
go run cmd/server/main.go
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local with API_URL

# Start development server
npm run dev
```

## 🏗️ Architecture

### Backend (Go + Gin)
- **Clean Architecture** with dependency injection
- **PostgreSQL** with optimized queries and indexes
- **JWT Authentication** with secure token handling
- **Layered Structure**: Handlers → Services → Repositories

### Frontend (Next.js 14 + TypeScript)
- **App Router** with Server/Client Components
- **Redux Toolkit** for client-side state management
- **Material-UI** for consistent design system
- **Server Actions** for form handling

## 📂 Project Structure

```
language-exchange-platform/
├── backend/                 # Go/Gin API server
│   ├── cmd/server/         # Application entry point
│   ├── internal/           # Private application code
│   │   ├── models/         # Domain models
│   │   ├── repository/     # Data access layer
│   │   ├── services/       # Business logic layer
│   │   └── handlers/       # HTTP handlers
│   └── pkg/                # Public packages
├── frontend/               # Next.js application
│   ├── app/                # App Router pages
│   ├── features/           # Feature-based modules
│   ├── components/         # Reusable UI components
│   └── lib/                # Store configuration
└── CLAUDE.md              # Detailed documentation
```

## 🔧 Features

- **User Authentication** - JWT-based login/register
- **Language Profile Setup** - Native and target languages
- **Partner Search** - Compatible language matching
- **Match Requests** - Send, accept, decline requests
- **Match Management** - View accepted language partners

## 🎯 MVP Principles

- **Simple First** - Core features implemented well
- **Scalable Architecture** - Clean interfaces and separation
- **Type Safety** - TypeScript throughout
- **Modern Patterns** - Latest Next.js and Go best practices

## 📊 Database Schema

- **users** - User profiles with language arrays
- **match_requests** - Pending requests between users
- **matches** - Accepted partnerships

## 🛠️ Development

### Backend Commands
```bash
cd backend
go run cmd/server/main.go     # Start server
go test ./...                 # Run tests
go build -o main cmd/server/main.go  # Build binary
```

### Frontend Commands
```bash
cd frontend
npm run dev          # Development server
npm run build        # Production build
npm run type-check   # TypeScript checking
```

## 🚢 Deployment

Both backend and frontend include Dockerfile for containerization. See individual README files for detailed setup instructions.

## 📚 Documentation

See `CLAUDE.md` for comprehensive architecture documentation, API endpoints, and implementation details.

---

**Built with scalability in mind, shipped as MVP first.**