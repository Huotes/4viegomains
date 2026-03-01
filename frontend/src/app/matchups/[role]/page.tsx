'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { RoleBadge, Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import type { Role } from '@/lib/types'
import { ROLE_LABELS, ROLES, DIFFICULTY_LABELS } from '@/lib/constants'
import { getMockMatchups } from '@/lib/mockData'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface MatchupsPageProps {
  params: Promise<{
    role: string
  }>
}

export default function MatchupsPage({ params }: MatchupsPageProps): React.ReactElement {
  const { role: roleParam } = params as any
  const role = roleParam as Role
  const isValidRole = ROLES.includes(role)
  const [selectedTab, setSelectedTab] = useState('best')

  const matchups = getMockMatchups(role)
  const bestMatchups = matchups.filter(m => m.difficulty === 'easy').sort((a, b) => b.winRate - a.winRate)
  const worstMatchups = matchups.filter(m => m.difficulty === 'hard').sort((a, b) => a.winRate - b.winRate)

  if (!isValidRole) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-shadow-black to-shadow-dark flex items-center justify-center">
        <Card>
          <CardContent className="text-center">
            <p className="text-red-400 font-semibold">Invalid role: {roleParam}</p>
            <p className="text-gray-400 mt-2">Valid roles: {ROLES.join(', ')}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-shadow-black to-shadow-dark">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2 text-mist-cyan hover:text-mist-green mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <h1 className="font-cinzel text-4xl font-bold gradient-text-soul">
              {ROLE_LABELS[role]} Matchups
            </h1>
            <RoleBadge role={role} />
          </div>
          <p className="text-gray-400">
            Analyze how Viego fares against enemy champions in {ROLE_LABELS[role]}.
          </p>
        </div>

        <div className="flex gap-2 mb-8 flex-wrap">
          {ROLES.map((r) => (
            <Link key={r} href={`/matchups/${r}`}>
              <button className={`px-4 py-2 rounded-lg font-semibold transition-all ${role === r ? 'bg-mist-green/20 text-mist-green border border-mist-green' : 'bg-shadow-light/20 text-gray-400 border border-shadow-light/50'}`}>
                {ROLE_LABELS[r]}
              </button>
            </Link>
          ))}
        </div>

        <div className="mb-8">
          <div className="flex gap-2 mb-8 flex-wrap border-b border-mist-green/20">
            {[
              { id: 'best', label: 'Best Matchups' },
              { id: 'worst', label: 'Worst Matchups' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`px-4 py-3 font-semibold transition-all text-sm md:text-base ${
                  selectedTab === tab.id
                    ? 'text-mist-green border-b-2 border-mist-green pb-2'
                    : 'text-gray-400 hover:text-mist-cyan pb-3'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(selectedTab === 'best' ? bestMatchups : worstMatchups).map((matchup) => (
            <Card key={matchup.id} glow="mist">
              <CardContent className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{matchup.enemyChampionName}</h3>
                    <Badge variant="status">{DIFFICULTY_LABELS[matchup.difficulty]}</Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-mist-green">{(matchup.winRate * 100).toFixed(1)}%</p>
                    <p className="text-xs text-gray-400">{matchup.matchCount} games</p>
                  </div>
                </div>
                <ProgressBar value={matchup.winRate * 100} max={100} />
                <div className="bg-shadow-light/20 rounded p-3">
                  <p className="text-xs text-gray-400 mb-2">Tips:</p>
                  <ul className="text-xs space-y-1">
                    {matchup.tips.slice(0, 2).map((tip, idx) => (
                      <li key={idx} className="text-gray-300 flex gap-2">
                        <span className="text-mist-green">●</span> {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
