import { cn } from '@/lib/utils'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  fullScreen?: boolean
}

export function Loading({ size = 'md', text, fullScreen = false }: LoadingProps): React.ReactElement {
  const sizeStyles = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  }

  const spinner = (
    <div className="relative inline-flex items-center justify-center">
      {/* Outer ring */}
      <div
        className={cn(
          'absolute rounded-full border-2 border-shadow-medium animate-spin',
          'border-t-mist-green border-r-mist-cyan',
          sizeStyles[size]
        )}
      />
      {/* Inner ring */}
      <div
        className={cn(
          'absolute rounded-full border-2 border-shadow-light animate-spin',
          'border-b-ruination-purple border-l-ruination-blue',
          'opacity-50',
          sizeStyles[size]
        )}
        style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
      />
      {/* Center dot */}
      <div className="h-2 w-2 rounded-full bg-gradient-to-r from-mist-green to-mist-cyan animate-pulse" />
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-shadow-black/80 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center gap-4">
          {spinner}
          {text && (
            <p className="text-mist-cyan font-semibold animate-pulse">{text}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      {spinner}
      {text && (
        <p className="text-mist-cyan font-semibold animate-pulse">{text}</p>
      )}
    </div>
  )
}

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number
}

export function Skeleton({ count = 1, className, ...props }: SkeletonProps): React.ReactElement {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'rounded-lg bg-gradient-to-r from-shadow-medium to-shadow-light animate-pulse',
            'mb-2 h-12 w-full',
            className
          )}
          {...props}
        />
      ))}
    </>
  )
}

interface SkeletonCardProps {
  count?: number
}

export function SkeletonCard({ count = 3 }: SkeletonCardProps): React.ReactElement {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="glass rounded-lg border border-shadow-light p-6 space-y-4"
        >
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-full" count={2} />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  )
}
