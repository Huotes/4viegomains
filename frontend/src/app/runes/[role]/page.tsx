'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/Loading'
import type { Role } from '@/lib/types'
import { ROLE_LABELS, ROLES } from '@/lib/constants'
import { useViegoRunes } from '@/hooks/useViegoRunes'
import { cn, formatWinRate } from '@/lib/utils'
import Link from 'next/link'
import {
  Sword, TreePine, Sparkles, Crosshair, Shield, Trophy,
} from 'lucide-react'

const ROLE_ICONS: Record<Role, React.ReactNode> = {
  top: <Sword className="h-5 w-5" />,
  jungle: <TreePine className="h-5 w-5" />,
  mid: <Sparkles className="h-5 w-5" />,
  bot: <Crosshair className="h-5 w-5" />,
  support: <Shield className="h-5 w-5" />,
}

interface RunesPageProps {
  params: Promise<{ role: string }>
}

export default function RunesPage({ params }: RunesPageProps) {
  const { role: roleParam } = params as unknown as { role: string }
  const role = (ROLES.includes(roleParam as Role) ? roleParam : 'jungle') as Role
  const [selectedPage, setSelectedPage] = useState(0)

  const { runes, loading, error, refetch } = useViegoRunes({ role })

  return (
    <div className="min-h-screen bg-gradient-to-b from-shadow-black via-shadow-dark to-shadow-black">
      <div className="border-b border-shadow-light/50 bg-shadow-dark/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="font-cinzel text-3xl md:text-4xl font-bold gradient-text-soul mb-2">Viego Runes</h1>
          <p className="text-gray-400">Optimal rune configurations for maximum effectiveness</p>
        </div>
      </div>

      <div className="border-b border-shadow-light/30 bg-shadow-dark/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 overflow-x-auto scrollbar-none py-2">
            {ROLES.map((r) => (
              <Link key={r} href={`/runes/${r}`} className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all',
                r === role ? 'bg-mist-green/10 text-mist-green border border-mist-green/30' : 'text-gray-400 hover:text-white hover:bg-shadow-light/30 border border-transparent'
              )}>
                {ROLE_ICONS[r]}
                <span className="hidden sm:inline">{ROLE_LABELS[r]}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <LoadingSpinner text="Loading rune data..." quote />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : runes.length === 0 ? (
          <EmptyState title="No rune data available" message={`No rune configurations found for ${ROLE_LABELS[role]} yet.`} />
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              {runes.map((runePage, idx) => (
                <button key={runePage.id} onClick={() => setSelectedPage(idx)} className={cn(
                  'flex-1 rounded-lg border p-4 text-left transition-all',
                  idx === selectedPage ? 'border-mist-green/50 bg-mist-green/5' : 'border-shadow-light bg-shadow-dark/40 hover:border-shadow-light/80'
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-white">{runePage.primary?.name} / {runePage.secondary?.name}</span>
                    {idx === 0 && <Trophy className="h-4 w-4 text-soul-gold" />}
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-mist-green font-mono font-bold">{formatWinRate(runePage.winRate)}</span>
                    <span className="text-gray-500">{formatWinRate(runePage.pickRate)} pick</span>
                    <span className="text-gray-500">{runePage.matchCount.toLocaleString()} games</span>
                  </div>
                </button>
              ))}
            </div>

            {runes[selectedPage] && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card glow="mist">
                  <CardHeader>
                    <CardTitle>{runes[selectedPage].primary?.name || 'Primary'} (Primary)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-400">{runes[selectedPage].primary?.description}</p>
                    {runes[selectedPage].primary?.runes?.map((rune) => (
                      <div key={rune.id} className="flex items-center gap-3 px-3 py-2 rounded-lg border border-mist-green/30 bg-mist-green/5">
                        <span className="text-mist-green text-sm font-semibold">{rune.name}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <div className="space-y-8">
                  <Card glow="ruination">
                    <CardHeader>
                      <CardTitle>{runes[selectedPage].secondary?.name || 'Secondary'} (Secondary)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-400">{runes[selectedPage].secondary?.description}</p>
                      {runes[selectedPage].secondary?.runes?.map((rune) => (
                        <div key={rune.id} className="flex items-center gap-3 px-3 py-2 rounded-lg border border-ruination-purple/30 bg-ruination-purple/5">
                          <span className="text-ruination-purple text-sm font-semibold">{rune.name}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {runes[selectedPage].shards?.length > 0 && (
                    <Card glow="none">
                      <CardHeader><CardTitle className="text-lg">Stat Shards</CardTitle></CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {runes[selectedPage].shards.map((shard) => (
                            <span key={shard.id} className="px-3 py-1.5 rounded-full border border-soul-gold/50 bg-soul-gold/10 text-soul-gold text-xs">
                              {shard.name}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {runes.length > 1 && (
              <Card glow="none" className="mt-8">
                <CardHeader><CardTitle className="text-lg">Rune Page Comparison</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-shadow-light/50">
                          <th className="text-left py-3 text-gray-500 font-normal">Rune Setup</th>
                          <th className="text-center py-3 text-gray-500 font-normal">Win Rate</th>
                          <th className="text-center py-3 text-gray-500 font-normal">Pick Rate</th>
                          <th className="text-center py-3 text-gray-500 font-normal hidden sm:table-cell">Matches</th>
                        </tr>
                      </thead>
                      <tbody>
                        {runes.map((rp, idx) => (
                          <tr key={rp.id} className={cn('border-b border-shadow-light/20 cursor-pointer transition-colors', idx === selectedPage ? 'bg-mist-green/5' : 'hover:bg-shadow-light/20')} onClick={() => setSelectedPage(idx)}>
                            <td className="py-3 font-semibold text-white">
                              <div className="flex items-center gap-2">
                                {idx === 0 && <Trophy className="h-3.5 w-3.5 text-soul-gold" />}
                                {rp.primary?.name} / {rp.secondary?.name}
                              </div>
                            </td>
                            <td className="py-3 text-center font-mono font-bold text-mist-green">{formatWinRate(rp.winRate)}</td>
                            <td className="py-3 text-center font-mono text-mist-cyan">{formatWinRate(rp.pickRate)}</td>
                            <td className="py-3 text-center text-gray-400 hidden sm:table-cell">{rp.matchCount.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}
