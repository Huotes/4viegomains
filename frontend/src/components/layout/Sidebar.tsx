'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ROLES, ROLE_LABELS, ROLE_DESCRIPTIONS } from '@/lib/constants'
import type { Role } from '@/lib/types'

interface SidebarProps {
  currentRole?: Role
}

export function Sidebar({ currentRole = 'top' }: SidebarProps): React.ReactElement {
  const pathname = usePathname()

  const isActive = (role: Role, section: string) => {
    return pathname.includes(role) && pathname.includes(`/${section}/`)
  }

  const sections = ['builds', 'runes', 'guides', 'matchups']

  return (
    <aside className="hidden lg:block w-64 glass border border-shadow-light rounded-lg p-4 sticky top-20 h-fit">
      <h3 className="font-cinzel font-bold text-lg gradient-text-mist mb-4">Role Selection</h3>

      <div className="space-y-3">
        {ROLES.map((role) => (
          <div key={role}>
            <button
              className={cn(
                'w-full text-left px-3 py-2 rounded-lg font-semibold transition-all text-sm mb-2',
                pathname.includes(`/${role}`)
                  ? 'bg-shadow-light border border-mist-green/50 text-mist-green'
                  : 'text-gray-400 hover:text-mist-cyan border border-transparent'
              )}
              title={ROLE_DESCRIPTIONS[role]}
            >
              {ROLE_LABELS[role]}
            </button>

            <div className={cn(
              'space-y-1 ml-2 border-l border-shadow-light pl-2 transition-all',
              !pathname.includes(`/${role}`) && 'hidden'
            )}>
              {sections.map((section) => (
                <Link
                  key={section}
                  href={`/${section}/${role}`}
                  className={cn(
                    'block text-xs px-2 py-1.5 rounded transition-all',
                    isActive(role, section)
                      ? 'bg-mist-green/20 text-mist-green border-l-2 border-mist-green'
                      : 'text-gray-500 hover:text-gray-300'
                  )}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 pt-6 border-t border-shadow-light">
        <h4 className="font-semibold text-mist-cyan text-sm mb-3">Quick Links</h4>
        <div className="space-y-2">
          <Link
            href="/analytics"
            className="block text-xs text-gray-400 hover:text-mist-green transition-colors"
          >
            → Full Analytics
          </Link>
          <Link
            href="/leaderboard/na1"
            className="block text-xs text-gray-400 hover:text-mist-green transition-colors"
          >
            → Leaderboard
          </Link>
          <Link
            href="/lore"
            className="block text-xs text-gray-400 hover:text-mist-green transition-colors"
          >
            → Viego Lore
          </Link>
        </div>
      </div>

      {/* Patch Notes */}
      <div className="mt-6 p-3 rounded-lg bg-shadow-light/30 border border-soul-gold/20">
        <p className="text-xs text-soul-gold font-semibold mb-1">Patch 14.3</p>
        <p className="text-xs text-gray-400">
          Updated with latest champion stats and item changes.
        </p>
      </div>
    </aside>
  )
}
