import type { Metadata } from 'next'
import { Inter, Cinzel, JetBrains_Mono } from 'next/font/google'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: '4ViegoMains — The Ruined King\'s Domain',
  description:
    'The premier League of Legends Viego champion analytics platform. Master every role with detailed builds, runes, guides, and matchup analysis. Track stats, analyze the meta, and dominate with the Ruined King.',
  keywords: [
    'Viego',
    'League of Legends',
    'Champion Guide',
    'Build Guide',
    'Rune Page',
    'Meta Analysis',
    'Leaderboard',
    'Viego Guide',
    'Viego Builds',
    'Viego Runes',
    'LoL Analytics',
  ],
  metadataBase: new URL('https://4viegomains.com'),
  openGraph: {
    title: '4ViegoMains — The Ruined King\'s Domain',
    description:
      'The premier League of Legends Viego champion analytics platform. Master every role with detailed builds, runes, and guides.',
    type: 'website',
    locale: 'en_US',
    url: 'https://4viegomains.com',
    siteName: '4ViegoMains',
  },
  twitter: {
    card: 'summary_large_image',
    title: '4ViegoMains — The Ruined King\'s Domain',
    description:
      'The premier League of Legends Viego champion analytics platform.',
    creator: '@4viegomains',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0a0a0f" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body
        className={`${inter.variable} ${cinzel.variable} ${jetbrainsMono.variable} min-h-screen flex flex-col bg-shadow-black text-gray-100 relative`}
      >
        {/* Subtle Mist Particle Overlay */}
        <div className="fixed inset-0 pointer-events-none z-0 opacity-5">
          <svg
            className="w-full h-full"
            viewBox="0 0 1200 800"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <filter id="mist-blur" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
              </filter>
              <pattern id="mist-dots" x="40" y="40" width="80" height="80" patternUnits="userSpaceOnUse">
                <circle cx="40" cy="40" r="1.5" fill="#00ff87" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="1200" height="800" fill="url(#mist-dots)" filter="url(#mist-blur)" />
          </svg>
        </div>

        <div className="relative z-10">
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
