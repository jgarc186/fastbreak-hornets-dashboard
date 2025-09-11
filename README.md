# FastBreak Player Insights Dashboard 🏀

A secure, authenticated web application showcasing Charlotte Hornets player statistics and analytics. Built for a coding challenge with Next.js 15, Auth0, and interactive data visualizations.

## 🚀 Live Demo

[View Live Application](https://your-deployment-url.vercel.app) *(Deploy to update this link)*

## ✨ Features

### 🔐 Authentication
- Secure Auth0 integration with login/logout functionality
- Protected dashboard routes accessible only to authenticated users
- Session management with user profile display

### 📊 Interactive Dashboard Widgets
- **Player Leaderboard**: Top 5 players across 5 statistical categories
- **Shooting Efficiency**: Interactive bar chart comparing FG% vs 3P%
- **Points Distribution**: Visual PPG comparison for all players
- **Performance Radar Chart**: Multi-axis player comparison with selection dropdown

### 🏀 Charlotte Hornets Data
- Complete roster statistics including PPG, rebounds, assists, FG%, 3P%, minutes played
- Real player data with computed efficiency ratings and team analytics
- Advanced API endpoint with filtering, sorting, and data transformation

### 🎨 Modern UI/UX
- Responsive design optimized for desktop and mobile
- Professional styling with Tailwind CSS v4
- Interactive tooltips and hover effects
- Clean, intuitive navigation

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router and Turbopack
- **Frontend**: React 19, TypeScript, Tailwind CSS v4
- **Authentication**: Auth0 (@auth0/nextjs-auth0)
- **Charts**: Recharts for interactive data visualizations
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with PostCSS

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Auth0 account for authentication setup

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd fastbreak-hornets-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.sample .env.local
```

4. Configure Auth0 variables in `.env.local`:
```bash
AUTH0_SECRET=your-auth0-secret
APP_BASE_URL=http://localhost:3000
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_AUDIENCE=your-audience
AUTH0_SCOPE=openid profile email
```

5. Start the development server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
src/
├── app/
│   ├── api/players/          # Player data API endpoint
│   ├── dashboard/            # Protected dashboard pages
│   ├── layout.tsx            # Root layout with metadata
│   └── page.tsx              # Landing page with auth
├── components/
│   ├── charts/               # Dashboard visualization components
│   │   ├── PlayerLeaderboard.tsx
│   │   ├── ShootingEfficiency.tsx
│   │   ├── PointsDistribution.tsx
│   │   └── PerformanceRadarChart.tsx
│   └── DashboardContent.tsx  # Main dashboard layout
├── lib/
│   ├── auth0.ts              # Auth0 configuration
│   └── mockData.ts           # Charlotte Hornets player data
├── types/
│   └── player.ts             # TypeScript interfaces
└── middleware.ts             # Route protection middleware
```

## 🔧 Available Scripts

```bash
npm run dev        # Start development server with Turbopack
npm run build      # Build for production with Turbopack
npm start          # Start production server
npm run lint       # Run ESLint
```

## 🚀 Deployment

### Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

The application is optimized for Vercel deployment with:
- Optimized bundle sizes (113kB main bundle)
- Static generation where possible
- Edge middleware for authentication

## 📊 API Endpoints

### `GET /api/players`

Advanced player data endpoint with filtering and transformation capabilities.

**Query Parameters:**
- `stat` - Sort by statistic (pointsPerGame, rebounds, assists, etc.)
- `limit` - Limit number of results
- `position` - Filter by player position

**Response includes:**
- Enhanced player data with computed statistics
- Team-wide analytics and averages
- Top performers across categories
- Position breakdown

## 🏆 Challenge Requirements

This project fulfills all specified requirements:

- ✅ Next.js App Router with TypeScript
- ✅ Auth0 authentication with secure routes
- ✅ Charlotte Hornets player statistics dashboard
- ✅ All 4 required visualization components
- ✅ API endpoint for data processing
- ✅ Tailwind CSS responsive design
- ✅ Ready for Vercel deployment
- ✅ Professional code organization

## 📝 License

This project was created as a coding challenge demonstration.
