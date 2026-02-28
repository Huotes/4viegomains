'use client'

import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'

interface PerformanceRadarProps {
  data: {
    category: string
    value: number
  }[]
  height?: number
}

export function PerformanceRadar({ data, height = 300 }: PerformanceRadarProps) {
  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={data} margin={{ top: 10, right: 30, left: 30, bottom: 30 }}>
          <PolarGrid stroke="rgba(0, 255, 135, 0.1)" />
          <PolarAngleAxis
            dataKey="category"
            tick={{
              fill: 'rgba(200, 200, 200, 0.8)',
              fontSize: 12,
            }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{
              fill: 'rgba(150, 150, 150, 0.6)',
              fontSize: 10,
            }}
          />
          <Radar
            name="Performance"
            dataKey="value"
            stroke="#00ff87"
            fill="#00ff87"
            fillOpacity={0.25}
            dot={{
              fill: '#00ff87',
              r: 4,
            }}
            activeDot={{
              r: 6,
              fill: '#00ff87',
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
