import type { LeaderboardEntry } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/Card'
import { TierBadge } from '@/components/ui/Badge'
import Link from 'next/link'

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  loading?: boolean
}

export function LeaderboardTable({
  entries,
  loading = false,
}: LeaderboardTableProps): React.ReactElement {
  return (
    <Card glow="mist">
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-shadow-light bg-shadow-medium/30">
              <th className="text-left py-4 px-6 font-semibold text-mist-cyan">Rank</th>
              <th className="text-left py-4 px-6 font-semibold text-mist-cyan">Player</th>
              <th className="text-left py-4 px-6 font-semibold text-mist-cyan">Tier</th>
              <th className="text-left py-4 px-6 font-semibold text-mist-cyan">LP</th>
              <th className="text-left py-4 px-6 font-semibold text-mist-cyan">W/L</th>
              <th className="text-left py-4 px-6 font-semibold text-mist-cyan">OTP Score</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="border-b border-shadow-light/30">
                  <td colSpan={6} className="py-4 px-6">
                    <div className="h-6 bg-gradient-to-r from-shadow-medium to-shadow-light rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 px-6 text-center text-gray-400">
                  No players found
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr
                  key={entry.summonerId}
                  className="border-b border-shadow-light/30 hover:bg-shadow-light/20 transition-colors"
                >
                  <td className="py-4 px-6">
                    <span className={`font-bold text-lg ${
                      entry.rank === 1 ? 'text-soul-gold' :
                      entry.rank === 2 ? 'text-gray-300' :
                      entry.rank === 3 ? 'text-orange-600' :
                      'text-gray-500'
                    }`}>
                      #{entry.rank}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <Link
                      href={`/player/${entry.region}/${entry.name}/${entry.tag}`}
                      className="text-mist-cyan hover:text-mist-green transition-colors font-semibold"
                    >
                      {entry.name}#{entry.tag}
                    </Link>
                  </td>
                  <td className="py-4 px-6">
                    <TierBadge tier={entry.tier} rank={entry.rank_} />
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-mist-cyan font-mono font-semibold">
                      {entry.leaguePoints}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-gray-300 text-sm">
                      {entry.viegoMastery}M
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-soul-gold font-semibold">
                      {entry.otpScore.overall.toFixed(1)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
