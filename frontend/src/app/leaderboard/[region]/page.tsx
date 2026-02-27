import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge, TierBadge } from '@/components/ui/Badge'
import { SkeletonCard } from '@/components/ui/Loading'
import { REGIONS, REGION_LABELS } from '@/lib/constants'
import type { Region } from '@/lib/types'

interface LeaderboardPageProps {
  params: {
    region: string
  }
}

export function generateStaticParams() {
  return REGIONS.map((region) => ({
    region,
  }))
}

export function generateMetadata({ params }: LeaderboardPageProps) {
  return {
    title: `Viego Leaderboard — ${REGION_LABELS[params.region as Region] || params.region} — 4ViegoMains`,
    description: `Top Viego players on ${REGION_LABELS[params.region as Region]} leaderboard.`,
  }
}

export default function LeaderboardPage({
  params,
}: LeaderboardPageProps): React.ReactElement {
  const region = params.region as Region
  const isValidRegion = REGIONS.includes(region)

  if (!isValidRegion) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-shadow-black to-shadow-dark flex items-center justify-center px-4">
        <Card>
          <CardContent className="text-center">
            <p className="text-red-400 font-semibold">Invalid region: {params.region}</p>
            <p className="text-gray-400 mt-2">Valid regions: {REGIONS.join(', ')}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-shadow-black to-shadow-dark">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-cinzel text-4xl font-bold gradient-text-soul mb-2">
            {REGION_LABELS[region]} Leaderboard
          </h1>
          <p className="text-gray-400">
            Top Viego players ranked by OTP score and competitive performance.
          </p>
        </div>

        {/* Region Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {REGIONS.map((r) => (
            <button
              key={r}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                r === region
                  ? 'bg-mist-green text-shadow-black'
                  : 'bg-shadow-light text-gray-300 hover:text-mist-cyan'
              }`}
            >
              {REGION_LABELS[r]}
            </button>
          ))}
        </div>

        {/* Leaderboard Table */}
        <Card glow="mist">
          <CardHeader>
            <CardTitle>Top 50 Players</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-shadow-light">
                    <th className="text-left py-3 px-4 font-semibold text-mist-cyan">Rank</th>
                    <th className="text-left py-3 px-4 font-semibold text-mist-cyan">Player</th>
                    <th className="text-left py-3 px-4 font-semibold text-mist-cyan">Tier</th>
                    <th className="text-left py-3 px-4 font-semibold text-mist-cyan">LP</th>
                    <th className="text-left py-3 px-4 font-semibold text-mist-cyan">Win Rate</th>
                    <th className="text-left py-3 px-4 font-semibold text-mist-cyan">OTP Score</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <tr
                      key={i}
                      className="border-b border-shadow-light/50 hover:bg-shadow-light/30 transition-colors"
                    >
                      <td className="py-4 px-4 text-soul-gold font-bold">#{i + 1}</td>
                      <td colSpan={5} className="py-4 px-4">
                        <div className="h-6 bg-gradient-to-r from-shadow-medium to-shadow-light rounded animate-pulse" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 mt-8">
              <button className="px-4 py-2 rounded-lg border border-shadow-light hover:border-mist-cyan text-gray-400 hover:text-mist-cyan transition-all">
                Previous
              </button>
              <span className="text-gray-400 mx-4">Page 1 of 5</span>
              <button className="px-4 py-2 rounded-lg border border-shadow-light hover:border-mist-cyan text-gray-400 hover:text-mist-cyan transition-all">
                Next
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
