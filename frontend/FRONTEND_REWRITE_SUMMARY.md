# 4ViegoMains Frontend Rewrite - Shadow Isles Theme

## Overview
Complete rewrite of core frontend files with a polished, fully responsive Shadow Isles theme for League of Legends Viego analytics platform.

## Files Rewritten

### 1. **Global Styles** (`src/app/globals.css`)
- Complete Tailwind v4 integration with @theme block
- Custom color palette (shadow blacks, mist greens, ruination purples, soul golds)
- 6+ keyframe animations (mist-float, mist-pulse, ruination-glow, shadow-shift, soul-shimmer, fade-in-up, particle-rise)
- Utility classes for glass effects, glows, and gradients
- Custom scrollbar styling with mist green gradient
- Responsive typography scaling
- Proper focus states for accessibility
- Table styling with hover effects

### 2. **Root Layout** (`src/app/layout.tsx`)
- Font imports from next/font/google (Inter, Cinzel, JetBrains Mono)
- Comprehensive metadata with OG tags and Twitter card support
- SVG-based mist particle overlay (subtle, pointer-events-none)
- Proper z-index layering for layout components

### 3. **Navbar** (`src/components/layout/Navbar.tsx`)
- Sticky top with glass effect and blur backdrop
- Logo with Crown icon + "4ViegoMains" in Cinzel with gold gradient
- Desktop navigation with active link indicators (animated underline)
- Integrated Riot ID search (Name#TAG format) with region dropdown
- Mobile hamburger menu with animated slide-down panel
- Full responsive design (mobile-first approach)
- Search validation and feedback
- Loading states for search button

### 4. **Footer** (`src/components/layout/Footer.tsx`)
- 4-column grid layout (responsive: 4 cols → 2 cols → 1 col)
- Sections: Navigation, Resources, Community, Legal
- Rotating Viego quotes with character attribution
- Social links (GitHub, Twitter, Email)
- Legal disclaimer with warning styling
- Copyright and attribution information
- Mist green gradient top border

### 5. **Sidebar** (`src/components/layout/Sidebar.tsx`)
- Role selector with expandable subsections (Builds, Runes, Guides, Matchups)
- ELO tier filter dropdown
- Patch version display with info
- Quick links section
- Active state indicators with mist green highlighting
- Sticky positioning with responsive behavior
- Icons for different sections (📚📖⚔️⚡)

### 6. **Button Component** (`src/components/ui/Button.tsx`)
- Enhanced variants: primary, secondary, ghost, outline, danger, link
- Sizes: sm, md, lg, icon
- Loading state with animated spinner
- Icon support
- LinkButton variant for <a> tag rendering
- Smooth transitions and scale effects on active
- Focus-visible states for accessibility

### 7. **Card Component** (`src/components/ui/Card.tsx`)
- Enhanced glow variants: mist, ruination, soul, none
- CardDescription subcomponent added
- Glass morphism with hover effects
- CardHeader, CardTitle, CardDescription, CardContent, CardFooter subcomponents
- Proper spacing and border styling
- Group hover effects

### 8. **Badge Component** (`src/components/ui/Badge.tsx`)
- Variants: default, tier, role, stat, status, patch
- Size options: sm, md
- TierBadge with ELO-specific styling for all 9 tiers
- RoleBadge for role display
- StatBadge for metrics display
- StatusBadge for success/warning/danger states
- PatchBadge for version display
- Responsive text sizing

### 9. **Tabs Component** (`src/components/ui/Tabs.tsx`)
- Animated underline indicator with smooth transitions
- Support for icons in tabs
- Two variants: default, pills
- Optional full-width layout
- Responsive scrollable tabs on mobile
- Fade-in animation on tab content change
- useRef-based ref tracking for indicator position

### 10. **SearchInput Component** (`src/components/ui/SearchInput.tsx`)
- Riot ID format validation (Name#TAG)
- Clear button with icon
- Region dropdown integration
- Loading state support
- Format hint display
- Error state with red styling
- Debounced search callback
- SearchDropdown subcomponent for suggestions
- Results can include icons and subtitles

### 11. **Loading Component** (`src/components/ui/Loading.tsx`)
- LoadingSpinner with multi-ring animation
- Three size options: sm, md, lg
- Full-screen overlay capability
- Optional Viego quote rotation
- LoadingCard with skeleton animation
- LoadingSkeleton for generic line placeholders
- LoadingPage for full-page loading states
- Animated dot indicators

### 12. **Select Component** (`src/components/ui/Select.tsx`)
- Custom styled dropdown
- Searchable option filtering
- Clearable with X button
- Icon support in options
- Keyboard and click-outside handling
- Proper focus management
- Glass styled background
- Loading-friendly with disabled state

### 13. **Tooltip Component** (`src/components/ui/Tooltip.tsx`)
- Hover-based activation with configurable delay
- Four positions: top, bottom, left, right
- Arrow indicators
- Glass background with mist border
- Smooth fade-in animation
- Proper cleanup with useEffect

### 14. **ProgressBar Component** (`src/components/ui/ProgressBar.tsx`)
- Horizontal progress bar with gradient fills
- Label and percentage display options
- Variants: mist, ruination, soul, default
- Height options: sm, md, lg
- Animated shimmer effect
- MultiProgressBar for stacked segments with legend
- Smooth transition animations

### 15. **Modal Component** (`src/components/ui/Modal.tsx`)
- Full-screen overlay with backdrop blur
- Configurable size: sm, md, lg, xl
- Header with title and close button
- Footer slot for actions
- ESC key to close
- Backdrop click to close (optional)
- Body scroll prevention
- ConfirmModal subcomponent for confirmations
- Smooth fade-in animations

## Design Features

### Color Palette
- **Shadow Blacks**: #0a0a0f, #121218, #1a1a24, #252533
- **Mist Green**: #00ff87 (primary accent)
- **Mist Cyan**: #00e5ff (secondary accent)
- **Ruination Purple**: #7c4dff (glow effects)
- **Soul Gold**: #ffd54f (highlights)
- **Danger Red**: #ff5252

### Typography
- **Cinzel**: Headings, logos, epic titles
- **Inter**: Body text, UI elements
- **JetBrains Mono**: Code, stats, technical information

### Animations
- Mist float (6s infinite)
- Mist pulse (2s infinite)
- Ruination glow (2s infinite)
- Soul shimmer (3s infinite)
- Fade in up (0.5s ease-out)
- Smooth transitions (300ms)

### Responsive Breakpoints
- Mobile-first approach
- Smooth transitions between breakpoints
- Hidden elements: md:hidden, lg:block, etc.
- Responsive typography scaling
- Touch-friendly spacing

## Accessibility Features
- Focus-visible outlines (2px mist green)
- ARIA labels for buttons
- Semantic HTML structure
- Proper heading hierarchy
- Color contrast compliance
- Keyboard navigation support
- Disabled state styling

## Performance Optimizations
- CSS-based animations (GPU accelerated)
- Efficient Tailwind classes
- Proper z-index layering
- Optimized re-renders with React
- Lazy loaded images ready
- SVG-based decorative elements

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid and Flexbox
- CSS Variables
- Backdrop Filter support
- CSS Gradient support

## Future Enhancements
- Theme toggle (light/dark mode support)
- Animation preferences (prefers-reduced-motion)
- More component variants
- Storybook integration
- Component documentation
- Custom form elements
- Advanced tables with sorting/filtering

## Integration Notes
- All components are fully typed with TypeScript
- Use 'use client' directive for interactive components
- Imports use absolute paths with @ alias
- Components follow consistent naming conventions
- Props interfaces extend HTML element attributes
- Proper accessibility attributes included
