# Quick Start Guide - 4ViegoMains Frontend

## 5-Minute Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
```

Edit `.env.local` and set your API endpoint:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 3. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure at a Glance

```
src/
├── app/                 # Pages & routes
├── components/          # Reusable UI components
├── lib/                 # Utilities, types, API client
└── hooks/               # Custom React hooks
```

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
npm run format   # Format code with Prettier
```

## Key Files to Know

### API Client
**File**: `src/lib/api.ts`
- All API endpoints are typed here
- Client-side caching included
- Import and use in hooks or components

### Types
**File**: `src/lib/types.ts`
- All TypeScript interfaces defined
- Used for API responses and component props

### Constants
**File**: `src/lib/constants.ts`
- Game constants (roles, regions, tiers, etc.)
- Color schemes
- API configuration

### Theme
**File**: `src/app/globals.css`
- Shadow Isles color definitions
- Global styles and animations
- Utility classes for glows and effects

## Common Tasks

### Add a New Route
1. Create folder structure: `src/app/new-page/page.tsx`
2. Export default React component
3. Add metadata export for SEO

Example:
```tsx
export const metadata = { title: 'Page Title' }

export default function NewPage() {
  return <div>Content</div>
}
```

### Create a New Component
1. Add file to `src/components/category/ComponentName.tsx`
2. Use TypeScript and proper typing
3. Import from `@/lib/types` for type definitions

Example:
```tsx
interface ComponentProps {
  title: string
}

export function MyComponent({ title }: ComponentProps): React.ReactElement {
  return <div className="mist-glow">{title}</div>
}
```

### Use the API
```tsx
import { getBuilds } from '@/lib/api'

const response = await getBuilds('top', 1, 20)
if (response.success) {
  console.log(response.data)
}
```

### Use Hooks
```tsx
'use client'
import { useViegoBuilds } from '@/hooks/useViegoBuilds'

export default function BuildsPage() {
  const { builds, loading, error } = useViegoBuilds({ role: 'top' })

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return <div>{/* Your content */}</div>
}
```

## Component Imports

```tsx
// Layout
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Sidebar } from '@/components/layout/Sidebar'

// UI
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge, RoleBadge, TierBadge, StatBadge } from '@/components/ui/Badge'
import { Tabs, TabContent } from '@/components/ui/Tabs'
import { SearchInput, SearchDropdown } from '@/components/ui/SearchInput'
import { Loading, Skeleton, SkeletonCard } from '@/components/ui/Loading'

// Feature Components
import { BuildPath } from '@/components/builds/BuildPath'
import { PlayerCard } from '@/components/player/PlayerCard'
import { RoleComparison } from '@/components/analytics/RoleComparison'
import { WinRateTrend } from '@/components/analytics/WinRateTrend'
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable'
```

## Styling with Tailwind & Shadow Isles

### Custom Colors
```tsx
// Shadow Isles colors are available as Tailwind classes
<div className="bg-shadow-dark text-mist-green">Shadow Isles</div>
<div className="gradient-text-mist">Gradient text</div>
<div className="gradient-text-soul">Another gradient</div>
```

### Glow Effects
```tsx
<div className="mist-glow">Default mist glow</div>
<div className="mist-glow-hover">Glow on hover</div>
<div className="ruination-glow">Ruination purple glow</div>
<div className="soul-shimmer">Shimmer animation</div>
```

### Glass Effect
```tsx
<div className="glass">Semi-transparent with blur</div>
<div className="glass-hover">Glass with hover effect</div>
```

## Utility Functions

```tsx
import {
  cn,                    // Merge Tailwind classes
  formatWinRate,         // Format as percentage
  formatNumber,          // Format large numbers (1K, 1M)
  formatKDA,             // Format kills/deaths/assists
  formatDuration,        // Format seconds to mm:ss
  formatRelativeTime,    // Format as "2h ago"
  getTierColor,          // Get hex color for elo tier
  getRoleIcon,           // Get emoji for role
  getPerformanceColor,   // Get color based on value
  isValidRiotId,         // Validate Name#TAG format
} from '@/lib/utils'
```

## Environment Variables

Create `.env.local` in project root:

```env
# Required
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

- Variables prefixed with `NEXT_PUBLIC_` are exposed to browser
- Never commit `.env.local` to version control
- Use `.env.example` as template

## Debugging Tips

### TypeScript Errors
- Check imports are from `@/lib/types`
- Verify component prop types match interface
- Use `satisfies` keyword to narrow types

### Styling Issues
- Clear `.next` folder: `rm -rf .next && npm run build`
- Check color names in `tailwind.config.ts`
- Inspect element in DevTools for actual classes

### API Errors
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify backend is running
- Check console for detailed error messages
- Use browser DevTools Network tab to inspect requests

## Docker Deployment

Build and run production image:
```bash
docker build -t 4viegomains .
docker run -p 3000:3000 4viegomains
```

## Next Steps

1. ✅ Install dependencies (`npm install`)
2. ✅ Start dev server (`npm run dev`)
3. Set up backend API and update `.env.local`
4. Implement missing component logic
5. Connect to real API endpoints
6. Add more pages and features
7. Deploy to production

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Recharts Documentation](https://recharts.org)
- [Lucide Icons](https://lucide.dev)

## Support

For issues or questions, check:
1. README.md for comprehensive docs
2. SCAFFOLD_SUMMARY.md for architecture overview
3. Component source files for examples
4. Browser console for error messages

---

**Happy coding! Welcome to the Shadow Isles.** 🖤💚
