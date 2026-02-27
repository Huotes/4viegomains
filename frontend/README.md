# 4ViegoMains Frontend

The premier League of Legends Viego champion analytics platform with Shadow Isles theme.

## Overview

4ViegoMains is a Next.js 16 frontend application built with TypeScript, React 19, and Tailwind CSS v4. It provides comprehensive analytics, build guides, rune recommendations, and player statistics for Viego players.

## Features

- **Champion Builds**: Role-specific optimal item builds and itemization strategies
- **Rune Pages**: Recommended rune setups for each role
- **Matchup Analysis**: Detailed statistics for Viego vs every champion
- **Player Analytics**: Search and analyze any Viego player's statistics
- **Leaderboard**: Global and region-specific Viego player rankings
- **Meta Analytics**: Real-time statistics on win rates, pick rates, and ban rates
- **Guides**: In-depth strategy guides by experienced players
- **Lore**: Deep dive into Viego's dark history and abilities

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5.6+
- **Styling**: Tailwind CSS 4 with custom Shadow Isles theme
- **UI Components**: Custom components with shadcn-style patterns
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Font Management**: next/font with Google Fonts (Cinzel, Inter, JetBrains Mono)
- **Utility**: clsx, tailwind-merge for class management

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Home page
│   ├── builds/            # Build guides by role
│   ├── runes/             # Rune pages by role
│   ├── guides/            # Strategy guides by role
│   ├── matchups/          # Matchup analysis
│   ├── player/            # Player profile pages
│   ├── leaderboard/       # Regional leaderboards
│   ├── analytics/         # Meta analytics dashboard
│   ├── lore/              # Viego lore page
│   └── globals.css        # Global styles & Shadow Isles theme
├── components/
│   ├── layout/            # Layout components (Navbar, Footer, Sidebar)
│   ├── ui/                # Reusable UI components
│   ├── builds/            # Build-specific components
│   ├── player/            # Player profile components
│   ├── analytics/         # Analytics components
│   └── leaderboard/       # Leaderboard components
├── lib/
│   ├── api.ts            # API client with fetch wrapper
│   ├── types.ts          # TypeScript type definitions
│   ├── constants.ts      # Application constants
│   └── utils.ts          # Utility functions
└── hooks/                 # Custom React hooks
    ├── useViegoBuilds.ts
    ├── usePlayerAnalysis.ts
    └── useLeaderboard.ts
```

## Getting Started

### Prerequisites

- Node.js 22+ (as specified in Dockerfile)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local and set your API URL
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000 in your browser
```

### Building

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Linting & Formatting

```bash
# Run ESLint
npm run lint

# Format code with Prettier
npm run format
```

## Shadow Isles Theme

The application features a custom Shadow Isles theme with:

- **Color Palette**:
  - Shadow Black: `#0a0a0f` (primary background)
  - Shadow Dark: `#121218` (secondary background)
  - Shadow Medium: `#1a1a24` (tertiary background)
  - Shadow Light: `#252533` (borders & highlights)
  - Mist Green: `#00ff87` (primary accent, glows)
  - Mist Cyan: `#00e5ff` (secondary accent)
  - Ruination Purple: `#7c4dff` (danger/alternative accent)
  - Ruination Blue: `#4fc3f7` (info accent)
  - Soul Gold: `#ffd54f` (premium/special accent)

- **Typography**:
  - Cinzel (display/headings) - medieval, elegant
  - Inter (body text) - clean, readable
  - JetBrains Mono (code) - technical, monospace

- **Effects**:
  - Mist glow animations
  - Glass-morphism effects
  - Gradient text
  - Shadow shifts and pulses
  - Soul shimmer animations

## API Integration

The frontend communicates with the backend API via `/lib/api.ts`. All endpoints are typed and include error handling.

### Example API Usage

```typescript
import { getBuilds, getPlayerProfile, getLeaderboard } from '@/lib/api'

// Fetch builds for a specific role
const { data: builds } = await getBuilds('top')

// Fetch player profile
const { data: player } = await getPlayerProfile('PlayerName', 'NA1', 'na1')

// Fetch leaderboard
const { data: leaderboard } = await getLeaderboard('na1')
```

## Custom Hooks

### useViegoBuilds

```typescript
const { builds, loading, error, totalPages, refetch } = useViegoBuilds({
  role: 'top',
  page: 1,
  limit: 20,
})
```

### usePlayerAnalysis

```typescript
const { player, loading, error, refetch } = usePlayerAnalysis({
  name: 'PlayerName',
  tag: 'NA1',
  region: 'na1',
})
```

### useLeaderboard

```typescript
const { entries, loading, error, totalPages, total, refetch } = useLeaderboard({
  region: 'na1',
  page: 1,
  limit: 50,
})
```

## Component Library

### UI Components

- **Card**: Themed container with mist/ruination glow options
- **Button**: Multiple variants (primary, secondary, ghost, danger)
- **Badge**: Tier, role, and stat badges
- **Tabs**: Tab navigation with keyboard support
- **SearchInput**: Debounced search with dropdown
- **Loading**: Spinner and skeleton loaders

### Layout Components

- **Navbar**: Main navigation with mobile menu
- **Footer**: Sticky footer with links
- **Sidebar**: Role selector and quick navigation

## Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Docker

The application includes a multi-stage Dockerfile for production deployment:

```bash
# Build Docker image
docker build -t 4viegomains-frontend .

# Run container
docker run -p 3000:3000 4viegomains-frontend
```

## Note: Spectator API

The Spectator-V5 API has been deactivated by Riot Games. Therefore, there is no `/live` page that displays live match data. The application focuses on match history and archived statistics instead.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is not affiliated with Riot Games. League of Legends is a trademark of Riot Games, Inc.

## Support

For issues and feature requests, please open an issue on the repository.

---

Made with respect for the Shadow Isles by the Viego mains community.
