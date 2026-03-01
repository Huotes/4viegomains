'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ROLES, ROLE_LABELS, ROLE_DESCRIPTIONS } from '@/lib/constants'
import type { Role } from '@/lib/types'
import { ChevronDown } from 'lucide-react'

const SECTIONS = ['builds', 'runes', 'guides', 'matchups']
const ELO_TIERS = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master']

export function Sidebar(): React.ReactElement {
  const pathname = usePathname()
  const [expandedRole, setExpandedRole] = useState<Role | null>(
    ROLES.find((r) => pathname.includes(`/${r}`)) || 'top'
  )
  const [selectedTier, setSelectedTier] = useState('Diamond')

  const isActive = (role: Role, section: string) => {
    return pathname.includes(role) && pathname.includes(`/${section}/`)
  }

  const isRoleActive = (role: Role) => {
    return pathname.includes(`/${role}`)
  }

  return (
    <aside
      className={cn(
        'glass border border-shadow-light/50 rounded-lg p-6 sticky top-20 h-fit',
        'hidden lg:block w-72'
      )}
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="font-cinzel font-bold text-lg gradient-text-mist mb-1">
          Role Selection
        </h3>
        <p className="text-xs text-gray-500">Choose a role to view analytics</p>
      </div>

      {/* Roles List */}
      <div className="space-y-1 mb-8">
        {ROLES.map((role) => (
          <div key={role}>
            {/* Role Button */}
            <button
              onClick={() => setExpandedRole(expandedRole === role ? null : role)}
              className={cn(
                'w-full flex items-center justify-between px-4 py-3 rounded-lg font-semibold',
                'transition-all duration-300 text-sm group',
                isRoleActive(role)
                  ? 'bg-gradient-to-r from-mist-green/20 to-mist-cyan/10 border border-mist-green/50 text-mist-green'
                  : 'text-gray-300 hover:text-mist-green hover:bg-shadow-light/30 border border-transparent'
              )}
              title={ROLE_DESCRIPTIONS[role]}
            >
              <span>{ROLE_LABELS[role]}</span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform duration-300',
                  expandedRole === role && 'rotate-180'
                )}
              />
            </button>

            {/* Subsections */}
            {expandedRole === role && (
              <div className="ml-2 mt-2 space-y-1 border-l border-mist-green/30 pl-3 animate-fade-in-up">
                {SECTIONS.map((section) => (
                  <Link
                    key={section}
                    href={`/${section}/${role}`}
                    className={cn(
                      'block px-3 py-2 rounded text-xs font-semibold transition-all',
                      isActive(role, section)
                        ? 'bg-mist-green/20 text-mist-green border-l-2 border-mist-green ml-1'
                        : 'text-gray-400 hover:text-gray-300 hover:bg-shadow-light/20'
                    )}
                  >
                    {section === 'builds' && '📚'}
                    {section === 'runes' && '⚡'}
                    {section === 'guides' && '📖'}
                    {section === 'matchups' && '⚔️'}
                    <span className="ml-2">{section.charAt(0).toUpperCase() + section.slice(1)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ELO Tier Filter */}
      <div className="mb-8 p-4 rounded-lg border border-shadow-light/50 bg-shadow-light/20">
        <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2">
          Filter by Tier
        </label>
        <select
          value={selectedTier}
          onChange={(e) => setSelectedTier(e.target.value)}
          className={cn(
            'w-full bg-shadow-medium/60 border border-shadow-light/40 rounded px-3 py-2',
            'text-sm text-white focus:outline-none focus:border-mist-green/50',
            'transition-all duration-300 cursor-pointer'
          )}
        >
          <option value="All">All Tiers</option>
          {ELO_TIERS.map((tier) => (
            <option key={tier} value={tier}>
              {tier}+
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-2">
          Showing stats for {selectedTier === 'All' ? 'all tiers' : `${selectedTier}+`}
        </p>
      </div>

      {/* Patch Version */}
      <div className="p-4 rounded-lg bg-gradient-to-br from-soul-gold/10 to-soul-gold/5 border border-soul-gold/30">
        <p className="text-xs text-soul-gold font-semibold uppercase tracking-wider mb-1">
          Patch Info
        </p>
        <p className="text-sm font-mono text-white mb-2">Live Data</p>
        <p className="text-xs text-gray-400 leading-relaxed">
          Statistics fetched from API. Data reflects competitive play across all regions.
        </p>
      </div>

      {/* Quick Links */}
      <div className="mt-6 pt-6 border-t border-mist-green/20">
        <h4 className="font-semibold text-mist-cyan text-xs uppercase tracking-wider mb-3">
          Quick Links
        </h4>
        <div className="space-y-2">
          <Link
            href="/analytics"
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded text-sm transition-all',
              'text-gray-400 hover:text-mist-green hover:bg-shadow-light/30'
            )}
          >
            <span>📊</span>
            <span>Full Analytics</span>
          </Link>
          <Link
            href="/leaderboard/na1"
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded text-sm transition-all',
              'text-gray-400 hover:text-mist-green hover:bg-shadow-light/30'
            )}
          >
            <span>🏆</span>
            <span>Leaderboard</span>
          </Link>
          <Link
            href="/lore"
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded text-sm transition-all',
              'text-gray-400 hover:text-mist-green hover:bg-shadow-light/30'
            )}
          >
            <span>👻</span>
            <span>Viego Lore</span>
          </Link>
        </div>
      </div>
    </aside>
  )
}
