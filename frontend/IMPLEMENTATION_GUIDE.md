# 4ViegoMains Frontend Implementation Guide

## Project Overview
Complete rewrite of the 4ViegoMains frontend with a polished, production-quality Shadow Isles theme inspired by League of Legends' ruined aesthetic.

## Directory Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── globals.css          # Global styles with Tailwind v4 @theme
│   │   └── layout.tsx           # Root layout with fonts and particles
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx       # Header with search and nav
│   │   │   ├── Footer.tsx       # Footer with links and quotes
│   │   │   └── Sidebar.tsx      # Role selector and filters
│   │   └── ui/
│   │       ├── Button.tsx       # Enhanced button with variants
│   │       ├── Card.tsx         # Glass-effect cards
│   │       ├── Badge.tsx        # Status/tier/role badges
│   │       ├── Tabs.tsx         # Animated tab navigation
│   │       ├── SearchInput.tsx  # Riot ID search with validation
│   │       ├── Loading.tsx      # Spinners and skeletons
│   │       ├── Select.tsx       # Custom dropdown
│   │       ├── Tooltip.tsx      # Hover tooltips
│   │       ├── ProgressBar.tsx  # Progress indicators
│   │       └── Modal.tsx        # Dialog/overlay modals
```

## Component Usage Examples

### Button Component
```tsx
import { Button, LinkButton } from '@/components/ui/Button'

// Standard button
<Button variant="primary" size="md">
  Click Me
</Button>

// With icon
<Button variant="primary" icon={<Search />}>
  Search
</Button>

// Link button
<LinkButton href="/builds/top" variant="ghost">
  View Builds
</LinkButton>

// Loading state
<Button loading>Processing...</Button>
```

### Card Component
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card'

<Card glow="mist">
  <CardHeader>
    <CardTitle>Viego Statistics</CardTitle>
    <CardDescription>Patch 14.3 data</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter>
    <Button>View More</Button>
  </CardFooter>
</Card>
```

### Badge Component
```tsx
import { Badge, TierBadge, RoleBadge, StatBadge, StatusBadge } from '@/components/ui/Badge'

// ELO tier badge
<TierBadge tier="DIAMOND" rank="I" />

// Role badge
<RoleBadge role="top" />

// Stat metric
<StatBadge label="Win Rate" value="52.3" unit="%" />

// Status indicator
<StatusBadge status="success">Active</StatusBadge>
```

### Tabs Component
```tsx
import { Tabs, TabContent } from '@/components/ui/Tabs'

const tabs = [
  { id: 'builds', label: 'Builds', icon: <Book /> },
  { id: 'runes', label: 'Runes', icon: <Zap /> },
]

<Tabs tabs={tabs} defaultTab="builds" onTabChange={(id) => console.log(id)}>
  <TabContent tabId="builds" activeTab="builds">
    {/* Builds content */}
  </TabContent>
  <TabContent tabId="runes" activeTab="builds">
    {/* Runes content */}
  </TabContent>
</Tabs>
```

### SearchInput Component
```tsx
import { SearchInput } from '@/components/ui/SearchInput'

<SearchInput
  onSearch={(query) => router.push(`/player/${selectedRegion}/${name}/${tag}`)}
  placeholder="Player Name#TAG"
  isValid={(value) => /^[\w\s]{1,16}#[\w]{3,5}$/.test(value)}
/>
```

### Loading Component
```tsx
import { LoadingSpinner, LoadingCard, LoadingPage } from '@/components/ui/Loading'

// Spinner
<LoadingSpinner size="lg" text="Loading..." quote />

// Card skeleton
<LoadingCard count={3} />

// Full page
<LoadingPage title="Analyzing" showQuote />
```

### Select Component
```tsx
import { Select } from '@/components/ui/Select'

<Select
  options={[
    { value: 'na1', label: 'NA Server' },
    { value: 'euw1', label: 'EUW Server' },
  ]}
  value={region}
  onChange={setRegion}
  searchable
  clearable
/>
```

### Tooltip Component
```tsx
import { Tooltip } from '@/components/ui/Tooltip'

<Tooltip content="Advanced stats for this item" position="top">
  <span className="cursor-help">Hover me</span>
</Tooltip>
```

### ProgressBar Component
```tsx
import { ProgressBar, MultiProgressBar } from '@/components/ui/ProgressBar'

// Simple progress
<ProgressBar
  value={52.3}
  label="Win Rate"
  showPercentage
  variant="mist"
/>

// Stacked segments
<MultiProgressBar
  segments={[
    { value: 35, label: 'Wins', variant: 'mist' },
    { value: 30, label: 'Losses', variant: 'ruination' },
  ]}
/>
```

### Modal Component
```tsx
import { Modal, ConfirmModal } from '@/components/ui/Modal'

// Standard modal
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Match Details"
  size="lg"
>
  {/* Content */}
</Modal>

// Confirmation dialog
<ConfirmModal
  isOpen={isOpen}
  onClose={onClose}
  title="Delete Build"
  message="Are you sure you want to delete this build?"
  onConfirm={handleDelete}
/>
```

## Styling Guide

### Using Tailwind Classes
All components support standard Tailwind utility classes. The custom colors are available as:

```tsx
// Background colors
className="bg-shadow-black bg-shadow-dark bg-shadow-medium bg-shadow-light"

// Text colors
className="text-mist-green text-mist-cyan text-ruination-purple text-soul-gold"

// Border colors
className="border-mist-green/30 border-ruination-purple/50"

// Glow effects
className="mist-glow mist-glow-hover ruination-glow soul-glow-hover"

// Gradient text
className="gradient-text-mist gradient-text-ruination gradient-text-soul"

// Glass effect
className="glass glass-hover"
```

### Custom CSS Variables
```css
/* Available in :root */
--shadow-black: #0a0a0f;
--shadow-dark: #121218;
--shadow-medium: #1a1a24;
--shadow-light: #252533;
--mist-green: #00ff87;
--mist-cyan: #00e5ff;
--ruination-purple: #7c4dff;
--soul-gold: #ffd54f;

/* Animations */
--glow-intensity: 0.4;
--glow-blur: 20px;
```

## Animation Classes

```tsx
// Built-in animation classes
className="animate-mist-float"      // 6s floating motion
className="animate-mist-pulse"      // 2s pulsing glow
className="animate-soul-shimmer"    // 3s shimmer effect
className="animate-fade-in-up"      // 0.5s fade and slide
className="shadow-shift"            // 8s background shift
className="ruination-pulse"         // 2s ruination glow
```

## Responsive Design Patterns

```tsx
// Mobile-first approach
<div className="px-4 md:px-6 lg:px-8">
  {/* Padding scales up */}
</div>

// Hide/show on breakpoints
<div className="hidden md:block lg:hidden">Only on tablet</div>

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
  {/* 1 col mobile, 2 tablet, 4 desktop */}
</div>

// Responsive text
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  Responsive heading
</h1>
```

## Accessibility Checklist

- ✓ Focus-visible states with mist green outline
- ✓ ARIA labels on interactive elements
- ✓ Semantic HTML (use <button> not <div role="button">)
- ✓ Color contrast meets WCAG AA standard
- ✓ Keyboard navigation fully supported
- ✓ Alt text on images
- ✓ Form labels associated with inputs
- ✓ Error messages linked to fields

## Performance Tips

1. **Image Optimization**
   ```tsx
   import Image from 'next/image'
   <Image src="" alt="" width={} height={} />
   ```

2. **Code Splitting**
   - Components are already exported separately
   - Use dynamic imports for heavy components
   ```tsx
   const Modal = dynamic(() => import('@/components/ui/Modal'))
   ```

3. **Animations**
   - CSS animations are GPU-accelerated
   - Prefer CSS over JavaScript for motion
   - Use will-change sparingly

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Enhancements

1. **Dark/Light Theme Toggle**
2. **Animation Preferences** (prefers-reduced-motion)
3. **RTL Language Support**
4. **Accessibility Improvements**
5. **Component Storybook**
6. **Automated Testing**
7. **Performance Monitoring**

## Troubleshooting

### Colors not appearing?
- Ensure Tailwind config includes custom colors
- Check that globals.css is imported in layout.tsx
- Verify @theme block is correct

### Animations not smooth?
- Check for will-change overuse
- Ensure GPU acceleration is available
- Use transform and opacity for best performance

### Layout shifts?
- Define dimensions for images
- Use min-h-screen properly
- Check for missing borders/paddings

## Support & Documentation

For detailed component documentation, refer to:
- Component JSDoc comments in source files
- Props interfaces in each component file
- Usage examples above in this guide

---

**Last Updated**: February 28, 2026
**Theme**: Shadow Isles / Ruination
**Version**: 1.0.0
