'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import type { EloTier } from '@/lib/types'

interface EloDistributionData {
  elo: EloTier
  winRate: number
  matchCount: number
}

interface EloDistributionProps {
  data?: EloDistributionData[]
}

export function EloDistribution({ data }: EloDistributionProps) {
  if (!data || data.length === 0) {
    return (
      <Card glow="mist">
        <CardHeader>
          <CardTitle>Win Rate by Elo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-gray-500 text-sm">
            Elo distribution data will appear once collected from ranked matches.
          </div>
        </CardContent>
      </Card>
    )
  }

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
              formatter={(value: unknown) => [
                (typeof value === 'number' ? value.toFixed(1) : value) + '%',
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
