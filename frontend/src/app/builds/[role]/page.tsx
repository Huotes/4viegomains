'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge, RoleBadge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Tabs } from '@/components/ui/Tabs'
import { BuildPath } from '@/components/builds/BuildPath'
import { SkillOrder } from '@/components/builds/SkillOrder'
import { RuneTree } from '@/components/builds/RuneTree'
import { ItemSlot } from '@/components/builds/ItemSlot'
import type { Role, ViegoBuild } from '@/lib/types'
import { ROLE_LABELS, ROLES } from '@/lib/constants'
import { getMockBuilds } from '@/lib/mockData'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface BuildsPageProps {
  params: Promise<{
    role: string
  }>
}

export default function BuildsPage({
  params,
}: BuildsPageProps): React.ReactElement {
  const { role: roleParam } = params as any
  const role = roleParam as Role
  const isValidRole = ROLES.includes(role)

  const [selectedTab, setSelectedTab] = useState('overview')
  const builds = getMockBuilds(role)
  const topBuild = builds[0]

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

  const skillOrder: ('Q' | 'W' | 'E' | 'R')[] = [
    'Q', 'W', 'E', 'Q', 'R', 'Q', 'Q', 'W', 'W', 'W', 'R', 'E', 'E', 'E', 'E', 'R', 'W', 'E'
  ]

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
              {ROLE_LABELS[role]} Builds
            </h1>
            <RoleBadge role={role} />
          </div>
          <p className="text-gray-400">
            Optimized item builds and strategy recommendations for Viego in the {ROLE_LABELS[role]} role.
          </p>
        </div>

        {/* Role Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {ROLES.map((r) => (
            <Link key={r} href={`/builds/${r}`}>
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

        {/* Main Content Tabs */}
        <Tabs
          tabs={[
            { id: 'overview', label: 'Overview' },
            { id: 'builds', label: 'All Builds' },
            { id: 'runes', label: 'Runes' },
            { id: 'skills', label: 'Skill Order' },
          ]}
          activeTab={selectedTab}
          onTabChange={setSelectedTab}
          className="mb-8"
        />

        {selectedTab === 'overview' && (
          <div className="space-y-8">
            {/* Top Build */}
            {topBuild && (
              <div>
                <h2 className="font-cinzel text-2xl font-bold mb-4 text-mist-green">Recommended Build</h2>
                <BuildPath items={topBuild.items} title={topBuild.name} />
              </div>
            )}

            {/* Build Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card glow="mist">
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-400">Win Rate</p>
                  <p className="text-3xl font-bold text-mist-green">{(topBuild?.winRate || 0.52 * 100).toFixed(1)}%</p>
                  <ProgressBar value={(topBuild?.winRate || 0.52) * 100} max={100} />
                </CardContent>
              </Card>

              <Card glow="mist">
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-400">Pick Rate</p>
                  <p className="text-3xl font-bold text-mist-cyan">{(topBuild?.pickRate || 0.45 * 100).toFixed(1)}%</p>
                  <ProgressBar value={(topBuild?.pickRate || 0.45) * 100} max={100} />
                </CardContent>
              </Card>

              <Card glow="mist">
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-400">Sample Size</p>
                  <p className="text-3xl font-bold text-soul-gold">{(topBuild?.matchCount || 25000 / 1000).toFixed(0)}k</p>
                  <p className="text-xs text-gray-500">Matches analyzed</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {selectedTab === 'builds' && (
          <div className="space-y-4">
            <h2 className="font-cinzel text-2xl font-bold mb-6 text-mist-green">All Builds</h2>
            {builds.map((build, idx) => (
              <Card key={idx} glow="mist" className="hover:shadow-lg transition-all">
                <CardContent className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-max">
                    <h3 className="font-semibold text-lg mb-2">{build.name}</h3>
                    <div className="flex gap-2 flex-wrap mb-3">
                      {build.items.map((item) => (
                        <ItemSlot key={item.id} item={item} size="sm" />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Win Rate</p>
                      <p className="font-bold text-mist-green text-lg">{(build.winRate * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Pick Rate</p>
                      <p className="font-bold text-mist-cyan text-lg">{(build.pickRate * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Sample</p>
                      <p className="font-bold text-soul-gold text-lg">{(build.matchCount / 1000).toFixed(0)}k</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedTab === 'runes' && (
          <div className="space-y-6">
            <h2 className="font-cinzel text-2xl font-bold mb-6 text-mist-green">Recommended Runes</h2>
            <RuneTree
              primaryTree="Precision"
              primaryKeystone="Conqueror"
              primaryRunes={['Triumph', 'Legend: Alacrity']}
              secondaryTree="Resolve"
              secondaryRunes={['Bone Plating', 'Overgrowth']}
              shards={['AD', 'Armor', 'Magic Resist']}
            />
          </div>
        )}

        {selectedTab === 'skills' && (
          <div className="space-y-6">
            <h2 className="font-cinzel text-2xl font-bold mb-6 text-mist-green">Skill Leveling Order</h2>
            <SkillOrder skillOrder={skillOrder} maxLevel={18} />
          </div>
        )}
      </div>
    </div>
  )
}
