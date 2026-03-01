import { Ghost } from 'lucide-react'

interface EmptyStateProps {
  title?: string
  message?: string
  className?: string
}

export function EmptyState({
  title = 'No data available',
  message = 'Data is being collected. Check back soon.',
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-12 ${className}`}>
      <Ghost className="h-12 w-12 text-mist-green/30" />
      <p className="text-gray-300 font-semibold">{title}</p>
      <p className="text-gray-500 text-sm text-center max-w-sm">{message}</p>
    </div>
  )
}
