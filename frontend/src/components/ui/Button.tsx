import { cn } from '@/lib/utils'
import Link from 'next/link'

interface ButtonBaseProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'link'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  icon?: React.ReactNode
  loading?: boolean
  className?: string
}

interface ButtonProps extends ButtonBaseProps, React.ButtonHTMLAttributes<HTMLButtonElement> {}

interface LinkButtonProps extends ButtonBaseProps {
  href: string
  target?: string
  rel?: string
}

const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mist-green'

const variantStyles = {
  primary: 'bg-gradient-to-r from-mist-green to-mist-cyan text-shadow-black hover:shadow-lg mist-glow-hover active:scale-95',
  secondary: 'bg-shadow-medium border border-ruination-purple text-ruination-purple hover:bg-ruination-purple/20 hover:border-ruination-purple/70 ruination-glow-hover',
  ghost: 'text-mist-cyan hover:bg-shadow-light/40 border border-transparent hover:border-mist-cyan/50',
  outline: 'border-2 border-mist-green text-mist-green hover:bg-mist-green/10 mist-glow-hover',
  danger: 'bg-danger text-white hover:bg-red-700 active:scale-95',
  link: 'text-mist-cyan hover:text-mist-green underline hover:no-underline',
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
  icon: 'p-2 h-10 w-10',
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled,
  ...props
}: ButtonProps): React.ReactElement {
  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {icon && !loading && icon}
      {children}
    </button>
  )
}

export function LinkButton({
  children,
  className,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  href,
  target,
  rel,
}: LinkButtonProps): React.ReactElement {
  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {icon && !loading && icon}
      {children}
    </Link>
  )
}
