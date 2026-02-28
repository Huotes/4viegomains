'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function LorePage(): React.ReactElement {
  const loreQuotes = [
    'Eu sou a ruína.',
    'The Necropolis is my kingdom, and death, my throne.',
    'Every soul I collect makes me stronger.',
    'My isolation is my strength.',
    'The forgotten people serve my purpose.',
    'Ruin walks among you.',
  ]

  const loreTimeline = [
    {
      period: 'Ancient Times',
      title: 'The Ruined King\'s Ascension',
      description: 'Viego rose to power as a magnificent ruler of the Shadow Isles, commanding an empire of souls.',
    },
    {
      period: 'The Ruination',
      title: 'Fall Into Darkness',
      description: 'Consumed by an ancient curse, Viego was transformed into something neither living nor dead.',
    },
    {
      period: 'The Shadow Isles',
      title: 'Master of the Dead',
      description: 'Now ruling over the spectral realm, Viego commands legions of possessed spirits.',
    },
    {
      period: 'Present Day',
      title: 'The Eternal Struggle',
      description: 'Still seeking to expand his dominion, Viego possesses champions on the Fields of Justice.',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-shadow-black to-shadow-dark overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-ruination-purple/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-mist-green/5 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/" className="flex items-center gap-2 text-mist-cyan hover:text-mist-green mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Hero Section */}
        <div className="mb-16 text-center">
          <h1 className="font-cinzel text-5xl md:text-6xl font-bold gradient-text-ruination mb-4">
            The Ruined King
          </h1>
          <p className="text-2xl text-mist-green soul-shimmer mb-8">{loreQuotes[0]}</p>
          <Badge variant="default">Shadow Isles</Badge>
        </div>

        {/* Main Lore Content */}
        <div className="space-y-8">
          {/* Origin */}
          <Card glow="ruination">
            <CardHeader>
              <CardTitle className="text-3xl">Origin</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300 leading-relaxed">
                Viego was once a powerful and magnificent ruler, commanding vast territories and untold riches. He wielded both political might and arcane power, 
                respected and feared by his enemies. But pride and ambition would become his undoing, leading him down a path of darkness.
              </p>
              <p className="text-gray-300 leading-relaxed">
                An ancient curse, born from forbidden magic and his own hubris, began to consume him from within. What started as whispers of power became 
                screams of anguish as he was transformed into something neither fully living nor completely dead.
              </p>
            </CardContent>
          </Card>

          {/* The Transformation */}
          <Card glow="mist">
            <CardHeader>
              <CardTitle className="text-3xl">The Transformation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300 leading-relaxed">
                As the curse consumed his mortal form, Viego discovered an unholy truth: death was not an ending for him, but a beginning. 
                His body became a vessel for spectral power, capable of possessing the bodies and souls of others.
              </p>
              <p className="text-gray-300 leading-relaxed">
                The Shadow Isles themselves answered his call, ancient and malevolent magic rising to acknowledge their new master. 
                Viego was no longer bound by mortality or flesh—he had become eternal.
              </p>
            </CardContent>
          </Card>

          {/* The Eternal Quest */}
          <Card glow="ruination">
            <CardHeader>
              <CardTitle className="text-3xl">The Eternal Quest for Domination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300 leading-relaxed">
                Trapped between worlds, Viego uses his power of possession to expand his influence across Runeterra. 
                Every champion he possesses becomes a vessel for his will, their power channeled through his spectral form.
              </p>
              <p className="text-gray-300 leading-relaxed">
                On the Fields of Justice, Viego fights not for victory or honor, but to grow ever stronger by consuming the power of those he defeats. 
                Each battle is another step in his endless quest for complete dominion.
              </p>

              <div className="bg-shadow-light/20 rounded-lg p-4 border border-mist-cyan/30 mt-6">
                <p className="text-mist-cyan text-center text-lg soul-shimmer italic">
                  "Every soul I collect makes me more than I was. Every body I inhabit brings me closer to true immortality."
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <div>
            <h2 className="font-cinzel text-3xl font-bold mb-6 text-mist-green">Timeline of Events</h2>
            <div className="space-y-4">
              {loreTimeline.map((event, idx) => (
                <Card key={idx} glow={idx % 2 === 0 ? 'mist' : 'ruination'}>
                  <CardContent className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-shadow-light to-shadow-medium flex items-center justify-center">
                        <span className="text-xl font-cinzel font-bold text-mist-green">{idx + 1}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-mist-cyan uppercase tracking-wider mb-1">{event.period}</p>
                      <h3 className="font-cinzel text-xl font-bold mb-2">{event.title}</h3>
                      <p className="text-gray-400">{event.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Powers */}
          <Card glow="mist">
            <CardHeader>
              <CardTitle className="text-3xl">Powers & Abilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    name: 'Spectral Possession',
                    description: 'Can inhabit and control the bodies of defeated champions to utilize their abilities.',
                  },
                  {
                    name: 'Soul Extraction',
                    description: 'Drains the life force and power from enemies, growing stronger with each soul claimed.',
                  },
                  {
                    name: 'Shadow Manipulation',
                    description: 'Commands the shadows of the Shadow Isles, bending darkness to his will.',
                  },
                  {
                    name: 'Eternal Existence',
                    description: 'Neither fully alive nor dead, existing between life and death itself.',
                  },
                ].map((power, idx) => (
                  <div key={idx} className="bg-shadow-light/20 rounded-lg p-4 border border-shadow-light/50">
                    <h4 className="font-semibold text-mist-green mb-2">{power.name}</h4>
                    <p className="text-sm text-gray-400">{power.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Famous Quotes */}
          <Card glow="ruination">
            <CardHeader>
              <CardTitle className="text-3xl">The Words of Viego</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loreQuotes.map((quote, idx) => (
                <div key={idx} className="border-l-4 border-ruination-purple pl-4 py-2">
                  <p className="text-gray-300 italic text-lg">"{quote}"</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Related Champions */}
        <div className="mt-16">
          <h2 className="font-cinzel text-3xl font-bold mb-6 text-mist-green">Related Champions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Thresh', 'Kalista', 'Hecarim'].map((champ) => (
              <Card key={champ} glow="mist">
                <CardContent className="text-center py-8">
                  <div className="text-4xl mb-4">👻</div>
                  <h3 className="font-cinzel text-xl font-bold mb-2">{champ}</h3>
                  <p className="text-sm text-gray-400">Shadow Isles</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
