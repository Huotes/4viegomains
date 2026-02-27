import type { PlayerProfile } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { TierBadge, StatBadge } from '@/components/ui/Badge'

interface PlayerCardProps {
  player: PlayerProfile
}

export function PlayerCard({ player }: PlayerCardProps): React.ReactElement {
  return (
    <Card glow="mist">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{player.name}#{player.tag}</CardTitle>
            <p className="text-sm text-gray-400 mt-1">Level {player.level}</p>
          </div>
          <div className="text-right">
            <TierBadge tier={player.rank.tier} rank={player.rank.rank} />
            <p className="text-sm text-mist-cyan mt-2">{player.rank.leaguePoints} LP</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBadge
            label="Win Rate"
            value={(player.stats.winRate * 100).toFixed(1)}
            unit="%"
          />
          <StatBadge
            label="KDA"
            value={player.stats.kda.toFixed(2)}
          />
          <StatBadge
            label="Avg CS"
            value={player.stats.avgCs.toFixed(1)}
          />
          <StatBadge
            label="OTP Score"
            value={player.otpScore.toFixed(1)}
            unit="/100"
          />
        </div>

        <div className="mt-6 pt-6 border-t border-shadow-light">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-semibold text-mist-cyan">Viego Mastery</p>
            <p className="text-sm font-mono text-soul-gold">Lv {player.viegoMastery.championLevel}</p>
          </div>
          <p className="text-xs text-gray-400">
            {player.viegoMastery.championPoints.toLocaleString()} mastery points
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
