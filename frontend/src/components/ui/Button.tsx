import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  loading?: boolean
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
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed gap-2'

  const variantStyles = {
    primary: 'bg-gradient-to-r from-mist-green to-mist-cyan text-shadow-black hover:shadow-lg mist-glow-hover',
    secondary: 'bg-shadow-medium border border-ruination-purple text-ruination-purple hover:bg-ruination-purple/10 border-ruination-hover',
    ghost: 'text-mist-cyan hover:bg-shadow-medium border border-transparent hover:border-mist-cyan/50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm rounded',
    md: 'px-4 py-2 text-base rounded-lg',
    lg: 'px-6 py-3 text-lg rounded-lg',
  }

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
