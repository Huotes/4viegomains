'use client'

import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import type { MatchSummary } from '@/lib/types'
import { formatDuration, formatRelativeTime, getRoleIcon } from '@/lib/utils'

interface MatchHistoryProps {
  matches: MatchSummary[]
}

export function MatchHistory({ matches }: MatchHistoryProps) {
  return (
    <div className="space-y-3">
      {matches.map((match) => {
        const kda = `${match.kills}/${match.deaths}/${match.assists}`
        const kdaRatio = match.deaths === 0 ? match.kills + match.assists : (match.kills + match.assists) / match.deaths

        return (
          <Card
            key={match.matchId}
            className={`
              border-l-4
              ${match.result === 'win' ? 'border-l-success bg-success/5' : 'border-l-danger bg-danger/5'}
              p-4
              hover:shadow-lg
              transition-all
              duration-200
              cursor-pointer
            `}
          >
            <div className="flex items-center justify-between gap-4 flex-wrap">
              {/* Win/Loss & Duration */}
              <div className="flex items-center gap-3">
                <div
                  className={`
                    px-3
                    py-1
                    rounded-md
                    font-semibold
                    text-sm
                    ${match.result === 'win' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}
                  `}
                >
                  {match.result === 'win' ? 'WIN' : 'LOSS'}
                </div>
                <span className="text-sm text-gray-400">{formatDuration(match.duration)}</span>
                <span className="text-xs text-gray-500">{formatRelativeTime(match.timestamp)}</span>
              </div>

              {/* Role Badge */}
              <Badge variant="status">
                <span>{getRoleIcon(match.role)}</span>
                <span className="ml-1">{match.role.toUpperCase()}</span>
              </Badge>
            </div>

            {/* Stats Row */}
            <div className="flex items-center justify-between mt-4 gap-4 flex-wrap text-sm">
              {/* KDA */}
              <div className="flex-1 min-w-max">
                <div className="font-semibold text-white mb-1">{kda}</div>
                <div className="text-xs text-gray-400">
                  KDA Ratio: <span className="text-mist-green">{kdaRatio.toFixed(2)}</span>
                </div>
              </div>

              {/* CS */}
              <div className="flex-1 min-w-max">
                <div className="font-semibold text-white mb-1">{match.cs} CS</div>
                <div className="text-xs text-gray-400">
                  {(match.cs / (match.duration / 60)).toFixed(1)} CS/min
                </div>
              </div>

              {/* Gold */}
              <div className="flex-1 min-w-max">
                <div className="font-semibold text-soul-gold mb-1">{(match.gold / 1000).toFixed(1)}k g</div>
                <div className="text-xs text-gray-400">
                  {(match.gold / (match.duration / 60) / 60).toFixed(0)} g/s
                </div>
              </div>

              {/* Items Preview */}
              <div className="flex-1 min-w-max">
                <div className="text-xs text-gray-400">
                  {match.itemBuild.length > 0 ? `${match.itemBuild.length} items` : 'No items'}
                </div>
              </div>
            </div>
          </Card>
        )
      })}

      {matches.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p>No recent matches found</p>
        </div>
      )}
    </div>
  )
}
