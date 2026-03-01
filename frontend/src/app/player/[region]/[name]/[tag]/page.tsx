'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { MatchHistory } from '@/components/player/MatchHistory'
import { PerformanceRadar } from '@/components/player/PerformanceRadar'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/Loading'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import type { PlayerProfile, Region } from '@/lib/types'
import { getPlayerProfile, getCachedData, setCachedData } from '@/lib/api'
import { CACHE_TTL, REGIONS } from '@/lib/constants'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface PlayerPageProps {
  params: Promise<{ region: string; name: string; tag: string }>
}

export default function PlayerPage({ params }: PlayerPageProps): React.ReactElement {
  const { region: regionParam, name: nameParam, tag: tagParam } = params as any
  const region = regionParam as Region
  const name = decodeURIComponent(nameParam)
  const tag = decodeURIComponent(tagParam)

  const [player, setPlayer] = useState<PlayerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPlayer = useCallback(async () => {
    if (!REGIONS.includes(region)) {
      setError(`Invalid region: ${region}`)
      setLoading(false)
      return
    }

    const cacheKey = `player:${region}:${name}:${tag}`
    const cached = getCachedData<PlayerProfile>(cacheKey)
    if (cached) {
      setPlayer(cached)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await getPlayerProfile(name, tag, region)
      if (response.success && response.data) {
        setPlayer(response.data)
        setCachedData(cacheKey, response.data, CACHE_TTL.playerProfile)
      } else {
        throw new Error(response.error || 'Player not found')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      setPlayer(null)
    } finally {
      setLoading(false)
    }
  }, [region, name, tag])

  useEffect(() => {
    fetchPlayer()
  }, [fetchPlayer])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-shadow-black to-shadow-dark">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSpinner text={`Loading ${name}#${tag}...`} quote />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-shadow-black to-shadow-dark">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/" className="flex items-center gap-2 text-mist-cyan hover:text-mist-green mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <ErrorState message={error} onRetry={fetchPlayer} />
        </div>
      </div>
    )
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-shadow-black to-shadow-dark">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
          <EmptyState title="Player not found" message={`Could not find ${name}#${tag} in ${region.toUpperCase()}.`} />
        </div>
      </div>
    )
  }

  const performanceData = player.performanceIndex ? [
    { category: 'Laning', value: player.performanceIndex.laning },
    { category: 'Teamfight', value: player.performanceIndex.teamfight },
    { category: 'Macro', value: player.performanceIndex.macroplay },
    { category: 'CS', value: player.performanceIndex.cs },
    { category: 'KDA', value: player.performanceIndex.kda },
    { category: 'Overall', value: player.performanceIndex.overall },
  ] : []

  return (
    <div className="min-h-screen bg-gradient-to-b from-shadow-black to-shadow-dark">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/" className="flex items-center gap-2 text-mist-cyan hover:text-mist-green mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        {/* Player Header */}
        <div className="mb-8 flex items-start gap-6 flex-wrap">
          <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-mist-green to-mist-cyan p-1">
            <div className="w-full h-full rounded-lg bg-shadow-dark flex items-center justify-center text-4xl">
              {player.name.charAt(0)}
            </div>
          </div>
          <div className="flex-1">
            <h1 className="font-cinzel text-4xl font-bold mb-2">{player.name}#{player.tag}</h1>
            <div className="flex items-center gap-4 flex-wrap mb-4">
              {player.rank && (
                <>
                  <Badge variant="default">{player.rank.tier} {player.rank.rank}</Badge>
                  <span className="text-mist-cyan font-semibold">{player.rank.leaguePoints} LP</span>
                  <span className="text-gray-400">{player.rank.wins}W {player.rank.losses}L</span>
                </>
              )}
            </div>
            <div className="text-sm text-gray-400">
              <p>Level {player.level}</p>
              <p>Region: {player.region?.toUpperCase()}</p>
            </div>
          </div>
        </div>

        {/* Mastery & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card glow="mist">
            <CardContent className="space-y-2">
              <p className="text-sm text-gray-400">Mastery Level</p>
              <p className="text-3xl font-bold text-soul-gold">{player.viegoMastery?.championLevel ?? '—'}</p>
              <p className="text-xs text-gray-500">{player.viegoMastery?.championPoints ? `${(player.viegoMastery.championPoints / 1000).toFixed(0)}k points` : ''}</p>
            </CardContent>
          </Card>
          <Card glow="mist">
            <CardContent className="space-y-2">
              <p className="text-sm text-gray-400">Win Rate</p>
              <p className="text-3xl font-bold text-mist-green">
                {player.stats?.winRate != null ? <AnimatedCounter value={player.stats.winRate * 100} suffix="%" /> : '—'}
              </p>
            </CardContent>
          </Card>
          <Card glow="mist">
            <CardContent className="space-y-2">
              <p className="text-sm text-gray-400">Average KDA</p>
              <p className="text-3xl font-bold text-mist-cyan">
                {player.stats?.kda != null ? <AnimatedCounter value={player.stats.kda} decimals={1} /> : '—'}
              </p>
            </CardContent>
          </Card>
          <Card glow="mist">
            <CardContent className="space-y-2">
              <p className="text-sm text-gray-400">OTP Score</p>
              <p className="text-3xl font-bold text-ruination-purple">
                {player.otpScore != null ? <AnimatedCounter value={player.otpScore} decimals={0} /> : '—'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Performance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {performanceData.length > 0 && (
            <Card glow="ruination">
              <CardHeader><CardTitle>Performance Index</CardTitle></CardHeader>
              <CardContent><PerformanceRadar data={performanceData} height={300} /></CardContent>
            </Card>
          )}

          {player.stats && (
            <Card glow="mist">
              <CardHeader><CardTitle>Average Statistics</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-400">CS/min</span>
                    <span className="text-sm font-semibold text-mist-cyan">{player.stats.avgCs}</span>
                  </div>
                  <ProgressBar value={(player.stats.avgCs / 400) * 100} max={100} />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-400">Gold/min</span>
                    <span className="text-sm font-semibold text-soul-gold">{(player.stats.avgGold / 100).toFixed(0)} (×100)</span>
                  </div>
                  <ProgressBar value={(player.stats.avgGold / 20000) * 100} max={100} />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-400">Damage/game</span>
                    <span className="text-sm font-semibold text-red-400">{(player.stats.avgDamage / 1000).toFixed(1)}k</span>
                  </div>
                  <ProgressBar value={(player.stats.avgDamage / 25000) * 100} max={100} />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-400">Damage taken/game</span>
                    <span className="text-sm font-semibold text-yellow-400">{(player.stats.avgDamageTaken / 1000).toFixed(1)}k</span>
                  </div>
                  <ProgressBar value={(player.stats.avgDamageTaken / 30000) * 100} max={100} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Match History */}
        {player.recentMatches?.length > 0 && (
          <Card glow="mist">
            <CardHeader><CardTitle>Recent Matches</CardTitle></CardHeader>
            <CardContent><MatchHistory matches={player.recentMatches} /></CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
