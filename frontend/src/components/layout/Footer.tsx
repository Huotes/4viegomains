import Link from 'next/link'
import { Heart } from 'lucide-react'

export function Footer(): React.ReactElement {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-shadow-light bg-gradient-to-t from-shadow-dark to-shadow-dark/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="font-cinzel font-bold text-lg gradient-text-soul mb-4">
              4ViegoMains
            </h3>
            <p className="text-gray-400 text-sm">
              The premier analytics platform for League of Legends Viego champion main community.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-mist-cyan mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/builds/top"
                  className="text-gray-400 hover:text-mist-green transition-colors"
                >
                  Champion Builds
                </Link>
              </li>
              <li>
                <Link
                  href="/guides/top"
                  className="text-gray-400 hover:text-mist-green transition-colors"
                >
                  Guides
                </Link>
              </li>
              <li>
                <Link
                  href="/analytics"
                  className="text-gray-400 hover:text-mist-green transition-colors"
                >
                  Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-semibold text-mist-cyan mb-4">Community</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/leaderboard/na1"
                  className="text-gray-400 hover:text-mist-green transition-colors"
                >
                  Leaderboard
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-mist-green transition-colors"
                >
                  Discord
                </a>
              </li>
              <li>
                <Link
                  href="/lore"
                  className="text-gray-400 hover:text-mist-green transition-colors"
                >
                  Viego Lore
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-mist-cyan mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-mist-green transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-mist-green transition-colors"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-mist-green transition-colors"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-shadow-light pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
            <p>
              © {currentYear} 4ViegoMains. Made with{' '}
              <Heart className="inline h-4 w-4 text-soul-gold" /> by Viego mains.
            </p>
            <p className="text-xs mt-4 md:mt-0">
              Not affiliated with Riot Games. League of Legends is a trademark of Riot Games, Inc.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
