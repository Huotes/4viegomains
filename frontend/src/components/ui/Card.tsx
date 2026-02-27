import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  hoverable?: boolean
  glow?: 'mist' | 'ruination' | 'none'
}

export function Card({
  children,
  className,
  hoverable = true,
  glow = 'mist',
  ...props
}: CardProps): React.ReactElement {
  return (
    <div
      className={cn(
        'glass rounded-lg border border-shadow-light p-6 transition-all duration-300',
        glow === 'mist' && (hoverable ? 'mist-glow-hover' : 'mist-glow'),
        glow === 'ruination' && (hoverable ? 'ruination-glow-hover' : 'ruination-glow'),
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
    <div className={cn('mb-4 border-b border-shadow-light pb-4', className)} {...props}>
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
    <h3 className={cn('text-xl font-cinzel font-bold text-white', className)} {...props}>
      {children}
    </h3>
  )
}

export function CardContent({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.ReactElement {
  return (
    <div className={cn('', className)} {...props}>
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
    <div className={cn('mt-4 border-t border-shadow-light pt-4', className)} {...props}>
      {children}
    </div>
  )
}
