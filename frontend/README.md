# Language Exchange Platform - Frontend

This is the frontend for the Language Exchange Platform built with Next.js 14, TypeScript, and Material-UI.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.local.example .env.local
```

3. Update the API URL in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure

- `app/` - Next.js 14 App Router pages and layouts
- `features/` - Feature-based modules (auth, users, matches)
- `components/` - Reusable UI components
- `lib/` - Redux store configuration
- `utils/` - Utility functions and constants
- `types/` - TypeScript type definitions

## Architecture

This frontend follows Next.js 14 best practices:

- **Server Components** for data fetching and static content
- **Client Components** for interactive UI with 'use client' directive
- **Redux Toolkit** for client-side state management
- **Material-UI** for consistent design system
- **TypeScript** for type safety

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking