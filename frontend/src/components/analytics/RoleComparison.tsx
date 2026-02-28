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
        <CardTitle>Performance by Role</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(0, 255, 135, 0.1)"
            />
            <XAxis
              dataKey="role"
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
            <Bar dataKey="winRate" fill="#00ff87" name="Win Rate %" radius={[8, 8, 0, 0]} />
            <Bar dataKey="pickRate" fill="#00e5ff" name="Pick Rate %" radius={[8, 8, 0, 0]} />
            <Bar dataKey="banRate" fill="#7c4dff" name="Ban Rate %" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
