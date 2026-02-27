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
    'The premier League of Legends Viego champion analytics platform. Master every role with detailed builds, runes, guides, and matchup analysis.',
  keywords: [
    'Viego',
    'League of Legends',
    'Champion Guide',
    'Build Guide',
    'Rune Page',
    'Meta Analysis',
    'Leaderboard',
  ],
  metadataBase: new URL('https://4viegomains.com'),
  openGraph: {
    title: '4ViegoMains — The Ruined King\'s Domain',
    description:
      'The premier League of Legends Viego champion analytics platform.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: '4ViegoMains',
    description:
      'The premier League of Legends Viego champion analytics platform.',
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
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${inter.variable} ${cinzel.variable} ${jetbrainsMono.variable} min-h-screen flex flex-col bg-shadow-black text-gray-100`}
      >
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
