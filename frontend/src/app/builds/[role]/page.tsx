'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import type { Role } from '@/lib/types'
import { ROLE_LABELS, ROLES } from '@/lib/constants'
import { getMockBuilds } from '@/lib/mockData'
import { cn, formatWinRate, getItemIconURL } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import {
  Sword, TreePine, Sparkles, Crosshair, Shield,
  ArrowRight, Trophy,
} from 'lucide-react'

const ROLE_ICONS: Record<Role, React.ReactNode> = {
  top: <Sword className="h-5 w-5" />,
  jungle: <TreePine className="h-5 w-5" />,
  mid: <Sparkles className="h-5 w-5" />,
  bot: <Crosshair className="h-5 w-5" />,
  support: <Shield className="h-5 w-5" />,
}

// Skill order mock data
const SKILL_ORDER = {
  top:     ['Q','W','E','Q','Q','R','Q','E','Q','E','R','E','E','W','W','R','W','W'],
  jungle:  ['Q','W','E','Q','Q','R','Q','W','Q','W','R','W','W','E','E','R','E','E'],
  mid:     ['Q','E','W','Q','Q','R','Q','E','Q','E','R','E','E','W','W','R','W','W'],
  bot:     ['Q','E','W','Q','Q','R','Q','E','Q','E','R','E','E','W','W','R','W','W'],
  support: ['W','Q','E','W','W','R','W','Q','W','Q','R','Q','Q','E','E','R','E','E'],
}

const SKILL_COLORS: Record<string, string> = {
  Q: 'bg-cyan-500/80 text-white',
  W: 'bg-emerald-500/80 text-white',
  E: 'bg-purple-500/80 text-white',
  R: 'bg-amber-500/80 text-white',
}

const STARTING_ITEMS: Record<Role, { id: number; name: string }[]> = {
  top: [{ id: 1055, name: "Long Sword" }, { id: 2003, name: "Health Potion" }, { id: 2003, name: "Health Potion" }],
  jungle: [{ id: 1103, name: "Gustwalker Hatchling" }, { id: 2003, name: "Health Potion" }],
  mid: [{ id: 1055, name: "Long Sword" }, { id: 2031, name: "Refillable Potion" }],
  bot: [{ id: 1055, name: "Long Sword" }, { id: 2003, name: "Health Potion" }, { id: 2003, name: "Health Potion" }],
  support: [{ id: 3862, name: "Steel Shoulderguards" }, { id: 2003, name: "Health Potion" }],
}

const SUMMONER_SPELLS: Record<Role, string[]> = {
  top: ['Flash', 'Teleport'],
  jungle: ['Flash', 'Smite'],
  mid: ['Flash', 'Ignite'],
  bot: ['Flash', 'Heal'],
  support: ['Flash', 'Ignite'],
}

interface BuildsPageProps {
  params: Promise<{ role: string }>
}

export default function BuildsPage({ params }: BuildsPageProps) {
  const { role: roleParam } = params as unknown as { role: string }
  const role = (ROLES.includes(roleParam as Role) ? roleParam : 'jungle') as Role
  const [selectedElo, setSelectedElo] = useState('all')
  const builds = getMockBuilds(role)
  const skillOrder = SKILL_ORDER[role]

  return (
    <div className="min-h-screen bg-gradient-to-b from-shadow-black via-shadow-dark to-shadow-black">
      {/* Header */}
      <div className="border-b border-shadow-light/50 bg-shadow-dark/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="font-cinzel text-3xl md:text-4xl font-bold gradient-text-soul mb-2">
            Viego Builds
          </h1>
          <p className="text-gray-400">
            Optimized item builds analyzed from {builds.reduce((acc, b) => acc + b.matchCount, 0).toLocaleString()}+ ranked matches
          </p>
        </div>
      </div>

      {/* Role Tabs */}
      <div className="border-b border-shadow-light/30 bg-shadow-dark/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 overflow-x-auto scrollbar-none py-2" aria-label="Role tabs">
            {ROLES.map((r) => (
              <Link
                key={r}
                href={`/builds/${r}`}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all',
                  r === role
                    ? 'bg-mist-green/10 text-mist-green border border-mist-green/30'
                    : 'text-gray-400 hover:text-white hover:bg-shadow-light/30 border border-transparent'
                )}
              >
                {ROLE_ICONS[r]}
                <span className="hidden sm:inline">{ROLE_LABELS[r]}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Filters */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <Card glow="none" className="sticky top-20">
              <CardContent>
                <h3 className="font-cinzel font-bold text-sm text-gray-300 uppercase tracking-wider mb-3">Filters</h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Elo Tier</label>
                    <select
                      value={selectedElo}
                      onChange={(e) => setSelectedElo(e.target.value)}
                      className="w-full bg-shadow-medium border border-shadow-light rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-mist-green/50"
                    >
                      <option value="all">All Ranks</option>
                      <option value="challenger">Challenger+</option>
                      <option value="master">Master+</option>
                      <option value="diamond">Diamond+</option>
                      <option value="platinum">Platinum+</option>
                      <option value="gold">Gold+</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Patch</label>
                    <div className="bg-shadow-medium border border-shadow-light rounded-lg px-3 py-2 text-sm text-mist-cyan">
                      16.4.1
                    </div>
                  </div>

                  <div className="pt-2 border-t border-shadow-light/50">
                    <p className="text-xs text-gray-500">
                      Updated 15 min ago
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {/* Top Build - Highlighted */}
            {builds[0] && (
              <Card glow="mist" className="relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-mist-green/10 text-mist-green text-xs font-bold px-3 py-1 rounded-bl-lg">
                  <Trophy className="inline h-3 w-3 mr-1" /> HIGHEST WIN RATE
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">
                    {builds[0].name} — {ROLE_LABELS[role]}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Stats row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-mist-green font-mono">{formatWinRate(builds[0].winRate)}</p>
                      <p className="text-xs text-gray-500 uppercase">Win Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-mist-cyan font-mono">{formatWinRate(builds[0].pickRate)}</p>
                      <p className="text-xs text-gray-500 uppercase">Pick Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-soul-gold font-mono">{builds[0].matchCount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 uppercase">Matches</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-ruination-purple font-mono">3.2</p>
                      <p className="text-xs text-gray-500 uppercase">Avg KDA</p>
                    </div>
                  </div>

                  {/* Build Path */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Core Build Path</h4>
                    <div className="flex flex-wrap items-center gap-2">
                      {builds[0].items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="relative group">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg border-2 border-shadow-light bg-shadow-medium overflow-hidden hover:border-mist-green/50 transition-colors">
                              <Image
                                src={getItemIconURL(item.id)}
                                alt={item.name}
                                width={56}
                                height={56}
                                className="w-full h-full object-cover"
                                unoptimized
                              />
                            </div>
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-shadow-dark border border-mist-green/20 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                              <p className="font-semibold text-white">{item.name}</p>
                              <p className="text-soul-gold">{item.cost}g</p>
                            </div>
                          </div>
                          {idx < builds[0].items.length - 1 && (
                            <ArrowRight className="h-4 w-4 text-mist-green/40 hidden sm:block" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Starting Items */}
            <Card glow="none">
              <CardHeader>
                <CardTitle className="text-lg">Starting Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  {STARTING_ITEMS[role].map((item, idx) => (
                    <div key={idx} className="w-10 h-10 rounded border border-shadow-light bg-shadow-medium overflow-hidden">
                      <Image
                        src={getItemIconURL(item.id)}
                        alt={item.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                  ))}
                  <span className="text-sm text-gray-400 ml-2">
                    {STARTING_ITEMS[role].map(i => i.name).join(' + ')}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Summoner Spells */}
            <Card glow="none">
              <CardHeader>
                <CardTitle className="text-lg">Summoner Spells</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  {SUMMONER_SPELLS[role].map((spell, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full border border-shadow-light bg-shadow-medium flex items-center justify-center text-sm font-bold text-mist-cyan">
                        {spell[0]}
                      </div>
                      <span className="text-sm text-gray-300">{spell}</span>
                    </div>
                  ))}
                  <span className="text-xs text-gray-500 ml-auto">97.2% pick rate</span>
                </div>
              </CardContent>
            </Card>

            {/* Skill Order */}
            <Card glow="none">
              <CardHeader>
                <CardTitle className="text-lg">Skill Order</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Priority */}
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Priority:</span>
                  <div className="flex items-center gap-2">
                    {['Q', 'W', 'E'].map((skill, idx) => (
                      <div key={skill} className="flex items-center gap-2">
                        <span className={cn('w-8 h-8 rounded flex items-center justify-center text-sm font-bold', SKILL_COLORS[skill])}>
                          {skill}
                        </span>
                        {idx < 2 && <ArrowRight className="h-3 w-3 text-gray-600" />}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Full grid */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr>
                        <th className="text-gray-500 text-left pr-2 py-1">Lvl</th>
                        {Array.from({ length: 18 }, (_, i) => (
                          <th key={i} className="text-gray-500 text-center px-0.5 py-1 min-w-[24px]">{i + 1}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {['Q', 'W', 'E', 'R'].map((skill) => (
                        <tr key={skill}>
                          <td className={cn('font-bold pr-2 py-0.5', SKILL_COLORS[skill].replace('bg-', 'text-').split(' ')[0].replace('/80', ''))}>{skill}</td>
                          {skillOrder.map((s, idx) => (
                            <td key={idx} className="text-center px-0.5 py-0.5">
                              {s === skill ? (
                                <div className={cn('w-5 h-5 sm:w-6 sm:h-6 rounded-sm mx-auto flex items-center justify-center text-[10px] font-bold', SKILL_COLORS[skill])}>
                                  {idx + 1}
                                </div>
                              ) : (
                                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-sm mx-auto bg-shadow-medium/50" />
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* All Builds */}
            <div>
              <h2 className="font-cinzel text-xl font-bold mb-4 text-white">All Builds</h2>
              <div className="space-y-3">
                {builds.map((build, idx) => (
                  <Card key={build.id} glow="none" className="hover:border-mist-green/20 transition-colors">
                    <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      {/* Rank */}
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0',
                        idx === 0 ? 'bg-soul-gold/20 text-soul-gold' :
                        idx === 1 ? 'bg-gray-400/20 text-gray-300' :
                        idx === 2 ? 'bg-orange-600/20 text-orange-400' :
                        'bg-shadow-medium text-gray-500'
                      )}>
                        {idx + 1}
                      </div>

                      {/* Items */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {build.items.slice(0, 6).map((item, iIdx) => (
                          <div key={iIdx} className="w-9 h-9 rounded border border-shadow-light bg-shadow-medium overflow-hidden">
                            <Image
                              src={getItemIconURL(item.id)}
                              alt={item.name}
                              width={36}
                              height={36}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          </div>
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-6 ml-auto text-sm">
                        <div className="text-center">
                          <p className="font-bold font-mono text-mist-green">{formatWinRate(build.winRate)}</p>
                          <p className="text-[10px] text-gray-500 uppercase">Win</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold font-mono text-mist-cyan">{formatWinRate(build.pickRate)}</p>
                          <p className="text-[10px] text-gray-500 uppercase">Pick</p>
                        </div>
                        <div className="text-center hidden sm:block">
                          <p className="font-bold font-mono text-gray-300">{build.matchCount.toLocaleString()}</p>
                          <p className="text-[10px] text-gray-500 uppercase">Games</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
