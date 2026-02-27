import type { Item } from '@/lib/types'
import { Card } from '@/components/ui/Card'

interface BuildPathProps {
  items: Item[]
  title?: string
  description?: string
}

export function BuildPath({
  items,
  title = 'Optimal Build Path',
  description,
}: BuildPathProps): React.ReactElement {
  return (
    <Card glow="mist">
      <div className="mb-6">
        <h3 className="font-cinzel font-bold text-lg mb-1">{title}</h3>
        {description && <p className="text-sm text-gray-400">{description}</p>}
      </div>

      <div className="flex flex-col gap-4">
        {items.map((item, index) => (
          <div key={item.id} className="flex items-center gap-4">
            {/* Item Index */}
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-shadow-light text-mist-cyan font-semibold text-sm">
              {index + 1}
            </div>

            {/* Item Icon */}
            <div className="h-16 w-16 rounded-lg bg-shadow-light border border-shadow-light/50 flex items-center justify-center hover:border-mist-cyan/50 transition-colors">
              <div className="text-2xl">🛡️</div>
            </div>

            {/* Item Info */}
            <div className="flex-1">
              <h4 className="font-semibold text-white mb-1">{item.name}</h4>
              <p className="text-sm text-gray-400 mb-2">{item.description}</p>
              <div className="flex gap-4 text-xs">
                <span className="text-soul-gold">Cost: {item.cost}g</span>
                <span className="text-mist-green">WR: {(item.winRate * 100).toFixed(1)}%</span>
              </div>
            </div>

            {/* Stats */}
            <div className="text-right">
              <p className="text-sm text-mist-cyan font-semibold">Pick: {(item.pickRate * 100).toFixed(1)}%</p>
              <p className="text-xs text-gray-400">{item.builds} builds</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
