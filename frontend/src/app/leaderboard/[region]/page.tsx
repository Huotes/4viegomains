'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable'
import { RegionSelector } from '@/components/leaderboard/RegionSelector'
import type { Region } from '@/lib/types'
import { REGIONS, REGION_LABELS } from '@/lib/constants'
import { getMockLeaderboard } from '@/lib/mockData'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface LeaderboardPageProps {
  params: Promise<{
    region: string
  }>
}

export default function LeaderboardPage({ params }: LeaderboardPageProps): React.ReactElement {
  const { region: regionParam } = params as any
  const isValidRegion = REGIONS.includes(regionParam as Region)
  const [selectedRegion, setSelectedRegion] = useState<Region>(isValidRegion ? (regionParam as Region) : 'na1')

  const leaderboard = getMockLeaderboard()

  return (
    <div className="min-h-screen bg-gradient-to-b from-shadow-black to-shadow-dark">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2 text-mist-cyan hover:text-mist-green mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <h1 className="font-cinzel text-4xl font-bold gradient-text-soul mb-2">Viego Leaderboard</h1>
          <p className="text-gray-400">Top Viego OTP players across all regions</p>
        </div>

        {/* Region Selector */}
        <div className="mb-8">
          <p className="text-sm text-gray-400 mb-4">Select Region:</p>
          <RegionSelector selectedRegion={selectedRegion} onRegionChange={setSelectedRegion} />
        </div>

        {/* Leaderboard Table */}
        <LeaderboardTable entries={leaderboard} />

        {/* Pagination Info */}
        <div className="mt-6 flex justify-between items-center text-sm text-gray-400">
          <p>Showing 1-50 of {leaderboard.length} players</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded bg-shadow-light/20 hover:bg-shadow-light/40 disabled:opacity-50" disabled>
              Previous
            </button>
            <span className="px-4 py-2">Page 1</span>
            <button className="px-4 py-2 rounded bg-shadow-light/20 hover:bg-shadow-light/40">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
