'use client'

import { getItemIconURL } from '@/lib/utils'
import { Tooltip } from '@/components/ui/Tooltip'
import type { Item } from '@/lib/types'

interface ItemSlotProps {
  item?: Item
  size?: 'sm' | 'md' | 'lg'
  showCost?: boolean
  showWinRate?: boolean
  className?: string
}

export function ItemSlot({
  item,
  size = 'md',
  showCost = false,
  showWinRate = false,
  className = '',
}: ItemSlotProps) {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-16 h-16',
  }

  const tooltipContent = item ? (
    <div className="text-sm space-y-1">
      <p className="font-semibold">{item.name}</p>
      <p className="text-gray-300">{item.description}</p>
      <p className="text-mist-gold">Cost: {item.cost}g</p>
      <p className="text-mist-green">Win Rate: {(item.winRate * 100).toFixed(1)}%</p>
      <p className="text-mist-cyan">Pick Rate: {(item.pickRate * 100).toFixed(1)}%</p>
    </div>
  ) : undefined

  return (
    <Tooltip content={tooltipContent}>
      <div className={`relative ${className}`}>
        <div
          className={`
            ${sizeClasses[size]}
            rounded-lg
            border-2
            border-shadow-light/50
            bg-shadow-light/30
            backdrop-blur-sm
            flex
            items-center
            justify-center
            transition-all
            duration-200
            ${item ? 'hover:border-mist-cyan/80 hover:shadow-lg hover:shadow-mist-cyan/20' : 'border-dashed opacity-50'}
          `}
        >
          {item ? (
            <img
              src={getItemIconURL(item.id)}
              alt={item.name}
              className="w-full h-full rounded-md object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : (
            <span className="text-xs text-gray-500">-</span>
          )}
        </div>

        {item && showCost && (
          <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-soul-gold whitespace-nowrap">
            {item.cost}g
          </div>
        )}

        {item && showWinRate && (
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-mist-green whitespace-nowrap bg-shadow-dark/80 px-2 py-1 rounded">
            {(item.winRate * 100).toFixed(1)}%
          </div>
        )}
      </div>
    </Tooltip>
  )
}
