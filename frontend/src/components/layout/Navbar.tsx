'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Navbar(): React.ReactElement {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/builds/top', label: 'Builds' },
    { href: '/runes/top', label: 'Runes' },
    { href: '/guides/top', label: 'Guides' },
    { href: '/analytics', label: 'Analytics' },
    { href: '/leaderboard/na1', label: 'Leaderboard' },
    { href: '/lore', label: 'Lore' },
  ]

  return (
    <nav className="sticky top-0 z-40 border-b border-shadow-light bg-gradient-to-b from-shadow-dark via-shadow-dark to-shadow-dark/80 glass backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-cinzel font-bold text-2xl gradient-text-soul hover:opacity-80 transition-opacity"
          >
            <Crown className="h-7 w-7 text-soul-gold" />
            4ViegoMains
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-semibold transition-all',
                  'text-gray-300 hover:text-mist-green hover:bg-shadow-light/50',
                  'border border-transparent hover:border-mist-green/30'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-shadow-medium/50 border border-shadow-light hover:border-mist-cyan/30 transition-colors">
              <input
                type="text"
                placeholder="Search player..."
                className="bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none w-40"
              />
              <svg
                className="h-4 w-4 text-mist-cyan/50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-mist-cyan hover:text-mist-green transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-gray-300 hover:text-mist-green hover:bg-shadow-light/50 transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
