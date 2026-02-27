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

const defaultData: TrendData[] = [
  { date: 'Day 1', winRate: 50.8, pickRate: 7.8 },
  { date: 'Day 2', winRate: 51.2, pickRate: 8.1 },
  { date: 'Day 3', winRate: 51.5, pickRate: 8.4 },
  { date: 'Day 4', winRate: 51.8, pickRate: 8.7 },
  { date: 'Day 5', winRate: 52.1, pickRate: 8.9 },
  { date: 'Day 6', winRate: 52.3, pickRate: 9.1 },
  { date: 'Day 7', winRate: 52.5, pickRate: 9.3 },
]

export function WinRateTrend({ data = defaultData }: WinRateTrendProps): React.ReactElement {
  return (
    <Card glow="ruination">
      <CardHeader>
        <CardTitle>Win Rate Trend (7 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1a1a24"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              stroke="#888888"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#888888"
              style={{ fontSize: '12px' }}
              domain={[48, 54]}
              label={{ value: 'Rate (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a24',
                border: '1px solid #7c4dff',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#7c4dff' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="winRate"
              stroke="#00ff87"
              strokeWidth={2}
              dot={{ fill: '#00ff87', r: 4 }}
              name="Win Rate"
            />
            <Line
              type="monotone"
              dataKey="pickRate"
              stroke="#4fc3f7"
              strokeWidth={2}
              dot={{ fill: '#4fc3f7', r: 4 }}
              name="Pick Rate"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
