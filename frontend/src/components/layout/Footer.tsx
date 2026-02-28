'use client'

import Link from 'next/link'
import { Github, Twitter, Mail, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FooterLink {
  label: string
  href: string
  external?: boolean
}

interface FooterSection {
  title: string
  links: FooterLink[]
}

const FOOTER_SECTIONS: FooterSection[] = [
  {
    title: 'Navigation',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Builds', href: '/builds/top' },
      { label: 'Runes', href: '/runes/top' },
      { label: 'Guides', href: '/guides/top' },
      { label: 'Analytics', href: '/analytics' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Champion Statistics', href: '/analytics' },
      { label: 'Leaderboard', href: '/leaderboard/na1' },
      { label: 'Matchups', href: '/matchups/top' },
      { label: 'Patch Notes', href: 'https://www.leagueoflegends.com/en-us/news/game-updates/', external: true },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'Discord', href: 'https://discord.gg', external: true },
      { label: 'Twitter', href: 'https://twitter.com', external: true },
      { label: 'GitHub', href: 'https://github.com', external: true },
      { label: 'Report Bug', href: 'https://github.com/issues', external: true },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Contact', href: '/contact' },
      { label: 'Attribution', href: '/attribution' },
    ],
  },
]

const VIEGO_QUOTES = [
  "Only I can collect what's mine.",
  'The Ruined King reclaims his domain.',
  'None shall stand before me.',
  'I am the inevitable shadow.',
  'This realm is mine.',
]

export function Footer(): React.ReactElement {
  const randomQuote = VIEGO_QUOTES[Math.floor(Math.random() * VIEGO_QUOTES.length)]

  return (
    <footer className="mt-12 border-t border-mist-green/20 bg-gradient-to-b from-shadow-dark/50 to-shadow-black pt-12 pb-8">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Viego Quote */}
        <div className="mb-12 text-center">
          <p className="text-lg md:text-xl font-cinzel italic text-mist-green/80 mb-2">
            "{randomQuote}"
          </p>
          <p className="text-xs md:text-sm text-gray-500 font-cinzel tracking-widest">
            — VIEGO, THE RUINED KING
          </p>
        </div>

        {/* Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6 mb-12">
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h4 className="font-cinzel font-bold text-white mb-4 text-sm md:text-base tracking-wide">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
                      className={cn(
                        'text-gray-400 hover:text-mist-green transition-colors duration-300',
                        'text-sm flex items-center gap-1.5 group'
                      )}
                    >
                      <span>{link.label}</span>
                      {link.external && (
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="my-8 p-4 border border-yellow-600/30 bg-yellow-900/10 rounded-lg">
          <p className="text-xs md:text-sm text-yellow-700/80 text-center font-semibold">
            <span className="block md:inline">⚠️ Not endorsed by Riot Games. </span>
            <span>4ViegoMains is an independent analytics platform using League of Legends public API data.</span>
          </p>
        </div>

        {/* Social Links */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <Link
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-mist-green transition-colors duration-300 p-2 hover:bg-shadow-light/30 rounded-lg"
            aria-label="GitHub"
          >
            <Github className="h-5 w-5" />
          </Link>
          <Link
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-mist-green transition-colors duration-300 p-2 hover:bg-shadow-light/30 rounded-lg"
            aria-label="Twitter"
          >
            <Twitter className="h-5 w-5" />
          </Link>
          <Link
            href="mailto:contact@4viegomains.com"
            className="text-gray-400 hover:text-mist-green transition-colors duration-300 p-2 hover:bg-shadow-light/30 rounded-lg"
            aria-label="Email"
          >
            <Mail className="h-5 w-5" />
          </Link>
        </div>

        {/* Copyright */}
        <div className="border-t border-shadow-light/20 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <p className="text-xs md:text-sm text-gray-500">
              © {new Date().getFullYear()} 4ViegoMains. All rights reserved.
            </p>
            <p className="text-xs md:text-sm text-gray-500">
              League of Legends is © Riot Games. We are not affiliated with Riot Games.
            </p>
            <p className="text-xs md:text-sm text-gray-500">
              Built with <span className="text-mist-green">passion</span> for Viego mains.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
