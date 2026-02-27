# 4ViegoMains Frontend - Scaffold Summary

## Project Overview

Complete Next.js 16 frontend scaffold for 4ViegoMains, a League of Legends Viego champion analytics platform with Shadow Isles theme. The application is fully typed with TypeScript, uses the App Router, and features a custom Dark theme inspired by the Shadow Isles region.

**Status**: Production-ready scaffold with all infrastructure in place. Ready for backend integration and component implementation.

## 📁 File Structure

### Core Configuration Files
- **package.json** - Dependencies and scripts (Next.js 16, React 19, Tailwind CSS 4, Recharts)
- **tsconfig.json** - Strict TypeScript configuration with path aliases (@/)
- **next.config.ts** - Next.js configuration with image domains and standalone output
- **tailwind.config.ts** - Tailwind CSS v4 with Shadow Isles color palette
- **postcss.config.mjs** - PostCSS configuration for Tailwind v4
- **.eslintrc.json** - ESLint configuration for Next.js
- **.prettierrc** - Code formatting rules
- **.gitignore** - Git ignore patterns
- **.env.example** - Environment variables template
- **Dockerfile** - Multi-stage Docker build for production

### Source Code Structure

#### `/src/app/` - Next.js App Router Pages
```
├── layout.tsx                      # Root layout with fonts and metadata
├── globals.css                     # Global styles & Shadow Isles theme
├── page.tsx                        # Home page with hero and meta stats
├── builds/[role]/page.tsx          # Build guides by role
├── runes/[role]/page.tsx           # Rune pages by role
├── guides/[role]/page.tsx          # Strategy guides by role
├── matchups/[role]/page.tsx        # Matchup analysis by role
├── player/[region]/[name]/[tag]/page.tsx  # Player profile
├── leaderboard/[region]/page.tsx   # Regional leaderboards
├── analytics/page.tsx              # Meta analytics dashboard
└── lore/page.tsx                   # Viego lore & background
```

#### `/src/components/` - Reusable Components
```
├── layout/
│   ├── Navbar.tsx                  # Main navigation with mobile menu
│   ├── Footer.tsx                  # Footer with links and credits
│   └── Sidebar.tsx                 # Role selector and quick navigation
├── ui/
│   ├── Card.tsx                    # Themed container with glow effects
│   ├── Button.tsx                  # Button variants (primary, secondary, ghost, danger)
│   ├── Badge.tsx                   # Tier, role, and stat badges
│   ├── Tabs.tsx                    # Tab navigation component
│   ├── SearchInput.tsx             # Debounced search with dropdown
│   └── Loading.tsx                 # Spinner and skeleton loaders
├── builds/
│   └── BuildPath.tsx               # Visual item build path display
├── player/
│   └── PlayerCard.tsx              # Player summary card
├── analytics/
│   ├── RoleComparison.tsx          # Bar chart by role
│   └── WinRateTrend.tsx            # Line chart trends
└── leaderboard/
    └── LeaderboardTable.tsx        # Sortable leaderboard table
```

#### `/src/lib/` - Utilities & Services
```
├── api.ts                          # API client with typed endpoints
├── types.ts                        # Complete TypeScript type definitions
├── constants.ts                    # Application constants and config
└── utils.ts                        # Utility functions (formatting, validation, etc.)
```

#### `/src/hooks/` - Custom React Hooks
```
├── useViegoBuilds.ts              # Fetch and cache builds with pagination
├── usePlayerAnalysis.ts           # Fetch player profile with caching
└── useLeaderboard.ts              # Fetch leaderboard data with caching
```

## 🎨 Shadow Isles Theme

### Color Palette (Custom CSS Variables)
- **Shadow Black**: `#0a0a0f` - Primary background
- **Shadow Dark**: `#121218` - Secondary background
- **Shadow Medium**: `#1a1a24` - Tertiary background
- **Shadow Light**: `#252533` - Borders and highlights
- **Mist Green**: `#00ff87` - Primary accent (glows)
- **Mist Cyan**: `#00e5ff` - Secondary accent
- **Ruination Purple**: `#7c4dff` - Danger/alternative accent
- **Ruination Blue**: `#4fc3f7` - Info accent
- **Soul Gold**: `#ffd54f` - Premium/special accent

### Typography
- **Cinzel** - Display/headings (medieval, elegant)
- **Inter** - Body text (clean, readable)
- **JetBrains Mono** - Code/monospace (technical)

### Effects & Animations
- Mist glow animations on cards
- Glass-morphism effect with backdrop blur
- Gradient text utilities
- Shadow shifts and pulses
- Soul shimmer animations
- Smooth transitions and hovers

## 📦 Dependencies

### Production
- `next@16` - React framework with App Router
- `react@19` - React library
- `react-dom@19` - React DOM
- `typescript@5.6+` - Type checking
- `tailwindcss@4` - Utility-first CSS
- `@tailwindcss/postcss@4` - Tailwind v4 PostCSS plugin
- `recharts@2.12` - Data visualization
- `lucide-react@0.363` - Icon library
- `clsx@2.1` - Class name utility
- `tailwind-merge@2.2` - Merge Tailwind classes

### Development
- `@types/react` - React type definitions
- `@types/node` - Node.js type definitions
- `eslint` - Linting
- `eslint-config-next` - Next.js ESLint rules
- `prettier` - Code formatting

## 🔌 API Integration

### API Client (`/src/lib/api.ts`)
- Typed fetch wrapper with error handling
- Client-side caching with TTL
- All endpoints properly typed
- Error handling with custom ApiError class

### Available Endpoints
```typescript
// Builds
getBuilds(role?, page, limit)
getBuildByRole(role)

// Runes
getRunes(role?, page, limit)
getRunesByRole(role)

// Matchups
getMatchups(role?, page, limit)
getMatchupsByRole(role)

// Player Profile
getPlayerProfile(name, tag, region)
getPlayerMatches(summonerId, region, page, limit)
searchPlayers(query, region?, limit)

// Leaderboard
getLeaderboard(region, page, limit)
getGlobalLeaderboard(page, limit)

// Analytics
getAnalytics(role?)
getRoleAnalysis(role)
getMetaTrend(days)
getPatchImpact(patchVersion?)

// Guides
getGuides(role?, page, limit)
getGuideById(guideId)

// Health
healthCheck()
```

## 🪝 Custom Hooks

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

All hooks include:
- Automatic error handling
- Client-side caching
- Loading states
- Manual refetch capability

## 📱 Routes Overview

### Public Routes
- `/` - Home page with hero and meta stats
- `/builds/[role]` - Build guides (top, jungle, mid, bot, support)
- `/runes/[role]` - Rune pages
- `/guides/[role]` - Strategy guides
- `/matchups/[role]` - Matchup analysis
- `/player/[region]/[name]/[tag]` - Player profile
- `/leaderboard/[region]` - Regional leaderboards
- `/analytics` - Meta analytics dashboard
- `/lore` - Viego lore and background

### Dynamic Routes
- Roles: `top`, `jungle`, `mid`, `bot`, `support`
- Regions: `na1`, `euw1`, `kr`, `br1`, `jp1`, `ru`, `oc1`, `tr1`

## 🚀 Getting Started

### Installation
```bash
npm install
cp .env.example .env.local
# Edit .env.local and set NEXT_PUBLIC_API_URL
```

### Development
```bash
npm run dev
# Open http://localhost:3000
```

### Production Build
```bash
npm run build
npm start
```

### Docker
```bash
docker build -t 4viegomains-frontend .
docker run -p 3000:3000 4viegomains-frontend
```

## 📝 Component Examples

### Using Card Component
```tsx
<Card glow="mist">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content here</CardContent>
</Card>
```

### Using Buttons
```tsx
<Button variant="primary" size="lg" icon={<Icon />}>
  Click Me
</Button>
```

### Using Badges
```tsx
<RoleBadge role="top" />
<TierBadge tier="DIAMOND" rank="II" />
<StatBadge label="Win Rate" value="52.3" unit="%" />
```

### Using Hooks
```tsx
'use client'
import { useViegoBuilds } from '@/hooks/useViegoBuilds'

export default function BuildsPage() {
  const { builds, loading, error } = useViegoBuilds({ role: 'top' })

  if (loading) return <Loading />
  if (error) return <div>Error: {error}</div>

  return <BuildPath items={builds[0]?.items || []} />
}
```

## 🔐 Important Notes

### Spectator API
The Spectator-V5 API has been deactivated by Riot Games. There is no `/live` page for real-time match data. The application focuses on:
- Match history
- Archived statistics
- Meta analysis
- Player profiles

### Type Safety
- Strict TypeScript configuration enabled
- All types defined in `/src/lib/types.ts`
- API responses are fully typed
- No `any` types in production code

### Environment Variables
- `NEXT_PUBLIC_API_URL` - Backend API base URL (required)
- All public variables must be prefixed with `NEXT_PUBLIC_`

### Caching Strategy
- Client-side caching implemented in API client
- Configurable TTL per endpoint type
- Manual refetch available in hooks

## 🎯 Next Steps for Implementation

1. **Backend Integration**
   - Set `NEXT_PUBLIC_API_URL` environment variable
   - Implement backend endpoints according to API types
   - Test endpoints with mock data

2. **Component Implementation**
   - Populate skeleton components with real data
   - Complete chart implementations with live data
   - Add loading states and error boundaries

3. **Search Implementation**
   - Implement player search with dropdown
   - Add debounced search functionality
   - Handle Riot ID format validation

4. **Static Pages**
   - Add detailed Viego lore content
   - Create comprehensive guides
   - Add FAQ and help sections

5. **Performance Optimization**
   - Implement image optimization
   - Add pagination for large lists
   - Consider ISR (Incremental Static Regeneration) for frequently accessed pages

6. **Analytics & Tracking**
   - Integrate analytics service
   - Track page views and user interactions
   - Monitor API performance

## 📚 Documentation Files

- **README.md** - Comprehensive project documentation
- **SCAFFOLD_SUMMARY.md** - This file

## ✅ Checklist

- [x] Next.js 16 with TypeScript and App Router
- [x] Tailwind CSS v4 with Shadow Isles theme
- [x] Complete component library (UI, Layout, Features)
- [x] Custom hooks with caching
- [x] API client with error handling
- [x] Type definitions for all entities
- [x] Utility functions and constants
- [x] Dynamic routing for all pages
- [x] Docker configuration
- [x] ESLint and Prettier configuration
- [x] Environment configuration
- [x] Comprehensive documentation

## 🎓 Architecture Decisions

1. **App Router** - Latest Next.js navigation model
2. **TypeScript Strict** - Type safety at all levels
3. **Client Components** - Used for interactivity (marked with 'use client')
4. **Server Components** - Used for data fetching and metadata
5. **Custom Hooks** - Encapsulate API logic and caching
6. **Utility Classes** - Tailwind for consistent styling
7. **Component Composition** - Reusable, composable components
8. **API Caching** - Client-side cache to reduce API calls

---

**Version**: 1.0.0
**Created**: February 2026
**Status**: Production-Ready Scaffold

For more information, see README.md
