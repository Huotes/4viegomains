'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { RoleBadge } from '@/components/ui/Badge'
import { Tabs } from '@/components/ui/Tabs'
import { RuneTree } from '@/components/builds/RuneTree'
import { ProgressBar } from '@/components/ui/ProgressBar'
import type { Role } from '@/lib/types'
import { ROLE_LABELS, ROLES } from '@/lib/constants'
import { getMockRunes } from '@/lib/mockData'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface RunesPageProps {
  params: Promise<{
    role: string
  }>
}

export default function RunesPage({ params }: RunesPageProps): React.ReactElement {
  const { role: roleParam } = params as any
  const role = roleParam as Role
  const isValidRole = ROLES.includes(role)
  const [selectedTab, setSelectedTab] = useState('recommended')

  const runes = getMockRunes(role)
  const topRunes = runes[0]

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
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2 text-mist-cyan hover:text-mist-green mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <h1 className="font-cinzel text-4xl font-bold gradient-text-soul">
              {ROLE_LABELS[role]} Runes
            </h1>
            <RoleBadge role={role} />
          </div>
          <p className="text-gray-400">
            Optimal rune configurations and secondary tree selections for Viego in {ROLE_LABELS[role]}.
          </p>
        </div>

        {/* Role Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {ROLES.map((r) => (
            <Link key={r} href={`/runes/${r}`}>
              <button
                className={`
                  px-4 py-2 rounded-lg font-semibold transition-all
                  ${role === r
                    ? 'bg-mist-green/20 text-mist-green border border-mist-green'
                    : 'bg-shadow-light/20 text-gray-400 border border-shadow-light/50 hover:border-mist-cyan/50'
                  }
                `}
              >
                {ROLE_LABELS[r]}
              </button>
            </Link>
          ))}
        </div>

        {/* Content Tabs */}
        <Tabs
          tabs={[
            { id: 'recommended', label: 'Recommended' },
            { id: 'alternatives', label: 'Alternatives' },
            { id: 'statistics', label: 'Statistics' },
          ]}
          activeTab={selectedTab}
          onTabChange={setSelectedTab}
          className="mb-8"
        />

        {selectedTab === 'recommended' && topRunes && (
          <div className="space-y-8">
            <RuneTree
              primaryTree={topRunes.primary.name}
              primaryKeystone="Conqueror"
              primaryRunes={['Triumph', 'Legend: Alacrity', 'Last Stand']}
              secondaryTree={topRunes.secondary.name}
              secondaryRunes={['Bone Plating', 'Overgrowth']}
              shards={['Attack Speed', 'Armor', 'Magic Resist']}
            />

            {/* Win Rate Card */}
            <Card glow="mist">
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Win Rate</p>
                    <p className="text-3xl font-bold text-mist-green mb-2">{(topRunes.winRate * 100).toFixed(1)}%</p>
                    <ProgressBar value={topRunes.winRate * 100} max={100} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Pick Rate</p>
                    <p className="text-3xl font-bold text-mist-cyan mb-2">{(topRunes.pickRate * 100).toFixed(1)}%</p>
                    <ProgressBar value={topRunes.pickRate * 100} max={100} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Sample Size</p>
                    <p className="text-3xl font-bold text-soul-gold">{(topRunes.matchCount / 1000).toFixed(0)}k</p>
                    <p className="text-xs text-gray-500 mt-2">Matches analyzed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedTab === 'alternatives' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {[
                {
                  name: 'Electrocute',
                  primary: 'Domination',
                  secondary: 'Precision',
                  winRate: 0.49,
                  pickRate: 0.15,
                },
                {
                  name: 'Phase Rush',
                  primary: 'Sorcery',
                  secondary: 'Precision',
                  winRate: 0.48,
                  pickRate: 0.12,
                },
              ].map((alt, idx) => (
                <Card key={idx} glow="ruination">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{alt.name}</span>
                      <span className="text-sm font-normal text-mist-green">{(alt.winRate * 100).toFixed(1)}% WR</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-sm">
                      <div>
                        <p className="text-gray-400 mb-1">Primary</p>
                        <p className="font-semibold">{alt.primary}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-1">Secondary</p>
                        <p className="font-semibold">{alt.secondary}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-1">Pick Rate</p>
                        <p className="font-semibold">{(alt.pickRate * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'statistics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card glow="mist">
              <CardHeader>
                <CardTitle>Primary Tree Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {['Precision', 'Domination', 'Sorcery'].map((tree) => (
                  <div key={tree}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-400">{tree}</span>
                      <span className="text-sm font-semibold text-mist-green">{Math.floor(Math.random() * 30 + 50)}%</span>
                    </div>
                    <ProgressBar value={Math.random() * 100} max={100} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card glow="mist">
              <CardHeader>
                <CardTitle>Keystones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {['Conqueror', 'Electrocute', 'Phase Rush'].map((keystone) => (
                  <div key={keystone}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-400">{keystone}</span>
                      <span className="text-sm font-semibold text-mist-cyan">{Math.floor(Math.random() * 40 + 40)}%</span>
                    </div>
                    <ProgressBar value={Math.random() * 100} max={100} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
