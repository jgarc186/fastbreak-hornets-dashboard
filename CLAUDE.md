# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **FastBreak Player Insights Dashboard for Charlotte Hornets** - a coding challenge project due Thursday 5pm Pacific. Built with Next.js 15, React 19, and TypeScript, it's a secure, authenticated web application that displays basketball player insights and analytics using charts and data visualizations.

**Challenge Requirements:**
- Deploy to Vercel with public URL + GitHub repo
- Four specific chart components with basketball analytics
- API endpoint for player data processing
- Responsive design with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 15 with App Router and Turbopack
- **Frontend**: React 19, TypeScript, Tailwind CSS v4
- **Authentication**: Auth0 (@auth0/nextjs-auth0)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with PostCSS

## Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build for production with Turbopack  
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

## Architecture

### App Structure (Next.js App Router)
- `src/app/layout.tsx` - Root layout with Inter font and metadata
- `src/app/page.tsx` - Landing page with Auth0 authentication check
- `src/app/dashboard/` - Protected dashboard routes (directory exists but no files yet)

### Authentication Flow
- Uses Auth0 for authentication with Next.js middleware
- `src/middleware.ts` - Auth0 middleware protecting all routes except static assets
- `src/lib/auth0.ts` - Auth0 client configuration
- Unauthenticated users see login/signup options on homepage
- Authenticated users see welcome message with their name

### Components Architecture
- `src/components/DashboardContent.tsx` - Main dashboard component displaying player charts
- `src/components/charts/` - Chart components directory containing:
  - `PlayerLeaderboard.tsx` - Table showing top 5 players per stat category
  - `ShootingEfficiency.tsx` - Bar chart comparing FG% and 3P%  
  - `PointsDistribution.tsx` - Bar chart of points per game
  - `PerformanceRadarChart.tsx` - Multi-axis radar chart for selected player
- `src/components/ui/` - Reusable UI components directory
- `src/components/auth/` - Authentication-related components directory

### Data Layer
- `src/types/player.ts` - Player interface defining basketball statistics structure
- `src/lib/mockData.ts` - Charlotte Hornets player mock data with stats like PPG, rebounds, assists, shooting percentages
- `src/app/api/players/route.ts` - API endpoint for processing and transforming player data

### TypeScript Configuration
- Path aliases configured: `@/*` maps to `./src/*`
- Strict mode enabled with modern ES2017 target
- Next.js plugin integrated for optimal development experience

## Key Features

1. **Authenticated Dashboard** - Secure access to player insights
2. **Player Statistics** - Comprehensive basketball metrics (points, rebounds, assists, shooting percentages, minutes played)
3. **Data Visualizations** - Multiple chart components for different statistical views
4. **Responsive Design** - Tailwind CSS grid layout optimized for desktop and mobile

## Development Notes

- The project uses Turbopack for faster builds and development
- ESLint is configured with Next.js and TypeScript rules
- Authentication is handled at the middleware level for all routes
- Chart components are imported but not yet implemented in the components/charts directory
- The dashboard currently shows a grid layout expecting three chart components

## Security

- Auth0 handles all authentication and session management
- Middleware protects all application routes except static assets and metadata files
- No sensitive data is stored in the client-side code