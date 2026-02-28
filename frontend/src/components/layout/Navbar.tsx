'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useCallback } from 'react'
import { Menu, X, Crown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

interface NavLink {
  href: string
  label: string
}

const NAV_LINKS: NavLink[] = [
  { href: '/builds/top', label: 'Builds' },
  { href: '/runes/top', label: 'Runes' },
  { href: '/guides/top', label: 'Guides' },
  { href: '/matchups/top', label: 'Matchups' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/leaderboard/na1', label: 'Leaderboard' },
  { href: '/lore', label: 'Lore' },
]

export function Navbar(): React.ReactElement {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('na1')
  const [searchLoading, setSearchLoading] = useState(false)

  const isActive = (href: string): boolean => {
    return pathname.startsWith(href.split('/').slice(0, 2).join('/'))
  }

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchInput.trim()) return

    setSearchLoading(true)
    const parts = searchInput.trim().split('#')

    if (parts.length === 2) {
      const [name, tag] = parts
      router.push(`/player/${selectedRegion}/${name}/${tag}`)
      setSearchInput('')
      setMobileMenuOpen(false)
    }

    setSearchLoading(false)
  }, [searchInput, selectedRegion, router])

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <>
      <nav
        className="sticky top-0 z-40 w-full border-b border-shadow-light/30 bg-gradient-to-b from-shadow-dark via-shadow-dark/95 to-shadow-dark/80 glass backdrop-blur-md"
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 font-cinzel font-bold text-2xl md:text-xl lg:text-2xl gradient-text-soul hover:opacity-80 transition-opacity duration-300 whitespace-nowrap flex-shrink-0"
            >
              <Crown className="h-6 w-6 md:h-5 md:w-5 lg:h-6 lg:w-6 text-soul-gold" />
              <span className="hidden sm:inline">4ViegoMains</span>
              <span className="sm:hidden">4VM</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-0.5 flex-1 ml-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 relative',
                    isActive(link.href)
                      ? 'text-mist-green'
                      : 'text-gray-300 hover:text-mist-green'
                  )}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <div className="absolute bottom-1 left-3 right-3 h-0.5 bg-gradient-to-r from-mist-green to-mist-cyan rounded-full" />
                  )}
                </Link>
              ))}
            </div>

            {/* Desktop Search Bar */}
            <form
              onSubmit={handleSearch}
              className="hidden lg:flex items-center gap-2 ml-4"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Player Name#TAG"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className={cn(
                    'bg-shadow-medium/40 border text-sm text-white placeholder-gray-500',
                    'rounded-lg px-3 py-2 min-w-[180px] transition-all duration-300',
                    'focus:outline-none focus:bg-shadow-medium/60 focus:border-mist-green/50',
                    'hover:border-mist-green/30'
                  )}
                />
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className={cn(
                    'bg-shadow-medium/40 border border-shadow-light/30 text-sm text-white',
                    'rounded-lg px-2 py-2 transition-all duration-300',
                    'focus:outline-none focus:bg-shadow-medium/60 focus:border-mist-green/50',
                    'hover:border-mist-green/30'
                  )}
                >
                  <option value="na1">NA</option>
                  <option value="euw1">EUW</option>
                  <option value="kr">KR</option>
                  <option value="br1">BR</option>
                </select>
              </div>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={searchLoading}
                className="gap-1.5"
              >
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Search</span>
              </Button>
            </form>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className={cn(
                'md:hidden p-2 text-mist-cyan hover:text-mist-green',
                'transition-colors duration-300 ml-auto'
              )}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div
              className="md:hidden pb-4 space-y-1 border-t border-shadow-light/20 pt-4 animate-fade-in-up"
            >
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'block px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300',
                    isActive(link.href)
                      ? 'text-mist-green bg-shadow-light/40 border border-mist-green/30'
                      : 'text-gray-300 hover:text-mist-green hover:bg-shadow-light/20'
                  )}
                >
                  {link.label}
                </Link>
              ))}

              {/* Mobile Search */}
              <form
                onSubmit={handleSearch}
                className="flex flex-col gap-2 px-3 py-4 border-t border-shadow-light/20 mt-4 pt-4"
              >
                <input
                  type="text"
                  placeholder="Player Name#TAG"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className={cn(
                    'bg-shadow-medium/40 border border-shadow-light/30 text-sm text-white placeholder-gray-500',
                    'rounded-lg px-3 py-2 transition-all duration-300 w-full',
                    'focus:outline-none focus:bg-shadow-medium/60 focus:border-mist-green/50'
                  )}
                />
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className={cn(
                    'bg-shadow-medium/40 border border-shadow-light/30 text-sm text-white',
                    'rounded-lg px-3 py-2 transition-all duration-300 w-full',
                    'focus:outline-none focus:bg-shadow-medium/60 focus:border-mist-green/50'
                  )}
                >
                  <option value="na1">NA</option>
                  <option value="euw1">EUW</option>
                  <option value="kr">KR</option>
                  <option value="br1">BR</option>
                </select>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={searchLoading}
                  className="w-full gap-2"
                >
                  <Search className="h-4 w-4" />
                  Search Player
                </Button>
              </form>
            </div>
          )}
        </div>
      </nav>
    </>
  )
}
