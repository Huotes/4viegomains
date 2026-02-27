import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge, TierBadge, StatBadge } from '@/components/ui/Badge'
import { SkeletonCard } from '@/components/ui/Loading'
import { REGIONS } from '@/lib/constants'
import type { Region } from '@/lib/types'

interface PlayerPageProps {
  params: {
    region: string
    name: string
    tag: string
  }
}

export function generateMetadata({ params }: PlayerPageProps) {
  return {
    title: `${params.name}#${params.tag} — Viego Stats — 4ViegoMains`,
    description: `View detailed Viego statistics and match history for player ${params.name}#${params.tag} on ${params.region}.`,
  }
}

export default function PlayerPage({
  params,
}: PlayerPageProps): React.ReactElement {
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

  const playerName = `${decodeURIComponent(params.name)}#${decodeURIComponent(params.tag)}`

  return (
    <div className="min-h-screen bg-gradient-to-b from-shadow-black to-shadow-dark">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Player Header */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="font-cinzel text-4xl font-bold gradient-text-soul mb-4">
                {playerName}
              </h1>
              <div className="flex flex-wrap gap-3">
                <TierBadge tier="PLATINUM" rank="II" />
                <Badge variant="default">732 LP</Badge>
                <Badge variant="success">56.2% Win Rate</Badge>
              </div>
            </div>
            <Card glow="mist" className="min-w-fit">
              <CardContent>
                <div className="flex flex-col gap-4">
                  <StatBadge label="Total Mastery" value="612,458" />
                  <StatBadge label="Viego Wins" value="187" />
                  <StatBadge label="OTP Score" value="94.2" unit="/100" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card glow="ruination">
            <CardHeader>
              <CardTitle>This Season</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SkeletonCard count={2} />
            </CardContent>
          </Card>

          <Card glow="mist">
            <CardHeader>
              <CardTitle>Viego Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SkeletonCard count={2} />
            </CardContent>
          </Card>
        </div>

        {/* Match History */}
        <Card glow="mist">
          <CardHeader>
            <CardTitle>Recent Match History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SkeletonCard count={5} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
