# Language Exchange Platform MVP

## 🎯 Project Philosophy
**Build simple, build smart.** This is an MVP - avoid over-engineering. Focus on core features that work well.

### Key Principles:
- ✅ Start simple, iterate later
- ✅ DRY - Don't Repeat Yourself
- ✅ Clear folder organization
- ✅ TypeScript for type safety
- ✅ Feature-based structure

### Architecture Principles:
1. **Separation of Concerns** - Each layer has a single responsibility
2. **Dependency Injection** - Use interfaces, not concrete implementations
3. **Immutable State** - Redux for predictable state management
4. **Type Safety** - TypeScript everywhere, no `any` types
5. **Error Boundaries** - Graceful error handling at every level
6. **Scalable by Default** - Stateless services, horizontal scaling ready

## ⚙️ Tech Stack
- **Backend**: Go with Gin framework
- **Frontend**: Next.js with TypeScript
- **Database**: PostgreSQL
- **UI**: Material UI
- **State**: Redux Toolkit (auth only)

## 📂 Project Structure

### Backend (Go)
```
backend/
├── cmd/
│   └── server/
│       └── main.go              # Entry point & DI setup
├── internal/
│   ├── config/
│   │   └── config.go           # Configuration management
│   ├── models/
│   │   ├── user.go             # User domain model
│   │   ├── match_request.go    # Match request model
│   │   ├── match.go            # Match model
│   │   └── errors.go           # Custom error types
│   ├── repository/
│   │   ├── interfaces.go       # Repository interfaces
│   │   ├── user_repository.go  # User data access
│   │   ├── match_repository.go # Match data access
│   │   └── postgres/           # PostgreSQL implementations
│   ├── services/
│   │   ├── interfaces.go       # Service interfaces
│   │   ├── auth_service.go     # Authentication logic
│   │   ├── user_service.go     # User business logic
│   │   └── match_service.go    # Matching logic
│   ├── handlers/
│   │   ├── auth_handler.go     # Auth endpoints
│   │   ├── user_handler.go     # User endpoints
│   │   ├── match_handler.go    # Match endpoints
│   │   └── middleware.go       # JWT middleware
│   └── database/
│       ├── connection.go       # DB connection pool
│       └── migrations/         # SQL migrations
├── pkg/
│   ├── jwt/
│   │   └── jwt.go             # JWT utilities
│   ├── validators/
│   │   └── validators.go      # Input validation
│   └── errors/
│       └── http_errors.go     # HTTP error responses
├── test/
│   ├── fixtures/              # Test data
│   ├── mocks/                 # Interface mocks
│   └── integration/           # Integration tests
├── .env.example
├── go.mod
└── Dockerfile
```

### Frontend (Next.js + TypeScript)
```
frontend/
├── app/                     # App Router (Next.js 13+)
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (protected)/
│   │   ├── layout.tsx       # Protected route wrapper
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   ├── search/
│   │   │   └── page.tsx
│   │   ├── matches/
│   │   │   └── page.tsx
│   │   └── requests/
│   │       ├── incoming/
│   │       │   └── page.tsx
│   │       └── outgoing/
│   │           └── page.tsx
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── StoreProvider.tsx    # Redux provider
├── lib/
│   ├── store.ts             # Redux store config
│   └── hooks.ts             # Typed Redux hooks
├── features/
│   ├── auth/
│   │   ├── authSlice.ts
│   │   ├── authService.ts
│   │   └── types.ts
│   ├── users/
│   │   ├── components/
│   │   │   └── UserCard.tsx
│   │   ├── userService.ts
│   │   └── types.ts
│   └── matches/
│       ├── components/
│       │   └── MatchList.tsx
│       ├── matchService.ts
│       └── types.ts
├── components/
│   └── ui/                  # Shared UI components
│       ├── Layout.tsx
│       └── LanguageSelector.tsx
├── utils/
│   ├── api.ts               # Axios instance
│   └── constants.ts
├── .env.local.example
├── next.config.js
├── tsconfig.json
└── package.json
```

## 🏛️ Architecture Overview

### System Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                     │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │   Pages     │  │   Features   │  │    Redux      │  │
│  │  (Routes)   │  │ (Components) │  │   (State)     │  │
│  └─────────────┘  └──────────────┘  └───────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP/JSON
┌────────────────────────┴────────────────────────────────┐
│                    Backend (Go/Gin)                       │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Handlers   │→ │   Services   │→ │ Repositories  │  │
│  │   (HTTP)    │  │  (Business)  │  │    (Data)     │  │
│  └─────────────┘  └──────────────┘  └───────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │ SQL
                    ┌────┴────┐
                    │Postgres │
                    └─────────┘
```

### Backend Architecture (Clean Architecture Principles)

#### Layer Separation
```
┌─────────────────────────────────────────────────┐
│                  HTTP Layer                      │
│          (Handlers / Controllers)                │
├─────────────────────────────────────────────────┤
│                Service Layer                     │
│            (Business Logic)                      │
├─────────────────────────────────────────────────┤
│              Repository Layer                    │
│            (Data Access)                         │
├─────────────────────────────────────────────────┤
│                Database                          │
└─────────────────────────────────────────────────┘
```

#### Backend File Definitions

**Entry Point**
- `cmd/server/main.go` - Application bootstrap, dependency injection setup

**Models** (`internal/models/`)
- `user.go` - User domain model with validation methods
- `match_request.go` - Match request domain model
- `match.go` - Accepted match domain model
- `errors.go` - Custom error types

**Repositories** (`internal/repository/`)
- `interfaces.go` - Repository interfaces for dependency injection
- `user_repository.go` - User data access implementation
- `match_repository.go` - Match/request data access implementation
- `postgres/` - PostgreSQL-specific implementations

**Services** (`internal/services/`)
- `interfaces.go` - Service interfaces
- `auth_service.go` - Authentication logic (JWT generation/validation)
- `user_service.go` - User business logic
- `match_service.go` - Matching algorithm and request logic

**Handlers** (`internal/handlers/`)
- `auth_handler.go` - Login/register endpoints
- `user_handler.go` - User profile endpoints
- `match_handler.go` - Match request endpoints
- `middleware.go` - JWT validation middleware

**Database** (`internal/database/`)
- `connection.go` - DB connection pool management
- `migrations/001_init.sql` - Initial schema
- `migrations/002_indexes.sql` - Performance indexes

**Utils** (`pkg/`)
- `jwt/jwt.go` - JWT utilities
- `validators/validators.go` - Input validation helpers
- `errors/http_errors.go` - HTTP error responses

### Frontend Architecture (Feature-Based + Clean Components)

#### Component Hierarchy
```
┌─────────────────────────────────────────────────┐
│                   App Layout                     │
│              (Root Layout + Providers)           │
├─────────────────────────────────────────────────┤
│                Route Layouts                     │
│         (Auth Layout / Protected Layout)         │
├─────────────────────────────────────────────────┤
│                    Pages                         │
│            (Route Components)                    │
├─────────────────────────────────────────────────┤
│               Feature Components                 │
│         (Business Logic Components)              │
├─────────────────────────────────────────────────┤
│                 UI Components                    │
│            (Presentational Only)                 │
└─────────────────────────────────────────────────┘
```

#### Frontend File Definitions

**App Router** (`app/`)
- `layout.tsx` - Root layout (Server Component)
- `ClientLayout.tsx` - Client wrapper with providers ('use client')
- `page.tsx` - Landing page (Server Component)
- `error.tsx` - Error boundary ('use client')
- `not-found.tsx` - 404 page (Server Component)
- `loading.tsx` - Global loading UI

**Auth Routes** (`app/(auth)/`)
- `layout.tsx` - Auth layout (Server Component, redirect if logged in)
- `login/page.tsx` - Login page (Server Component)
- `login/LoginForm.tsx` - Login form ('use client')
- `register/page.tsx` - Register page (Server Component)
- `register/RegisterForm.tsx` - Register form ('use client')

**Protected Routes** (`app/(protected)/`)
- `layout.tsx` - Auth check (Server Component)
- `profile/page.tsx` - Profile page (Server Component, fetches user data)
- `profile/LanguageForm.tsx` - Language editor ('use client')
- `search/page.tsx` - Search page (Server Component, fetches users)
- `search/SearchFilters.tsx` - Filter controls ('use client')
- `matches/page.tsx` - Matches page (Server Component, fetches matches)
- `requests/incoming/page.tsx` - Incoming requests (Server Component)
- `requests/outgoing/page.tsx` - Outgoing requests (Server Component)
- `requests/RequestActions.tsx` - Accept/decline buttons ('use client')

**Redux Store** (`lib/`)
- `store.ts` - Store configuration with middleware
- `hooks.ts` - Typed Redux hooks
- `middleware.ts` - Custom middleware (auth refresh, etc.)

**Features** (`features/`)

*Auth Feature* (`features/auth/`)
- `authSlice.ts` - Auth state management
- `authService.ts` - API calls for auth
- `authSelectors.ts` - Memoized selectors
- `types.ts` - TypeScript interfaces
- `hooks/useAuth.ts` - Custom auth hook
- `components/LoginForm.tsx` - Form component
- `components/RegisterForm.tsx` - Form component

*Users Feature* (`features/users/`)
- `userSlice.ts` - User state management
- `userService.ts` - User API calls
- `userSelectors.ts` - User selectors
- `types.ts` - User types
- `hooks/useUserSearch.ts` - Search hook
- `components/UserCard.tsx` - User display card
- `components/UserList.tsx` - User grid/list
- `components/LanguageFilter.tsx` - Filter component

*Matches Feature* (`features/matches/`)
- `matchSlice.ts` - Match state management
- `matchService.ts` - Match API calls
- `matchSelectors.ts` - Match selectors
- `types.ts` - Match types
- `hooks/useMatchRequests.ts` - Request management
- `components/MatchList.tsx` - Match display
- `components/RequestCard.tsx` - Request card
- `components/RequestActions.tsx` - Accept/decline buttons

**Shared Components** (`components/`)
- `ui/Button.tsx` - Reusable button
- `ui/Card.tsx` - Card wrapper
- `ui/Input.tsx` - Form input
- `ui/Select.tsx` - Dropdown component
- `ui/Loader.tsx` - Loading spinner
- `layout/Header.tsx` - App header
- `layout/Navigation.tsx` - Nav menu
- `common/LanguageSelector.tsx` - Language picker
- `common/ErrorBoundary.tsx` - Error wrapper

**Utilities** (`utils/`)
- `api.ts` - Axios instance with interceptors
- `constants.ts` - App constants
- `helpers.ts` - Utility functions
- `validators.ts` - Form validation
- `storage.ts` - localStorage wrapper

**Types** (`types/`)
- `global.d.ts` - Global type definitions
- `api.d.ts` - API response types

### Server vs Client Components

#### Server Components (Default)
- **Pages**: Fetch data directly, no loading states needed
- **Layouts**: Authentication checks, data preloading
- **Data Display**: UserCard, MatchList (non-interactive parts)
- **Benefits**: Zero client JS, better SEO, direct DB access

#### Client Components ('use client')
- **Forms**: LoginForm, RegisterForm, LanguageForm
- **Interactive UI**: Buttons, filters, modals
- **Redux Connected**: Components using hooks/dispatch
- **Browser APIs**: Components using localStorage, etc.

### Data Flow Architecture

#### Server Component Data Flow
```
Page (Server) → Direct API/DB Call → Render HTML
      ↓
Pass data as props → Client Component (if needed)
```

#### Client Component Data Flow
```
Form Submit → Server Action → API → Database
      ↓                              ↓
Update UI ← Redux (optional) ← Response
```

#### Authentication Flow
```
1. LoginForm (Client) → Server Action → API
2. API returns JWT → Store in httpOnly cookie
3. Middleware reads cookie → Validates on each request
4. Redux stores user info (not token) for UI
```

## 🔧 Scalability Patterns

### Backend Interfaces (Dependency Injection)

**Repository Interfaces** (`internal/repository/interfaces.go`)
```go
type UserRepository interface {
    Create(ctx context.Context, user *models.User) error
    GetByID(ctx context.Context, id string) (*models.User, error)
    GetByEmail(ctx context.Context, email string) (*models.User, error)
    Update(ctx context.Context, user *models.User) error
    Search(ctx context.Context, filters SearchFilters) ([]*models.User, error)
}

type MatchRepository interface {
    CreateRequest(ctx context.Context, req *models.MatchRequest) error
    GetRequestsByUser(ctx context.Context, userID string, incoming bool) ([]*models.MatchRequest, error)
    UpdateRequestStatus(ctx context.Context, id string, status string) error
    CreateMatch(ctx context.Context, match *models.Match) error
    GetMatchesByUser(ctx context.Context, userID string) ([]*models.Match, error)
}
```

**Service Interfaces** (`internal/services/interfaces.go`)
```go
type AuthService interface {
    Register(ctx context.Context, input RegisterInput) (*models.User, string, error)
    Login(ctx context.Context, email, password string) (*models.User, string, error)
    ValidateToken(token string) (*models.User, error)
}

type UserService interface {
    GetProfile(ctx context.Context, userID string) (*models.User, error)
    UpdateLanguages(ctx context.Context, userID string, languages UpdateLanguagesInput) error
    SearchPartners(ctx context.Context, userID string, filters SearchFilters) ([]*models.User, error)
}

type MatchService interface {
    SendRequest(ctx context.Context, senderID, recipientID string) error
    HandleRequest(ctx context.Context, requestID, userID string, accept bool) error
    GetMatches(ctx context.Context, userID string) ([]*models.Match, error)
}
```

### Frontend Type Safety

**API Response Types** (`types/api.d.ts`)
```typescript
interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

interface ErrorResponse {
  error: string;
  code: string;
  details?: Record<string, string>;
}
```

**Domain Types** (`types/domain.d.ts`)
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  nativeLanguages: string[];
  targetLanguages: string[];
  createdAt: string;
}

interface MatchRequest {
  id: string;
  senderId: string;
  recipientId: string;
  status: 'pending' | 'accepted' | 'declined';
  sender?: User;
  recipient?: User;
  createdAt: string;
}

interface Match {
  id: string;
  user1: User;
  user2: User;
  createdAt: string;
}
```

### Error Handling Strategy

**Backend Error Types** (`internal/models/errors.go`)
```go
type AppError struct {
    Code    string
    Message string
    Status  int
    Details map[string]string
}

var (
    ErrUserNotFound = &AppError{Code: "USER_NOT_FOUND", Status: 404}
    ErrDuplicateEmail = &AppError{Code: "DUPLICATE_EMAIL", Status: 409}
    ErrInvalidToken = &AppError{Code: "INVALID_TOKEN", Status: 401}
    ErrDuplicateRequest = &AppError{Code: "DUPLICATE_REQUEST", Status: 409}
)
```

**Frontend Error Handling** (`utils/errors.ts`)
```typescript
export class ApiError extends Error {
  constructor(
    public code: string,
    public status: number,
    message: string,
    public details?: Record<string, string>
  ) {
    super(message);
  }
}

export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }
  return 'An unexpected error occurred';
};
```

### Configuration Management

**Backend Config** (`internal/config/config.go`)
```go
type Config struct {
    Port        string
    DatabaseURL string
    JWTSecret   string
    Environment string
}

func LoadConfig() (*Config, error) {
    // Load from environment variables
    // Validate required fields
    // Return config struct
}
```

**Frontend Config** (`config/index.ts`)
```typescript
export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  environment: process.env.NODE_ENV,
  features: {
    realtimeUpdates: false, // Feature flag for future
  },
} as const;
```

## 🧪 Testing Structure

### Backend Testing
```
backend/
├── internal/
│   ├── handlers/
│   │   └── *_test.go        # Handler integration tests
│   ├── services/
│   │   └── *_test.go        # Service unit tests
│   └── repository/
│       └── *_test.go        # Repository tests with test DB
└── test/
    ├── fixtures/            # Test data
    ├── mocks/               # Interface mocks
    └── integration/         # Full integration tests
```

### Frontend Testing
```
frontend/
├── __tests__/
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── e2e/                # End-to-end tests
├── features/
│   └── */
│       └── __tests__/      # Feature-specific tests
└── jest.config.js
```

## 🚀 Deployment Architecture

### Container Structure
```
docker-compose.yml          # Local development
├── backend/
│   └── Dockerfile         # Multi-stage build
├── frontend/
│   └── Dockerfile         # Next.js standalone
└── postgres/
    └── init.sql          # Initial DB setup
```

### Production Considerations
- Backend: Stateless, horizontally scalable
- Frontend: SSG/ISR for public pages, SSR for dynamic
- Database: Connection pooling, read replicas ready
- Caching: Redis-ready interfaces (future)
- Monitoring: Structured logging, metrics endpoints

## 🔄 Server Actions (Form Handling)

### Login Action (`app/(auth)/login/actions.ts`)
```typescript
'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  const res = await fetch(`${process.env.API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  
  if (!res.ok) {
    const error = await res.json()
    return { error: error.message }
  }
  
  const { token, user } = await res.json()
  
  // Set httpOnly cookie
  cookies().set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  })
  
  redirect('/search')
}
```

### Update Languages Action (`app/(protected)/profile/actions.ts`)
```typescript
'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function updateLanguagesAction(formData: FormData) {
  const token = cookies().get('token')?.value
  const native = formData.getAll('native') as string[]
  const target = formData.getAll('target') as string[]
  
  const res = await fetch(`${process.env.API_URL}/users/me/languages`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ native, target }),
  })
  
  if (!res.ok) {
    const error = await res.json()
    return { error: error.message }
  }
  
  revalidatePath('/profile')
  return { success: true }
}
```

## 🔐 Backend API Endpoints

### Authentication
```typescript
POST /api/auth/register
Body: { email: string, password: string, name: string }
Response: { token: string, user: User }

POST /api/auth/login
Body: { email: string, password: string }
Response: { token: string, user: User }
```

### User Management
```typescript
GET /api/users/me
Headers: { Authorization: "Bearer <token>" }
Response: { user: User }

PUT /api/users/me/languages
Headers: { Authorization: "Bearer <token>" }
Body: { native: string[], target: string[] }
Response: { user: User }

GET /api/users?native=en&target=es
Headers: { Authorization: "Bearer <token>" }
Response: { users: User[] }
```

### Match Requests
```typescript
POST /api/matches/requests
Headers: { Authorization: "Bearer <token>" }
Body: { recipientId: string }
Response: { request: MatchRequest }

GET /api/matches/requests/incoming
GET /api/matches/requests/outgoing
Headers: { Authorization: "Bearer <token>" }
Response: { requests: MatchRequest[] }

PUT /api/matches/requests/:id/accept
PUT /api/matches/requests/:id/decline
Headers: { Authorization: "Bearer <token>" }
Response: { request: MatchRequest }

GET /api/matches
Headers: { Authorization: "Bearer <token>" }
Response: { matches: Match[] }
```

## 🧠 Core Logic

### Language Matching
- User A (native: English, target: Spanish) matches with User B (native: Spanish, target: English)
- Both users must have complementary language pairs

### Match Request Flow
1. User sends request → status: "pending"
2. Recipient accepts → status: "accepted" → Creates Match record
3. Recipient declines → status: "declined"
4. No duplicate requests allowed

## 🚀 Getting Started

### Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL credentials

go mod init language-exchange
go get -u github.com/gin-gonic/gin
go get -u github.com/lib/pq
go get -u github.com/golang-jwt/jwt/v5

# Run migrations
psql -U your_user -d your_db -f internal/database/migrations/001_init.sql

# Start server
go run cmd/server/main.go
```

### Frontend Setup
```bash
cd frontend
# Create Next.js app with specific options (no prompts)
npx create-next-app@latest . --typescript --tailwind --app --no-eslint --import-alias "@/*"

# Install only essential dependencies
npm install @mui/material @emotion/react @emotion/styled
npm install @reduxjs/toolkit react-redux
npm install axios

cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8080/api

# Development
npm run dev

# Production
npm run build
npm start
```

### Environment Variables

Backend `.env`:
```
DATABASE_URL=postgres://user:password@localhost/language_exchange
JWT_SECRET=your-secret-key
PORT=8080
```

Frontend `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

## 📋 Database Schema

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    native_languages TEXT[],
    target_languages TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);

-- Match requests table
CREATE TABLE match_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES users(id),
    recipient_id UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Matches table
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID REFERENCES users(id),
    user2_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 🏗️ Redux Store Setup (Client-Side Only)

### Store Configuration (`lib/store.ts`)
```typescript
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/features/auth/authSlice'
import uiReducer from '@/features/ui/uiSlice'

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,    // User info only (no tokens)
      ui: uiReducer,        // Client-side UI state
    },
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
```

### Root Layout Structure

#### Root Layout (`app/layout.tsx`)
```typescript
import { Inter } from 'next/font/google'
import ClientLayout from './ClientLayout'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}
```

#### Client Layout (`app/ClientLayout.tsx`)
```typescript
'use client'
import { useRef } from 'react'
import { Provider } from 'react-redux'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { makeStore, AppStore } from '@/lib/store'
import { theme } from '@/utils/theme'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const storeRef = useRef<AppStore>()
  if (!storeRef.current) {
    storeRef.current = makeStore()
  }

  return (
    <Provider store={storeRef.current}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </Provider>
  )
}
```

## 📊 Server Component Data Fetching Examples

### Search Page (`app/(protected)/search/page.tsx`)
```typescript
import { cookies } from 'next/headers'
import { SearchFilters } from './SearchFilters'
import { UserList } from '@/features/users/components/UserList'

async function getUsers(filters: URLSearchParams) {
  const token = cookies().get('token')?.value
  
  const res = await fetch(`${process.env.API_URL}/users?${filters}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',  // Dynamic data
  })
  
  if (!res.ok) throw new Error('Failed to fetch users')
  return res.json()
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { native?: string; target?: string }
}) {
  const filters = new URLSearchParams(searchParams)
  const users = await getUsers(filters)
  
  return (
    <div>
      <h1>Find Language Partners</h1>
      <SearchFilters />  {/* Client Component for interactivity */}
      <UserList users={users} />  {/* Server Component with data */}
    </div>
  )
}
```

### Profile Page (`app/(protected)/profile/page.tsx`)
```typescript
import { cookies } from 'next/headers'
import { LanguageForm } from './LanguageForm'

async function getUserProfile() {
  const token = cookies().get('token')?.value
  
  const res = await fetch(`${process.env.API_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 60 },  // Cache for 1 minute
  })
  
  if (!res.ok) throw new Error('Failed to fetch profile')
  return res.json()
}

export default async function ProfilePage() {
  const user = await getUserProfile()
  
  return (
    <div>
      <h1>My Profile</h1>
      <div>
        <p>Name: {user.name}</p>
        <p>Email: {user.email}</p>
      </div>
      <LanguageForm 
        initialLanguages={{
          native: user.nativeLanguages,
          target: user.targetLanguages,
        }}
      />
    </div>
  )
}
```

## ✅ MVP Checklist
- [ ] User can register and login
- [ ] User can set native/target languages
- [ ] User can search for language partners
- [ ] User can send match requests
- [ ] User can accept/decline requests
- [ ] User can view their matches
- [ ] Protected routes require authentication
- [ ] Basic error handling
- [ ] Simple, clean UI

## 🛡️ Middleware & Auth

### Next.js Middleware (`middleware.ts`)
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const isAuthPage = request.nextUrl.pathname.startsWith('/(auth)')
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/(protected)')
  
  // Redirect to login if accessing protected route without token
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Redirect to search if accessing auth pages with token
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/search', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/(auth)/:path*', '/(protected)/:path*'],
}
```

## 🎨 Best Practices

### Server Component First
- Pages fetch data directly (no loading spinners)
- Use Suspense boundaries for streaming
- Pass data as props to client components
- No API routes for server component data

### Client Components Only When Needed
- Forms and user input
- onClick, onChange handlers
- Browser APIs (localStorage, etc.)
- Redux connections

### Keep It Simple
- Start with hardcoded language options
- Use Material UI components as-is
- JWT in httpOnly cookies (not localStorage)
- Basic form validation only
- Server actions for forms

### Scalability Considerations
- Feature-based folder structure
- TypeScript everywhere (no `any`)
- Interfaces for dependency injection
- Stateless backend services
- Clear server/client boundaries

Remember: **Ship fast, optimize later!**