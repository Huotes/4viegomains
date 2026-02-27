import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge, RoleBadge, StatBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ArrowRight, TrendingUp, Target, Crown } from 'lucide-react'
import Link from 'next/link'
import { ROLES, ROLE_LABELS, VIEGO_QUOTES } from '@/lib/constants'
import type { Role } from '@/lib/types'

export default function HomePage(): React.ReactElement {
  return (
    <div className="min-h-screen bg-gradient-to-b from-shadow-black via-shadow-dark to-shadow-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-ruination-purple/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-mist-green/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Crown className="h-10 w-10 text-soul-gold animate-bounce" />
              <h1 className="font-cinzel text-5xl md:text-6xl font-bold gradient-text-soul">
                4ViegoMains
              </h1>
              <Crown className="h-10 w-10 text-soul-gold animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>

            <p className="text-xl text-mist-green font-semibold mb-4 soul-shimmer">
              {VIEGO_QUOTES.main}
            </p>

            <p className="text-gray-300 max-w-2xl mx-auto mb-8">
              Master the art of domination with comprehensive analytics, meta builds, and
              strategic guides for Viego across all roles.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/builds/top">
                <Button size="lg" icon={<ArrowRight className="h-5 w-5" />}>
                  View Builds
                </Button>
              </Link>
              <Link href="/leaderboard/na1">
                <Button variant="secondary" size="lg" icon={<TrendingUp className="h-5 w-5" />}>
                  Top Players
                </Button>
              </Link>
            </div>
          </div>

          {/* Meta Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <Card glow="mist">
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-mist-cyan/70 uppercase tracking-wider mb-2">
                    Win Rate
                  </p>
                  <p className="text-3xl font-bold gradient-text-mist">52.3%</p>
                  <p className="text-xs text-green-400 mt-1">↑ 1.2% this patch</p>
                </div>
                <Target className="h-12 w-12 text-mist-green opacity-30" />
              </CardContent>
            </Card>

            <Card glow="ruination">
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-mist-cyan/70 uppercase tracking-wider mb-2">
                    Pick Rate
                  </p>
                  <p className="text-3xl font-bold gradient-text-ruination">8.7%</p>
                  <p className="text-xs text-green-400 mt-1">↑ 0.8% this patch</p>
                </div>
                <TrendingUp className="h-12 w-12 text-ruination-purple opacity-30" />
              </CardContent>
            </Card>

            <Card glow="mist">
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-mist-cyan/70 uppercase tracking-wider mb-2">
                    Ban Rate
                  </p>
                  <p className="text-3xl font-bold gradient-text-mist">12.1%</p>
                  <p className="text-xs text-red-400 mt-1">↑ 2.3% this patch</p>
                </div>
                <Crown className="h-12 w-12 text-soul-gold opacity-30" />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Roles Overview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-shadow-dark/40">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <h2 className="font-cinzel text-3xl font-bold mb-2 gradient-text-soul">
              Best Builds by Role
            </h2>
            <p className="text-gray-400">
              Optimized itemization and strategies for each lane position
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {ROLES.map((role: Role) => (
              <Card key={role} glow="mist" className="hover:mist-glow-active transition-all">
                <CardContent className="flex flex-col items-center text-center gap-3">
                  <div className="text-4xl mb-2">
                    {
                      {
                        top: '⚔️',
                        jungle: '🌲',
                        mid: '✨',
                        bot: '🏹',
                        support: '🛡️',
                      }[role]
                    }
                  </div>
                  <h3 className="font-cinzel font-bold text-lg">{ROLE_LABELS[role]}</h3>
                  <RoleBadge role={role} />
                  <div className="space-y-2 w-full text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Win Rate:</span>
                      <span className="text-mist-green font-semibold">51.8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Pick Rate:</span>
                      <span className="text-mist-cyan font-semibold">8.3%</span>
                    </div>
                  </div>
                  <Link href={`/builds/${role}`} className="w-full mt-2">
                    <Button variant="ghost" size="sm" className="w-full">
                      View Build →
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <h2 className="font-cinzel text-3xl font-bold mb-2 gradient-text-soul">
              Explore More
            </h2>
            <p className="text-gray-400">
              Deep dive into advanced analytics and community insights
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card glow="ruination">
              <CardHeader>
                <CardTitle>Matchup Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-gray-400 text-sm">
                  See how Viego fares against every champion in the game with detailed strategies.
                </p>
                <Link href="/matchups/top">
                  <Button variant="ghost" size="sm" className="gap-2">
                    View Matchups
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card glow="mist">
              <CardHeader>
                <CardTitle>Player Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-gray-400 text-sm">
                  Search for any player and analyze their Viego gameplay statistics.
                </p>
                <Link href="/leaderboard/na1">
                  <Button variant="ghost" size="sm" className="gap-2">
                    Search Players
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card glow="ruination">
              <CardHeader>
                <CardTitle>Viego Lore</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-gray-400 text-sm">
                  Discover the dark history of the Ruined King and his rise to power.
                </p>
                <Link href="/lore">
                  <Button variant="ghost" size="sm" className="gap-2">
                    Read Lore
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Recent Patches */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-shadow-dark/40">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h2 className="font-cinzel text-3xl font-bold mb-2 gradient-text-soul">
              Latest Patch Impact
            </h2>
            <p className="text-gray-400">
              How recent changes affect Viego's viability
            </p>
          </div>

          <Card glow="none">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Patch 14.3</CardTitle>
                <Badge variant="warning">Updated</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatBadge
                  label="Win Rate Change"
                  value="+1.2%"
                  unit="↑"
                />
                <StatBadge
                  label="Pick Rate Change"
                  value="+0.8%"
                  unit="↑"
                />
                <StatBadge
                  label="Ban Rate Change"
                  value="+2.3%"
                  unit="↑"
                />
                <StatBadge
                  label="Overall Impact"
                  value="BUFFED"
                />
              </div>

              <div className="pt-4 border-t border-shadow-light">
                <p className="text-sm text-gray-400 mb-3">Key Changes:</p>
                <ul className="space-y-2">
                  <li className="flex gap-2 text-sm">
                    <span className="text-mist-green">•</span>
                    <span>Increased passive damage scaling by 5%</span>
                  </li>
                  <li className="flex gap-2 text-sm">
                    <span className="text-mist-green">•</span>
                    <span>W cooldown reduced at max rank</span>
                  </li>
                  <li className="flex gap-2 text-sm">
                    <span className="text-mist-green">•</span>
                    <span>New item synergies from item rework</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
