import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  fullScreen?: boolean
  quote?: boolean
}

const VIEGO_QUOTES = [
  "The wait is part of the suffering.",
  "Patience, summoner. The Ruined King cannot be rushed.",
  "Even immortality has its moments...",
  "My collection grows... slowly but surely.",
  "The shadows are patient. So must you be.",
]

export function LoadingSpinner({
  size = 'md',
  text,
  fullScreen = false,
  quote = false,
}: LoadingSpinnerProps): React.ReactElement {
  const sizeStyles = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  }

  const randomQuote = VIEGO_QUOTES[Math.floor(Math.random() * VIEGO_QUOTES.length)]

  const spinner = (
    <div className="relative inline-flex items-center justify-center">
      {/* Outer ring - Mist Green */}
      <div
        className={cn(
          'absolute rounded-full border-2 border-shadow-medium animate-spin',
          'border-t-mist-green border-r-mist-cyan border-b-transparent border-l-transparent',
          sizeStyles[size]
        )}
      />
      {/* Middle ring - Ruination Purple (reverse spin) */}
      <div
        className={cn(
          'absolute rounded-full border-2 border-shadow-light animate-spin',
          'border-t-ruination-purple border-r-transparent border-b-ruination-blue border-l-transparent',
          'opacity-60',
          sizeStyles[size]
        )}
        style={{ animationDirection: 'reverse', animationDuration: '2s' }}
      />
      {/* Center dot - Soul Gold pulsing */}
      <div className="h-2 w-2 rounded-full bg-gradient-to-r from-soul-gold to-mist-green animate-pulse" />
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-shadow-black/90 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-6 px-4">
          {spinner}
          {text && (
            <p className="text-lg font-semibold text-mist-cyan animate-pulse text-center">
              {text}
            </p>
          )}
          {quote && (
            <div className="text-center max-w-xs">
              <p className="text-sm italic text-mist-green/70 mb-2">
                "{randomQuote}"
              </p>
              <p className="text-xs text-gray-500">— VIEGO</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12 px-4">
      {spinner}
      {text && (
        <p className="text-base font-semibold text-mist-cyan animate-pulse">
          {text}
        </p>
      )}
      {quote && (
        <div className="text-center">
          <p className="text-sm italic text-mist-green/70">
            "{randomQuote}"
          </p>
        </div>
      )}
    </div>
  )
}

interface LoadingCardProps {
  count?: number
  animated?: boolean
}

export function LoadingCard({
  count = 1,
  animated = true,
}: LoadingCardProps): React.ReactElement {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'glass rounded-lg border border-shadow-light/50 p-6 space-y-4',
            animated && 'animate-pulse'
          )}
        >
          {/* Title skeleton */}
          <div className="h-6 w-2/3 rounded bg-gradient-to-r from-shadow-medium to-shadow-light" />
          {/* Content skeleton lines */}
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-gradient-to-r from-shadow-medium to-shadow-light" />
            <div className="h-4 w-5/6 rounded bg-gradient-to-r from-shadow-medium to-shadow-light" />
          </div>
          {/* Footer skeleton */}
          <div className="h-4 w-1/2 rounded bg-gradient-to-r from-shadow-medium to-shadow-light" />
        </div>
      ))}
    </div>
  )
}

interface LoadingSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number
  width?: string | string[]
  animated?: boolean
}

export function LoadingSkeleton({
  lines = 3,
  width,
  animated = true,
  className,
  ...props
}: LoadingSkeletonProps): React.ReactElement {
  const widths = Array.isArray(width)
    ? width
    : width
      ? [width]
      : Array(lines).fill('w-full')

  return (
    <div className={cn('space-y-2', className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-4 rounded bg-gradient-to-r from-shadow-medium to-shadow-light',
            widths[i] || widths[widths.length - 1],
            animated && 'animate-pulse'
          )}
        />
      ))}
    </div>
  )
}

interface LoadingPageProps {
  title?: string
  showQuote?: boolean
}

export function LoadingPage({
  title = 'Loading',
  showQuote = true,
}: LoadingPageProps): React.ReactElement {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-8 max-w-md">
        <div className="relative h-24 w-24 flex items-center justify-center">
          {/* Outer glow circle */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-mist-green/20 to-mist-cyan/20 blur-xl animate-pulse" />
          {/* Spinner */}
          <LoadingSpinner size="lg" />
        </div>

        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-cinzel font-bold gradient-text-mist mb-2">
            {title}
          </h2>
          <p className="text-gray-500 text-sm">
            Summoning the Ruined King's knowledge...
          </p>
        </div>

        {showQuote && (
          <div className="glass rounded-lg border border-mist-green/30 p-6 text-center">
            <p className="text-mist-green/80 italic text-sm mb-2">
              "Only I can collect what's mine."
            </p>
            <p className="text-gray-500 text-xs">— VIEGO</p>
          </div>
        )}

        {/* Animated dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 w-2 rounded-full bg-mist-green animate-pulse"
              style={{
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
