'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface RoleComparisonData {
  role: string
  winRate: number
  pickRate: number
  banRate: number
}

interface RoleComparisonProps {
  data?: RoleComparisonData[]
}

const defaultData: RoleComparisonData[] = [
  { role: 'Top', winRate: 51.8, pickRate: 8.5, banRate: 12.3 },
  { role: 'Jungle', winRate: 52.1, pickRate: 7.9, banRate: 11.8 },
  { role: 'Mid', winRate: 51.5, pickRate: 9.2, banRate: 13.1 },
  { role: 'Bot', winRate: 50.9, pickRate: 8.1, banRate: 11.5 },
  { role: 'Support', winRate: 52.3, pickRate: 8.3, banRate: 12.0 },
]

export function RoleComparison({ data = defaultData }: RoleComparisonProps): React.ReactElement {
  return (
    <Card glow="mist">
      <CardHeader>
        <CardTitle>Win Rate by Role</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1a1a24"
              vertical={false}
            />
            <XAxis
              dataKey="role"
              stroke="#888888"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#888888"
              style={{ fontSize: '12px' }}
              domain={[0, 60]}
              label={{ value: 'Rate (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a24',
                border: '1px solid #00ff87',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#00ff87' }}
            />
            <Legend />
            <Bar dataKey="winRate" fill="#00ff87" name="Win Rate" />
            <Bar dataKey="pickRate" fill="#00e5ff" name="Pick Rate" />
            <Bar dataKey="banRate" fill="#7c4dff" name="Ban Rate" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
