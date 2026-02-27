import { cn } from '@/lib/utils'
import type { Role, EloTier } from '@/lib/types'
import { TIER_COLORS, ROLE_LABELS, ROLE_DESCRIPTIONS } from '@/lib/constants'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
  variant?: 'default' | 'tier' | 'role' | 'success' | 'warning' | 'error'
}

export function Badge({
  children,
  className,
  variant = 'default',
  ...props
}: BadgeProps): React.ReactElement {
  const variantStyles = {
    default: 'bg-shadow-medium text-mist-cyan border border-mist-cyan/30',
    tier: 'bg-shadow-light border border-soul-gold/50 text-soul-gold',
    role: 'bg-shadow-light border border-ruination-purple/50 text-ruination-purple',
    success: 'bg-green-900/30 border border-mist-green/50 text-mist-green',
    warning: 'bg-yellow-900/30 border border-soul-gold/50 text-soul-gold',
    error: 'bg-red-900/30 border border-red-500/50 text-red-400',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

interface TierBadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  tier: EloTier
  rank?: string
}

export function TierBadge({ tier, rank, className, ...props }: TierBadgeProps): React.ReactElement {
  const bgColor = TIER_COLORS[tier]
  return (
    <Badge
      variant="tier"
      className={cn('gap-2', className)}
      style={{ borderColor: `${bgColor}66` }}
      {...props}
    >
      {tier}
      {rank && <span className="font-mono text-xs">{rank}</span>}
    </Badge>
  )
}

interface RoleBadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  role: Role
}

export function RoleBadge({ role, className, ...props }: RoleBadgeProps): React.ReactElement {
  return (
    <Badge
      variant="role"
      className={className}
      title={ROLE_DESCRIPTIONS[role]}
      {...props}
    >
      {ROLE_LABELS[role]}
    </Badge>
  )
}

interface StatBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  label: string
  value: string | number
  unit?: string
}

export function StatBadge({
  label,
  value,
  unit,
  className,
  ...props
}: StatBadgeProps): React.ReactElement {
  return (
    <div className={cn('flex flex-col gap-1', className)} {...props}>
      <span className="text-xs font-semibold text-mist-cyan/70 uppercase tracking-wider">
        {label}
      </span>
      <span className="text-lg font-bold gradient-text-mist">
        {value}
        {unit && <span className="text-sm ml-1">{unit}</span>}
      </span>
    </div>
  )
}
