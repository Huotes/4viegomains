import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  hoverable?: boolean
  glow?: 'mist' | 'ruination' | 'soul' | 'none'
}

export function Card({
  children,
  className,
  hoverable = true,
  glow = 'mist',
  ...props
}: CardProps): React.ReactElement {
  const glowClasses = {
    mist: hoverable ? 'mist-glow-hover' : 'mist-glow',
    ruination: hoverable ? 'ruination-glow-hover' : 'ruination-glow',
    soul: hoverable ? 'soul-glow-hover' : 'soul-glow',
    none: '',
  }

  return (
    <div
      className={cn(
        'glass rounded-lg border border-shadow-light/50 p-6 transition-all duration-300 group',
        glowClasses[glow],
        hoverable && 'hover:border-shadow-light/80',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.ReactElement {
  return (
    <div
      className={cn('mb-4 border-b border-mist-green/20 pb-4', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardTitle({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>): React.ReactElement {
  return (
    <h3 className={cn('text-xl md:text-2xl font-cinzel font-bold text-white', className)} {...props}>
      {children}
    </h3>
  )
}

export function CardDescription({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>): React.ReactElement {
  return (
    <p className={cn('text-sm md:text-base text-gray-400 mt-1', className)} {...props}>
      {children}
    </p>
  )
}

export function CardContent({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.ReactElement {
  return (
    <div className={cn('space-y-4', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.ReactElement {
  return (
    <div
      className={cn('mt-6 flex items-center gap-3 border-t border-mist-green/20 pt-4', className)}
      {...props}
    >
      {children}
    </div>
  )
}
