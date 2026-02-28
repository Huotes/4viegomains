import { cn } from '@/lib/utils'
import type { Role, EloTier } from '@/lib/types'
import { TIER_COLORS, ROLE_LABELS, ROLE_DESCRIPTIONS } from '@/lib/constants'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
  variant?: 'default' | 'tier' | 'role' | 'stat' | 'status' | 'patch' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md'
}

const variantStyles = {
  default: 'bg-shadow-medium text-mist-cyan border border-mist-cyan/30',
  tier: 'bg-shadow-light border border-soul-gold/50 text-soul-gold font-cinzel',
  role: 'bg-shadow-light border border-ruination-purple/50 text-ruination-purple font-semibold',
  stat: 'bg-shadow-medium/60 border border-mist-green/40 text-mist-green font-mono',
  status: 'bg-shadow-light border text-white',
  patch: 'bg-shadow-medium border border-mist-cyan/40 text-mist-cyan font-mono text-xs',
  success: 'bg-success/20 border border-success/50 text-success font-semibold',
  warning: 'bg-warning/20 border border-warning/50 text-warning font-semibold',
  danger: 'bg-danger/20 border border-danger/50 text-danger font-semibold',
}

const sizeStyles = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
}

export function Badge({
  children,
  className,
  variant = 'default',
  size = 'md',
  ...props
}: BadgeProps): React.ReactElement {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold transition-all duration-300',
        variantStyles[variant],
        sizeStyles[size],
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

const TIER_STYLES: Record<EloTier, string> = {
  IRON: 'border-gray-600/60 bg-gray-900/40 text-gray-300',
  BRONZE: 'border-yellow-700/60 bg-yellow-900/20 text-yellow-600',
  SILVER: 'border-gray-400/60 bg-gray-800/30 text-gray-300',
  GOLD: 'border-yellow-500/60 bg-yellow-900/30 text-yellow-400',
  PLATINUM: 'border-cyan-500/60 bg-cyan-900/20 text-cyan-300',
  DIAMOND: 'border-blue-400/60 bg-blue-900/20 text-blue-300',
  MASTER: 'border-purple-500/60 bg-purple-900/20 text-purple-300',
  GRANDMASTER: 'border-red-500/60 bg-red-900/20 text-red-300',
  CHALLENGER: 'border-soul-gold/60 bg-soul-gold/10 text-soul-gold',
}

export function TierBadge({ tier, rank, className, ...props }: TierBadgeProps): React.ReactElement {
  return (
    <Badge
      variant="tier"
      size="md"
      className={cn('gap-2 font-cinzel', TIER_STYLES[tier], className)}
      {...props}
    >
      {tier}
      {rank && <span className="font-mono text-xs opacity-75">{rank}</span>}
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
      size="md"
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
    <div className={cn('flex flex-col gap-1.5', className)} {...props}>
      <span className="text-xs font-semibold text-mist-cyan/70 uppercase tracking-wider font-inter">
        {label}
      </span>
      <span className="text-lg font-bold gradient-text-mist font-mono">
        {value}
        {unit && <span className="text-sm ml-1 text-gray-400">{unit}</span>}
      </span>
    </div>
  )
}

interface StatusBadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  status: 'success' | 'warning' | 'danger'
  children: React.ReactNode
}

export function StatusBadge({
  status,
  children,
  className,
  ...props
}: StatusBadgeProps): React.ReactElement {
  return (
    <Badge
      variant={status}
      size="sm"
      className={className}
      {...props}
    >
      {children}
    </Badge>
  )
}

interface PatchBadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  version: string
}

export function PatchBadge({
  version,
  className,
  ...props
}: PatchBadgeProps): React.ReactElement {
  return (
    <Badge
      variant="patch"
      size="sm"
      className={className}
      {...props}
    >
      Patch {version}
    </Badge>
  )
}
