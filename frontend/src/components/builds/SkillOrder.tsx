'use client'

import { Card } from '@/components/ui/Card'

interface SkillOrderProps {
  skillOrder: ('Q' | 'W' | 'E' | 'R')[]
  maxLevel?: number
}

export function SkillOrder({ skillOrder, maxLevel = 18 }: SkillOrderProps) {
  const abilityColors: Record<'Q' | 'W' | 'E' | 'R', string> = {
    Q: 'bg-mist-cyan/20 border-mist-cyan text-mist-cyan',
    W: 'bg-mist-green/20 border-mist-green text-mist-green',
    E: 'bg-ruination-purple/20 border-ruination-purple text-ruination-purple',
    R: 'bg-soul-gold/20 border-soul-gold text-soul-gold',
  }

  const abilitySymbols: Record<'Q' | 'W' | 'E' | 'R', string> = {
    Q: 'Q',
    W: 'W',
    E: 'E',
    R: 'Ult',
  }

  return (
    <Card glow="mist">
      <div className="mb-6">
        <h3 className="font-cinzel font-bold text-lg text-mist-green">Skill Leveling Order</h3>
        <p className="text-sm text-gray-400 mt-1">Level by level ability progression</p>
      </div>

      <div className="overflow-x-auto">
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${maxLevel}, minmax(0, 1fr))` }}>
          {Array.from({ length: maxLevel }).map((_, level) => {
            const ability = skillOrder[level] || '?'
            return (
              <div key={level} className="flex flex-col gap-1 items-center">
                <div className="text-xs font-semibold text-gray-400 w-full text-center">L{level + 1}</div>
                <div
                  className={`
                    w-full
                    aspect-square
                    rounded-md
                    border-2
                    font-bold
                    text-sm
                    flex
                    items-center
                    justify-center
                    transition-all
                    duration-200
                    hover:shadow-lg
                    ${abilityColors[ability] || 'bg-shadow-light border-shadow-light text-gray-500'}
                  `}
                >
                  {abilitySymbols[ability] || '?'}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-6 text-xs flex-wrap">
        {(['Q', 'W', 'E', 'R'] as const).map((ability) => (
          <div key={ability} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${abilityColors[ability].split(' ')[0]}`}></div>
            <span className="text-gray-400">{abilitySymbols[ability]}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
