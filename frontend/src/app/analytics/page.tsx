'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { RoleComparison } from '@/components/analytics/RoleComparison'

import { EloDistribution } from '@/components/analytics/EloDistribution'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/Loading'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { useChampionStats } from '@/hooks/useChampionStats'
import { formatWinRate } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AnalyticsPage(): React.ReactElement {
  const { stats, loading, error, refetch } = useChampionStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-shadow-black to-shadow-dark">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSpinner text="Loading analytics..." quote />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-shadow-black to-shadow-dark">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <ErrorState message={error} onRetry={refetch} />
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-shadow-black to-shadow-dark">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <EmptyState title="No analytics data" message="Analytics data is being collected. Check back soon." />
        </div>
      </div>
    )
  }

  const roleComparisonData = stats.byRole
    ? Object.values(stats.byRole).map((r) => ({
        role: r.role.charAt(0).toUpperCase() + r.role.slice(1),
        winRate: r.winRate * 100,
        pickRate: r.pickRate * 100,
        banRate: r.banRate * 100,
      }))
    : []

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
              <p className="text-3xl font-bold text-mist-green">
                <AnimatedCounter value={stats.overallWinRate * 100} suffix="%" />
              </p>
            </CardContent>
          </Card>
          <Card glow="mist">
            <CardContent className="space-y-2">
              <p className="text-sm text-gray-400">Pick Rate</p>
              <p className="text-3xl font-bold text-mist-cyan">
                <AnimatedCounter value={stats.overallPickRate * 100} suffix="%" />
              </p>
            </CardContent>
          </Card>
          <Card glow="mist">
            <CardContent className="space-y-2">
              <p className="text-sm text-gray-400">Ban Rate</p>
              <p className="text-3xl font-bold text-soul-gold">
                <AnimatedCounter value={stats.overallBanRate * 100} suffix="%" />
              </p>
            </CardContent>
          </Card>
          <Card glow="mist">
            <CardContent className="space-y-2">
              <p className="text-sm text-gray-400">Patch Version</p>
              <p className="text-3xl font-bold text-ruination-purple">{stats.patchVersion || '—'}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="space-y-6">
          {roleComparisonData.length > 0 && <RoleComparison data={roleComparisonData} />}
          <EloDistribution />

          {/* Role Breakdown */}
          {stats.byRole && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.values(stats.byRole).map((roleData) => (
                <Card key={roleData.role} glow="mist">
                  <CardHeader>
                    <CardTitle className="capitalize">{roleData.role} Lane Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-400">Win Rate</span>
                        <span className="text-sm font-semibold text-mist-green">{formatWinRate(roleData.winRate)}</span>
                      </div>
                      <ProgressBar value={roleData.winRate * 100} max={100} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-400">Pick Rate</span>
                        <span className="text-sm font-semibold text-mist-cyan">{formatWinRate(roleData.pickRate)}</span>
                      </div>
                      <ProgressBar value={roleData.pickRate * 100} max={100} />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 pt-2 border-t border-shadow-light/30">
                      <span>Avg KDA: {roleData.avgKda?.toFixed(1) || '—'}</span>
                      <span>{roleData.matchCount?.toLocaleString() || 0} matches</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
