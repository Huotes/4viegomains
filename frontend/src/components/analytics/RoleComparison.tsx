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

export function RoleComparison({ data }: RoleComparisonProps): React.ReactElement {
  if (!data || data.length === 0) {
    return (
      <Card glow="mist">
        <CardHeader>
          <CardTitle>Performance by Role</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-gray-500 text-sm">
            Role comparison data will appear once matches are analyzed.
          </div>
        </CardContent>
      </Card>
    )
  }

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
