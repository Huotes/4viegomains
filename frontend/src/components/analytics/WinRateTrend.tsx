'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface TrendData {
  date: string
  winRate: number
  pickRate: number
}

interface WinRateTrendProps {
  data?: TrendData[]
}

export function WinRateTrend({ data }: WinRateTrendProps): React.ReactElement {
  if (!data || data.length === 0) {
    return (
      <Card glow="ruination">
        <CardHeader>
          <CardTitle>Win Rate Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-gray-500 text-sm">
            Trend data will appear once enough matches are analyzed.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card glow="ruination">
      <CardHeader>
        <CardTitle>Win Rate Trend (7 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(0, 255, 135, 0.1)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{
                fill: 'rgba(200, 200, 200, 0.8)',
                fontSize: 12,
              }}
            />
            <YAxis
              tick={{
                fill: 'rgba(150, 150, 150, 0.6)',
                fontSize: 10,
              }}
              domain={[48, 54]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(18, 18, 24, 0.95)',
                border: '1px solid rgba(0, 255, 135, 0.3)',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#00ff87' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="winRate"
              stroke="#00ff87"
              strokeWidth={2}
              dot={{ fill: '#00ff87', r: 4 }}
              name="Win Rate %"
            />
            <Line
              type="monotone"
              dataKey="pickRate"
              stroke="#4fc3f7"
              strokeWidth={2}
              dot={{ fill: '#4fc3f7', r: 4 }}
              name="Pick Rate %"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
