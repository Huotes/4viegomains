# 4ViegoMains Frontend - Developer Guide

## Quick Start

The entire frontend has been implemented with all page routes and components. Mock data is included for development/testing.

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # Reusable UI components
├── hooks/           # Custom React hooks
└── lib/             # Utilities, types, constants, and mock data
```

## Key Files

### Pages (9 routes)
- `app/page.tsx` - Home page
- `app/builds/[role]/page.tsx` - Build guides per role
- `app/runes/[role]/page.tsx` - Rune pages per role
- `app/matchups/[role]/page.tsx` - Matchup analysis
- `app/guides/[role]/page.tsx` - Community guides
- `app/player/[region]/[name]/[tag]/page.tsx` - Player profiles
- `app/leaderboard/[region]/page.tsx` - Regional leaderboards
- `app/analytics/page.tsx` - Global statistics dashboard
- `app/lore/page.tsx` - Viego lore and story

### Components (15 total)
**Builds:**
- `BuildPath.tsx` - Item progression visualization
- `ItemSlot.tsx` - Single item display with tooltip
- `RuneTree.tsx` - Rune tree visualization
- `SkillOrder.tsx` - Skill progression grid

**Player:**
- `MatchHistory.tsx` - Recent matches list
- `PerformanceRadar.tsx` - Performance metrics radar chart
- `PlayerCard.tsx` - Player summary card

**Analytics:**
- `RoleComparison.tsx` - Role comparison bar chart
- `WinRateTrend.tsx` - Win rate trend line chart
- `EloDistribution.tsx` - Win rate by tier

**Leaderboard:**
- `LeaderboardTable.tsx` - Sortable player table
- `RegionSelector.tsx` - Region tab selector

**UI Components** (existing, in `components/ui/`)
- Button, Card, Badge, Tabs, SearchInput, Loading, ProgressBar, Tooltip, Modal, Select

### Hooks (5 custom)
- `useViegoBuilds()` - Fetch/cache builds by role
- `usePlayerAnalysis()` - Fetch player profile
- `useLeaderboard()` - Fetch region leaderboard
- `useMediaQuery()` - Responsive breakpoint detection
- `useDebounce()` - Input debouncing

### Utilities
- `lib/types.ts` - TypeScript types and interfaces
- `lib/constants.ts` - Game constants, color mappings, labels
- `lib/api.ts` - API client with cache support
- `lib/utils.ts` - Helper functions (formatting, URLs, validators)
- `lib/mockData.ts` - Mock data generators for development

## Development Workflow

### Using Mock Data
All pages currently use mock data. To test functionality:

```typescript
// In any page or component
import { getMockBuilds, getMockPlayerProfile } from '@/lib/mockData'

const builds = getMockBuilds('top')  // Get builds for top role
const player = getMockPlayerProfile() // Get sample player profile
```

### Switching to Real API
When backend is ready, replace mock data with API calls:

```typescript
// Before (mock data):
import { getMockBuilds } from '@/lib/mockData'
const builds = getMockBuilds(role)

// After (API):
import { getBuilds } from '@/lib/api'
const response = await getBuilds(role)
const builds = response.data
```

### Adding New Data
Mock data is in `src/lib/mockData.ts`. Each function:
- Takes optional parameters (role, region, etc.)
- Returns realistic League of Legends data
- Uses real item/rune IDs

To extend:
```typescript
export function getMockCustomData(role?: Role): CustomData[] {
  return [
    {
      id: '1',
      role: 'top',
      // ... your data
    }
  ]
}
```

## Styling System

### Tailwind Colors
Shadow Isles theme colors (defined in tailwind.config.ts):
- `shadow-black`, `shadow-dark`, `shadow-medium`, `shadow-light`
- `mist-green`, `mist-green-dim`, `mist-cyan`, `mist-teal`
- `ruination-blue`, `ruination-purple`
- `soul-gold`

### CSS Classes
Custom utility classes available:
- `.glass` - Glass morphism effect
- `.mist-glow` - Mist green glow
- `.mist-glow-hover` - Glow on hover
- `.ruination-glow` - Purple glow
- `.gradient-text-mist` - Green gradient text
- `.gradient-text-ruination` - Purple gradient text
- `.gradient-text-soul` - Gold gradient text
- `.soul-shimmer` - Shimmer animation

### Font Families
- `font-cinzel` - Headings (bold, elegant)
- `font-inter` - Body text (clean, readable)
- `font-mono` - Statistics/codes (monospace)

## Component Props

### Common Props
Most components accept:
- `glow?: 'mist' | 'ruination' | 'none'` - Glow effect
- `className?: string` - Additional Tailwind classes
- `children?: React.ReactNode` - Child elements

### Card Component
```typescript
<Card glow="mist" className="...">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### Tabs Component
```typescript
<Tabs
  tabs={[
    { id: 'tab1', label: 'Tab 1' },
    { id: 'tab2', label: 'Tab 2' }
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

### Badge Component
```typescript
<Badge variant="default|secondary|success|warning|danger">
  Content
</Badge>
```

## API Integration

### Current Setup
- Base URL: `process.env.NEXT_PUBLIC_API_URL` (default: http://localhost:8000/api)
- Cache TTL configured in `lib/constants.ts`
- Error handling with custom `ApiError` class

### API Functions
All in `src/lib/api.ts`:
- `getBuilds(role?, page, limit)` - Paginated builds
- `getBuilds ByRole(role)` - Single role builds
- `getRunes(role?, page, limit)` - Rune pages
- `getRunesByRole(role)` - Single role runes
- `getMatchups(role?, page, limit)` - Matchups
- `getPlayerProfile(name, tag, region)` - Player stats
- `getLeaderboard(region, page, limit)` - Leaderboard
- `getAnalytics(role?)` - Global statistics
- `getGuides(role?, page, limit)` - Guides
- And more...

### Example Usage
```typescript
import { getPlayerProfile } from '@/lib/api'

try {
  const response = await getPlayerProfile('PlayerName', 'NA1', 'na1')
  if (response.success) {
    console.log(response.data) // Player profile
  }
} catch (error) {
  console.error('Failed to fetch player:', error.message)
}
```

## Responsive Design

Breakpoints:
- Mobile: 0-640px (single column, large buttons)
- Tablet: 641-1024px (2 columns)
- Desktop: 1025px+ (3+ columns, sidebars)
- Large: 1440px+ (full width layouts)

Use the `useMediaQuery()` hook:
```typescript
const { isMobile, isTablet, isDesktop } = useMediaQuery()

return (
  <div className={isMobile ? 'p-2' : 'p-8'}>
    {/* Responsive content */}
  </div>
)
```

## Performance Considerations

### Code Splitting
Pages are automatically code-split in Next.js App Router. Use dynamic imports for heavy components:
```typescript
import dynamic from 'next/dynamic'

const PerformanceRadar = dynamic(
  () => import('@/components/player/PerformanceRadar'),
  { loading: () => <p>Loading...</p> }
)
```

### Caching
- API responses cached with configurable TTL
- Use `getCachedData()` and `setCachedData()` for manual caching
- Clear cache with `clearCache(pattern?)`

### Image Optimization
DDragon URLs used for League assets. Use Next.js Image component:
```typescript
import Image from 'next/image'

<Image
  src={getItemIconURL(itemId)}
  alt={itemName}
  width={64}
  height={64}
/>
```

## Testing

### With Mock Data
No additional setup needed - all mock data is built in and used by default.

### Switch Between Mock and Real
In `src/lib/api.ts`, there's conditional logic:
- If API fails, falls back to mock data
- Update API_CONFIG.baseUrl to point to backend
- Remove fallback behavior once backend is confirmed working

### Testing Responsive Design
```bash
# In browser DevTools, use device emulation or:
npm run dev  # Start dev server
# Open http://localhost:3000 and use responsive design mode
```

## Common Issues & Solutions

### Mock Data Not Showing
Mock data is auto-imported in each page. If not working:
1. Check imports are correct
2. Verify `lib/mockData.ts` exists
3. Clear .next build cache: `rm -rf .next`

### Styles Not Applied
1. Check Tailwind class names are correct
2. Verify custom colors exist in tailwind config
3. Check CSS is imported in `layout.tsx`

### API Calls Timeout
1. Check `API_CONFIG.timeout` in `lib/constants.ts`
2. Verify backend is running on correct port
3. Check CORS configuration on backend

### Type Errors
1. Ensure all imports use `type` when needed
2. Check `lib/types.ts` for interface definitions
3. Run `npm run type-check` to verify

## Deployment

### Build
```bash
npm run build
```

### Environment Variables
Create `.env.local`:
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

### Deploy to Vercel
```bash
vercel deploy
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Recharts](https://recharts.org)
- [Lucide Icons](https://lucide.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## Support

For issues or questions about the implementation, refer to:
- `IMPLEMENTATION_SUMMARY.md` - Complete feature list
- Component JSDoc comments
- Type definitions in `lib/types.ts`
