import { cn } from '@/lib/utils'

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  label?: string
  showPercentage?: boolean
  variant?: 'mist' | 'ruination' | 'soul' | 'default'
  animated?: boolean
  height?: 'sm' | 'md' | 'lg'
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = true,
  variant = 'mist',
  animated = true,
  height = 'md',
  className,
  ...props
}: ProgressBarProps): React.ReactElement {
  const percentage = Math.min((value / max) * 100, 100)

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  }

  const variantClasses = {
    mist: 'from-mist-green to-mist-cyan',
    ruination: 'from-ruination-purple to-ruination-blue',
    soul: 'from-soul-gold to-mist-green',
    default: 'from-mist-green via-mist-cyan to-ruination-blue',
  }

  return (
    <div className={cn('w-full', className)} {...props}>
      {/* Header with label and percentage */}
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className="text-sm font-semibold text-gray-300">{label}</span>
          )}
          {showPercentage && (
            <span className="text-sm font-mono text-mist-green">
              {percentage.toFixed(1)}%
            </span>
          )}
        </div>
      )}

      {/* Progress Bar Container */}
      <div
        className={cn(
          'relative w-full rounded-full bg-shadow-medium/40 border border-shadow-light/30 overflow-hidden',
          heightClasses[height]
        )}
      >
        {/* Progress Fill */}
        <div
          className={cn(
            'h-full rounded-full bg-gradient-to-r transition-all duration-500',
            variantClasses[variant],
            animated && 'shadow-lg',
            animated && variant === 'mist' && 'mist-glow'
          )}
          style={{
            width: `${percentage}%`,
          }}
        />

        {/* Animated Shimmer Overlay */}
        {animated && (
          <div
            className={cn(
              'absolute inset-0 rounded-full',
              'bg-gradient-to-r from-transparent via-white/20 to-transparent',
              'animate-shimmer opacity-0'
            )}
            style={{
              backgroundSize: '200% 100%',
              animation: 'shimmer 2s infinite',
            }}
          />
        )}
      </div>

      {/* Add shimmer keyframes via style tag */}
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            background-position: 200% 0;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

interface MultiProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  segments: Array<{
    value: number
    label?: string
    variant?: 'mist' | 'ruination' | 'soul'
  }>
  max?: number
  height?: 'sm' | 'md' | 'lg'
}

export function MultiProgressBar({
  segments,
  max = 100,
  height = 'md',
  className,
  ...props
}: MultiProgressBarProps): React.ReactElement {
  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  }

  const variantColors = {
    mist: 'bg-gradient-to-r from-mist-green to-mist-cyan',
    ruination: 'bg-gradient-to-r from-ruination-purple to-ruination-blue',
    soul: 'bg-gradient-to-r from-soul-gold to-mist-green',
  }

  return (
    <div className={cn('w-full', className)} {...props}>
      {/* Label Legend */}
      {segments.some((s) => s.label) && (
        <div className="flex flex-wrap gap-3 mb-3">
          {segments.map(
            (segment, idx) =>
              segment.label && (
                <div key={idx} className="flex items-center gap-2">
                  <div
                    className={cn(
                      'w-3 h-3 rounded-full',
                      variantColors[segment.variant || 'mist']
                    )}
                  />
                  <span className="text-xs text-gray-400">{segment.label}</span>
                </div>
              )
          )}
        </div>
      )}

      {/* Progress Bar Container */}
      <div
        className={cn(
          'relative w-full rounded-full bg-shadow-medium/40 border border-shadow-light/30 overflow-hidden',
          'flex',
          heightClasses[height]
        )}
      >
        {segments.map((segment, idx) => (
          <div
            key={idx}
            className={cn(
              'h-full transition-all duration-500',
              variantColors[segment.variant || 'mist'],
              idx > 0 && 'ml-px'
            )}
            style={{
              width: `${(segment.value / max) * 100}%`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
