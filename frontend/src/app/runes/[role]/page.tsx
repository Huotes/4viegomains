'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { Role } from '@/lib/types'
import { ROLE_LABELS, ROLES } from '@/lib/constants'
import { getMockRunes } from '@/lib/mockData'
import { cn, formatWinRate } from '@/lib/utils'
import Link from 'next/link'
import {
  Sword, TreePine, Sparkles, Crosshair, Shield,
  Trophy, Check, Circle,
} from 'lucide-react'

const ROLE_ICONS: Record<Role, React.ReactNode> = {
  top: <Sword className="h-5 w-5" />,
  jungle: <TreePine className="h-5 w-5" />,
  mid: <Sparkles className="h-5 w-5" />,
  bot: <Crosshair className="h-5 w-5" />,
  support: <Shield className="h-5 w-5" />,
}

// Mock rune tree data for visual display
const RUNE_TREES: Record<string, { color: string; icon: string; keystones: string[]; rows: string[][] }> = {
  Precision: {
    color: '#c89b3c',
    icon: '⚔️',
    keystones: ['Press the Attack', 'Lethal Tempo', 'Fleet Footwork', 'Conqueror'],
    rows: [
      ['Overheal', 'Triumph', 'Presence of Mind'],
      ['Legend: Alacrity', 'Legend: Tenacity', 'Legend: Bloodline'],
      ['Coup de Grace', 'Cut Down', 'Last Stand'],
    ],
  },
  Domination: {
    color: '#d44242',
    icon: '🗡️',
    keystones: ['Electrocute', 'Predator', 'Dark Harvest', 'Hail of Blades'],
    rows: [
      ['Cheap Shot', 'Taste of Blood', 'Sudden Impact'],
      ['Zombie Ward', 'Ghost Poro', 'Eyeball Collection'],
      ['Treasure Hunter', 'Ingenious Hunter', 'Relentless Hunter', 'Ultimate Hunter'],
    ],
  },
  Sorcery: {
    color: '#6b8cff',
    icon: '✨',
    keystones: ['Summon Aery', 'Arcane Comet', 'Phase Rush'],
    rows: [
      ['Nullifying Orb', 'Manaflow Band', 'Nimbus Cloak'],
      ['Transcendence', 'Celerity', 'Absolute Focus'],
      ['Scorch', 'Waterwalking', 'Gathering Storm'],
    ],
  },
  Resolve: {
    color: '#48b946',
    icon: '🛡️',
    keystones: ['Grasp of the Undying', 'Aftershock', 'Guardian'],
    rows: [
      ['Demolish', 'Font of Life', 'Shield Bash'],
      ['Conditioning', 'Second Wind', 'Bone Plating'],
      ['Overgrowth', 'Revitalize', 'Unflinching'],
    ],
  },
  Inspiration: {
    color: '#49aab9',
    icon: '💡',
    keystones: ['Glacial Augment', 'Unsealed Spellbook', 'First Strike'],
    rows: [
      ['Hextech Flashtraption', 'Magical Footwear', 'Cash Back'],
      ['Triple Tonic', 'Time Warp Tonic', 'Biscuit Delivery'],
      ['Cosmic Insight', 'Approach Velocity', 'Jack of All Trades'],
    ],
  },
}

const STAT_SHARDS = {
  offense: ['Adaptive Force', 'Attack Speed', 'Ability Haste'],
  flex: ['Adaptive Force', 'Move Speed', 'Health Scaling'],
  defense: ['Health', 'Tenacity/Slow Resist', 'Health Scaling'],
}

// Mock selected rune pages
function getMockRunePages(role: Role) {
  const pages = [
    {
      name: 'Conqueror Standard',
      primary: 'Precision',
      keystone: 'Conqueror',
      primaryPicks: ['Triumph', 'Legend: Alacrity', 'Last Stand'],
      secondary: 'Domination',
      secondaryPicks: ['Sudden Impact', 'Treasure Hunter'],
      shards: ['Attack Speed', 'Adaptive Force', 'Health'],
      winRate: 0.534,
      pickRate: 0.42,
      matches: 24500,
    },
    {
      name: 'Lethal Tempo DPS',
      primary: 'Precision',
      keystone: 'Lethal Tempo',
      primaryPicks: ['Triumph', 'Legend: Bloodline', 'Coup de Grace'],
      secondary: 'Resolve',
      secondaryPicks: ['Bone Plating', 'Revitalize'],
      shards: ['Attack Speed', 'Adaptive Force', 'Health'],
      winRate: 0.518,
      pickRate: 0.28,
      matches: 16800,
    },
    {
      name: 'First Strike Burst',
      primary: 'Inspiration',
      keystone: 'First Strike',
      primaryPicks: ['Magical Footwear', 'Biscuit Delivery', 'Cosmic Insight'],
      secondary: 'Precision',
      secondaryPicks: ['Triumph', 'Legend: Alacrity'],
      shards: ['Adaptive Force', 'Adaptive Force', 'Health'],
      winRate: 0.502,
      pickRate: 0.15,
      matches: 8900,
    },
  ]
  return pages
}

interface RunesPageProps {
  params: Promise<{ role: string }>
}

export default function RunesPage({ params }: RunesPageProps) {
  const { role: roleParam } = params as unknown as { role: string }
  const role = (ROLES.includes(roleParam as Role) ? roleParam : 'jungle') as Role
  const [selectedPage, setSelectedPage] = useState(0)
  const runePages = getMockRunePages(role)
  const selected = runePages[selectedPage]
  const primaryTree = RUNE_TREES[selected.primary]
  const secondaryTree = RUNE_TREES[selected.secondary]

  return (
    <div className="min-h-screen bg-gradient-to-b from-shadow-black via-shadow-dark to-shadow-black">
      {/* Header */}
      <div className="border-b border-shadow-light/50 bg-shadow-dark/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="font-cinzel text-3xl md:text-4xl font-bold gradient-text-soul mb-2">
            Viego Runes
          </h1>
          <p className="text-gray-400">
            Optimal rune configurations for maximum effectiveness
          </p>
        </div>
      </div>

      {/* Role Tabs */}
      <div className="border-b border-shadow-light/30 bg-shadow-dark/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 overflow-x-auto scrollbar-none py-2">
            {ROLES.map((r) => (
              <Link
                key={r}
                href={`/runes/${r}`}
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
        {/* Rune Page Selector */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          {runePages.map((page, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedPage(idx)}
              className={cn(
                'flex-1 rounded-lg border p-4 text-left transition-all',
                idx === selectedPage
                  ? 'border-mist-green/50 bg-mist-green/5'
                  : 'border-shadow-light bg-shadow-dark/40 hover:border-shadow-light/80'
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm text-white">{page.name}</span>
                {idx === 0 && <Trophy className="h-4 w-4 text-soul-gold" />}
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-mist-green font-mono font-bold">{formatWinRate(page.winRate)}</span>
                <span className="text-gray-500">{formatWinRate(page.pickRate)} pick</span>
                <span className="text-gray-500">{page.matches.toLocaleString()} games</span>
              </div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Primary Tree */}
          <Card glow="mist">
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{primaryTree.icon}</span>
                <CardTitle style={{ color: primaryTree.color }}>
                  {selected.primary} (Primary)
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Keystone */}
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Keystone</p>
                <div className="flex flex-wrap gap-3">
                  {primaryTree.keystones.map((ks) => (
                    <div
                      key={ks}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all',
                        ks === selected.keystone
                          ? 'border-mist-green/50 bg-mist-green/10 text-white'
                          : 'border-shadow-light bg-shadow-medium/30 text-gray-500'
                      )}
                    >
                      {ks === selected.keystone ? (
                        <Check className="h-4 w-4 text-mist-green" />
                      ) : (
                        <Circle className="h-4 w-4 text-gray-600" />
                      )}
                      {ks}
                    </div>
                  ))}
                </div>
              </div>

              {/* Rows */}
              {primaryTree.rows.map((row, rowIdx) => (
                <div key={rowIdx}>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Row {rowIdx + 1}</p>
                  <div className="flex flex-wrap gap-3">
                    {row.map((rune) => (
                      <div
                        key={rune}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all',
                          selected.primaryPicks.includes(rune)
                            ? 'border-mist-green/50 bg-mist-green/10 text-white'
                            : 'border-shadow-light bg-shadow-medium/30 text-gray-500'
                        )}
                      >
                        {selected.primaryPicks.includes(rune) ? (
                          <Check className="h-4 w-4 text-mist-green" />
                        ) : (
                          <Circle className="h-4 w-4 text-gray-600" />
                        )}
                        {rune}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Secondary Tree + Shards */}
          <div className="space-y-8">
            <Card glow="ruination">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{secondaryTree.icon}</span>
                  <CardTitle style={{ color: secondaryTree.color }}>
                    {selected.secondary} (Secondary)
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {secondaryTree.rows.map((row, rowIdx) => (
                  <div key={rowIdx}>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Row {rowIdx + 1}</p>
                    <div className="flex flex-wrap gap-3">
                      {row.map((rune) => (
                        <div
                          key={rune}
                          className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all',
                            selected.secondaryPicks.includes(rune)
                              ? 'border-ruination-purple/50 bg-ruination-purple/10 text-white'
                              : 'border-shadow-light bg-shadow-medium/30 text-gray-500'
                          )}
                        >
                          {selected.secondaryPicks.includes(rune) ? (
                            <Check className="h-4 w-4 text-ruination-purple" />
                          ) : (
                            <Circle className="h-4 w-4 text-gray-600" />
                          )}
                          {rune}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Stat Shards */}
            <Card glow="none">
              <CardHeader>
                <CardTitle className="text-lg">Stat Shards</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(STAT_SHARDS).map(([category, options], catIdx) => (
                  <div key={category}>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 capitalize">{category}</p>
                    <div className="flex flex-wrap gap-2">
                      {options.map((shard) => (
                        <div
                          key={shard}
                          className={cn(
                            'px-3 py-1.5 rounded-full border text-xs transition-all',
                            selected.shards[catIdx] === shard
                              ? 'border-soul-gold/50 bg-soul-gold/10 text-soul-gold'
                              : 'border-shadow-light bg-shadow-medium/30 text-gray-500'
                          )}
                        >
                          {shard}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Comparison Table */}
        <Card glow="none" className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Rune Page Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-shadow-light/50">
                    <th className="text-left py-3 text-gray-500 font-normal">Rune Page</th>
                    <th className="text-center py-3 text-gray-500 font-normal">Win Rate</th>
                    <th className="text-center py-3 text-gray-500 font-normal">Pick Rate</th>
                    <th className="text-center py-3 text-gray-500 font-normal hidden sm:table-cell">Matches</th>
                    <th className="text-center py-3 text-gray-500 font-normal hidden md:table-cell">Primary</th>
                    <th className="text-center py-3 text-gray-500 font-normal hidden md:table-cell">Secondary</th>
                  </tr>
                </thead>
                <tbody>
                  {runePages.map((page, idx) => (
                    <tr
                      key={idx}
                      className={cn(
                        'border-b border-shadow-light/20 cursor-pointer transition-colors',
                        idx === selectedPage ? 'bg-mist-green/5' : 'hover:bg-shadow-light/20'
                      )}
                      onClick={() => setSelectedPage(idx)}
                    >
                      <td className="py-3 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          {idx === 0 && <Trophy className="h-3.5 w-3.5 text-soul-gold" />}
                          {page.name}
                        </div>
                      </td>
                      <td className="py-3 text-center font-mono font-bold text-mist-green">{formatWinRate(page.winRate)}</td>
                      <td className="py-3 text-center font-mono text-mist-cyan">{formatWinRate(page.pickRate)}</td>
                      <td className="py-3 text-center text-gray-400 hidden sm:table-cell">{page.matches.toLocaleString()}</td>
                      <td className="py-3 text-center hidden md:table-cell">
                        <span className="px-2 py-0.5 rounded text-xs" style={{ color: RUNE_TREES[page.primary]?.color }}>
                          {page.primary}
                        </span>
                      </td>
                      <td className="py-3 text-center hidden md:table-cell">
                        <span className="px-2 py-0.5 rounded text-xs" style={{ color: RUNE_TREES[page.secondary]?.color }}>
                          {page.secondary}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
