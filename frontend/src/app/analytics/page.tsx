'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { RoleComparison } from '@/components/analytics/RoleComparison'
import { WinRateTrend } from '@/components/analytics/WinRateTrend'
import { EloDistribution } from '@/components/analytics/EloDistribution'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { getMockMetaStats, getMockMetaTrends } from '@/lib/mockData'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AnalyticsPage(): React.ReactElement {
  const metaStats = getMockMetaStats()
  const trends = getMockMetaTrends()

  const roleComparisonData = Object.values(metaStats.byRole).map((r) => ({
    role: r.role.charAt(0).toUpperCase() + r.role.slice(1),
    winRate: r.winRate * 100,
    pickRate: r.pickRate * 100,
    banRate: r.banRate * 100,
  }))

  const trendData = trends.map((t) => ({
    date: t.date.split('-')[2],
    winRate: t.winRate * 100,
    pickRate: t.pickRate * 100,
  }))

  return (
    <div className="min-h-screen bg-gradient-to-b from-shadow-black to-shadow-dark">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2 text-mist-cyan hover:text-mist-green mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <h1 className="font-cinzel text-4xl font-bold gradient-text-soul mb-2">Viego Analytics</h1>
          <p className="text-gray-400">Deep dive into Viego's meta statistics and performance trends</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card glow="mist">
            <CardContent className="space-y-2">
              <p className="text-sm text-gray-400">Overall Win Rate</p>
              <p className="text-3xl font-bold text-mist-green">{(metaStats.overallWinRate * 100).toFixed(1)}%</p>
            </CardContent>
          </Card>
          <Card glow="mist">
            <CardContent className="space-y-2">
              <p className="text-sm text-gray-400">Pick Rate</p>
              <p className="text-3xl font-bold text-mist-cyan">{(metaStats.overallPickRate * 100).toFixed(1)}%</p>
            </CardContent>
          </Card>
          <Card glow="mist">
            <CardContent className="space-y-2">
              <p className="text-sm text-gray-400">Ban Rate</p>
              <p className="text-3xl font-bold text-soul-gold">{(metaStats.overallBanRate * 100).toFixed(1)}%</p>
            </CardContent>
          </Card>
          <Card glow="mist">
            <CardContent className="space-y-2">
              <p className="text-sm text-gray-400">Patch Version</p>
              <p className="text-3xl font-bold text-ruination-purple">{metaStats.patchVersion}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="space-y-6">
          <RoleComparison data={roleComparisonData} />
          <WinRateTrend data={trendData} />
          <EloDistribution />

          {/* Item & Rune Efficiency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card glow="mist">
              <CardHeader>
                <CardTitle>Top Items by Pick Rate</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'Trinity Force', pickRate: 85 },
                  { name: 'Black Cleaver', pickRate: 72 },
                  { name: 'Spirit Visage', pickRate: 68 },
                  { name: 'Void Staff', pickRate: 62 },
                ].map((item) => (
                  <div key={item.name}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-300">{item.name}</span>
                      <span className="text-sm font-semibold text-mist-green">{item.pickRate}%</span>
                    </div>
                    <ProgressBar value={item.pickRate} max={100} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card glow="mist">
              <CardHeader>
                <CardTitle>Top Runes by Pick Rate</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'Conqueror', pickRate: 88 },
                  { name: 'Triumph', pickRate: 78 },
                  { name: 'Legend: Alacrity', pickRate: 75 },
                  { name: 'Bone Plating', pickRate: 68 },
                ].map((rune) => (
                  <div key={rune.name}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-300">{rune.name}</span>
                      <span className="text-sm font-semibold text-mist-cyan">{rune.pickRate}%</span>
                    </div>
                    <ProgressBar value={rune.pickRate} max={100} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
