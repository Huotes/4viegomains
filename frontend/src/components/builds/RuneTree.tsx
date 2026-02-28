'use client'

import { Card } from '@/components/ui/Card'

interface RuneTreeProps {
  primaryTree: string
  primaryKeystone: string
  primaryRunes: string[]
  secondaryTree: string
  secondaryRunes: string[]
  shards: string[]
  compact?: boolean
}

export function RuneTree({
  primaryTree,
  primaryKeystone,
  primaryRunes,
  secondaryTree,
  secondaryRunes,
  shards,
  compact = false,
}: RuneTreeProps) {
  const treeColors: Record<string, string> = {
    Precision: 'border-l-4 border-soul-gold',
    Domination: 'border-l-4 border-danger',
    Sorcery: 'border-l-4 border-mist-cyan',
    Resolve: 'border-l-4 border-mist-green',
    Inspiration: 'border-l-4 border-ruination-purple',
  }

  return (
    <Card glow="mist" className="overflow-hidden">
      <div className={`space-y-${compact ? '4' : '6'}`}>
        {/* Primary Tree */}
        <div className={`${treeColors[primaryTree] || ''} pl-4 py-3`}>
          <h4 className="font-cinzel font-semibold text-sm text-mist-green mb-3">Primary: {primaryTree}</h4>

          <div className="space-y-2 text-sm">
            {/* Keystone */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-shadow-light/50 border-2 border-soul-gold flex items-center justify-center font-bold text-xs">
                K
              </div>
              <span className="text-gray-200">{primaryKeystone}</span>
            </div>

            {/* Primary Runes */}
            {primaryRunes.map((rune, idx) => (
              <div key={idx} className="flex items-center gap-3 ml-4">
                <div className="w-6 h-6 rounded-full bg-shadow-light/30 flex items-center justify-center text-xs text-mist-cyan">
                  ◆
                </div>
                <span className="text-gray-300 text-xs">{rune}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Secondary Tree */}
        <div className={`${treeColors[secondaryTree] || ''} pl-4 py-3`}>
          <h4 className="font-cinzel font-semibold text-sm text-mist-cyan mb-3">Secondary: {secondaryTree}</h4>

          <div className="space-y-2 text-sm">
            {secondaryRunes.map((rune, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-shadow-light/30 flex items-center justify-center text-xs text-mist-green">
                  ◆
                </div>
                <span className="text-gray-300 text-xs">{rune}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Shards */}
        <div className="pl-4 py-3 border-l-4 border-shadow-light/50">
          <h4 className="font-cinzel font-semibold text-sm text-gray-300 mb-3">Stat Shards</h4>

          <div className="flex items-center gap-3">
            {shards.map((shard, idx) => (
              <div
                key={idx}
                className="flex-1 text-center px-3 py-2 bg-shadow-light/20 rounded-md border border-shadow-light/30 hover:border-mist-cyan/50 transition-colors"
              >
                <span className="text-xs text-gray-300 block">{shard}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
