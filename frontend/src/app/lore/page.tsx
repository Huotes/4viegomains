import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { VIEGO_INFO, VIEGO_QUOTES } from '@/lib/constants'

export const metadata = {
  title: 'Viego Lore — The Ruined King — 4ViegoMains',
  description: 'Discover the dark history and story of Viego, The Ruined King from League of Legends.',
}

export default function LorePage(): React.ReactElement {
  return (
    <div className="min-h-screen bg-gradient-to-b from-shadow-black to-shadow-dark">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-ruination-purple/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-mist-green/5 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="default" className="mb-4">
            The Shadow Isles
          </Badge>
          <h1 className="font-cinzel text-5xl font-bold gradient-text-soul mb-4">
            {VIEGO_INFO.title}
          </h1>
          <p className="text-xl text-mist-green font-semibold mb-6 soul-shimmer">
            {VIEGO_QUOTES.main}
          </p>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            {VIEGO_INFO.description}
          </p>
        </div>

        {/* Champion Info Card */}
        <Card glow="ruination" className="mb-12">
          <CardHeader>
            <CardTitle>Champion Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-mist-cyan/70 uppercase tracking-wider mb-2">
                  Region
                </p>
                <p className="text-lg font-semibold text-white">{VIEGO_INFO.region}</p>
              </div>
              <div>
                <p className="text-sm text-mist-cyan/70 uppercase tracking-wider mb-2">
                  Release Date
                </p>
                <p className="text-lg font-semibold text-white">
                  {new Date(VIEGO_INFO.release).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-mist-cyan/70 uppercase tracking-wider mb-2">
                  Difficulty
                </p>
                <p className="text-lg font-semibold text-white">{VIEGO_INFO.difficulty}</p>
              </div>
              <div>
                <p className="text-sm text-mist-cyan/70 uppercase tracking-wider mb-2">
                  Champion ID
                </p>
                <p className="text-lg font-semibold text-white">234</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Story Section */}
        <div className="space-y-8 mb-12">
          <Card glow="mist">
            <CardHeader>
              <CardTitle>The Ruined King</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                Once a noble king of the lands now known as the Isles, Viego was a man of virtue and
                strength. But when a curse claimed his beloved wife, he was consumed by despair and
                obsession. Seeking to restore her, he delved into dark and forbidden magics,
                ultimately creating the Ruination itself.
              </p>
              <p>
                The Ruination transformed the Isles into a land of mist and shadow, where
                the boundaries between life and death blur. Viego became something more than human—a
                being of pure malevolence, capable of possessing others and stealing their very souls
                to fuel his endless hunger for resurrection.
              </p>
              <p>
                Now, as the Ruined King, Viego walks the Shadow Isles, collecting souls to
                rebuild his lost love. He is the embodiment of corruption, a force that corrupts
                all it touches. The Mist spreads where he walks, and all who encounter him fall
                under his sinister command.
              </p>
            </CardContent>
          </Card>

          <Card glow="ruination">
            <CardHeader>
              <CardTitle>Abilities & Powers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-300">
              <div>
                <h4 className="font-semibold text-mist-green mb-2">Passive: Sovereign's Domination</h4>
                <p className="text-sm">
                  Viego can possess enemies he damages, gaining their abilities and stats.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-mist-green mb-2">Q: Blade of the Ruined King</h4>
                <p className="text-sm">
                  Viego strikes with his cursed blade, dealing damage and healing based on enemy missing health.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-mist-green mb-2">W: Sovereign's Call</h4>
                <p className="text-sm">
                  Viego dashes toward an ally or fallen enemy, leaving behind spectral mist that damages opponents.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-mist-green mb-2">E: Harrowed Path</h4>
                <p className="text-sm">
                  Viego charges forward, gaining damage reduction and leaving behind ruins that slow enemies.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-mist-green mb-2">R: Ruined Shockwave</h4>
                <p className="text-sm">
                  Viego unleashes a massive shockwave of ruined energy, stunning and damaging all enemies hit.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card glow="mist">
            <CardHeader>
              <CardTitle>Quotes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {VIEGO_QUOTES.quotes.map((quote, idx) => (
                <div key={idx} className="py-2 border-l-2 border-soul-gold/50 pl-4">
                  <p className="text-gray-300 italic">"{quote}"</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Related Content */}
        <div className="mb-12">
          <h2 className="font-cinzel text-2xl font-bold mb-6 gradient-text-soul">
            Related Champions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Kalista', 'Hecarim', 'Thresh'].map((champion) => (
              <Card key={champion} glow="ruination">
                <CardContent className="text-center py-6">
                  <p className="text-lg font-semibold text-white mb-2">{champion}</p>
                  <p className="text-sm text-gray-400">Also from the Shadow Isles</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <Card glow="mist" className="text-center">
          <CardContent className="py-8">
            <h3 className="font-cinzel text-2xl font-bold text-white mb-4">
              Master the Ruined King
            </h3>
            <p className="text-gray-300 mb-6">
              Learn how to dominate with Viego across every role and become the ultimate champion main.
            </p>
            <button className="px-8 py-3 rounded-lg bg-gradient-to-r from-mist-green to-mist-cyan text-shadow-black font-semibold hover:shadow-lg mist-glow-hover transition-all">
              View Guides & Builds
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
