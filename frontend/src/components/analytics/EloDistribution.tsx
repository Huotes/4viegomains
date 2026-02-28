'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { ELO_TIER_LABELS, TIER_COLORS } from '@/lib/constants'
import type { EloTier } from '@/lib/types'

interface EloDistributionData {
  elo: EloTier
  winRate: number
  matchCount: number
}

interface EloDistributionProps {
  data?: EloDistributionData[]
}

const defaultData: EloDistributionData[] = [
  { elo: 'IRON', winRate: 45.2, matchCount: 5000 },
  { elo: 'BRONZE', winRate: 47.8, matchCount: 8000 },
  { elo: 'SILVER', winRate: 49.5, matchCount: 15000 },
  { elo: 'GOLD', winRate: 51.2, matchCount: 25000 },
  { elo: 'PLATINUM', winRate: 52.8, matchCount: 18000 },
  { elo: 'DIAMOND', winRate: 54.1, matchCount: 12000 },
  { elo: 'MASTER', winRate: 55.5, matchCount: 3000 },
  { elo: 'GRANDMASTER', winRate: 56.2, matchCount: 800 },
  { elo: 'CHALLENGER', winRate: 57.8, matchCount: 200 },
]

export function EloDistribution({ data = defaultData }: EloDistributionProps) {
  return (
    <Card glow="mist">
      <CardHeader>
        <CardTitle>Win Rate by Elo</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(0, 255, 135, 0.1)"
            />
            <XAxis
              dataKey="elo"
              tick={{
                fill: 'rgba(200, 200, 200, 0.8)',
                fontSize: 11,
              }}
            />
            <YAxis
              tick={{
                fill: 'rgba(150, 150, 150, 0.6)',
                fontSize: 10,
              }}
              domain={[40, 60]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(18, 18, 24, 0.95)',
                border: '1px solid rgba(0, 255, 135, 0.3)',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#00ff87' }}
              formatter={(value: number) => [
                value.toFixed(1) + '%',
                'Win Rate',
              ]}
            />
            <Bar
              dataKey="winRate"
              fill="#00ff87"
              radius={[8, 8, 0, 0]}
              name="Win Rate"
            />
          </BarChart>
        </ResponsiveContainer>

        {/* Elo Summary */}
        <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
          <div className="bg-shadow-light/20 rounded-lg p-3">
            <p className="text-gray-400 text-xs mb-1">Most Played</p>
            <p className="font-semibold text-mist-green">
              {data.reduce((prev, curr) =>
                curr.matchCount > prev.matchCount ? curr : prev
              ).elo}
            </p>
          </div>
          <div className="bg-shadow-light/20 rounded-lg p-3">
            <p className="text-gray-400 text-xs mb-1">Best WR</p>
            <p className="font-semibold text-soul-gold">
              {data.reduce((prev, curr) =>
                curr.winRate > prev.winRate ? curr : prev
              ).winRate.toFixed(1)}%
            </p>
          </div>
          <div className="bg-shadow-light/20 rounded-lg p-3">
            <p className="text-gray-400 text-xs mb-1">Total Games</p>
            <p className="font-semibold text-mist-cyan">
              {(data.reduce((sum, d) => sum + d.matchCount, 0) / 1000).toFixed(1)}k
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
