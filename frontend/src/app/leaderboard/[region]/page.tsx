'use client'

import { useState, useEffect, useCallback } from 'react'
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable'
import { RegionSelector } from '@/components/leaderboard/RegionSelector'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/Loading'
import type { Region } from '@/lib/types'
import type { LeaderboardEntry } from '@/lib/types'
import { REGIONS } from '@/lib/constants'
import { getLeaderboard, getCachedData, setCachedData } from '@/lib/api'
import { CACHE_TTL } from '@/lib/constants'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface LeaderboardPageProps {
  params: Promise<{ region: string }>
}

export default function LeaderboardPage({ params }: LeaderboardPageProps): React.ReactElement {
  const { region: regionParam } = params as any
  const isValidRegion = REGIONS.includes(regionParam as Region)
  const [selectedRegion, setSelectedRegion] = useState<Region>(isValidRegion ? (regionParam as Region) : 'na1')
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)

  const fetchLeaderboard = useCallback(async () => {
    const cacheKey = `leaderboard:${selectedRegion}:${page}`
    const cached = getCachedData<LeaderboardEntry[]>(cacheKey)
    if (cached) {
      setEntries(cached)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await getLeaderboard(selectedRegion, page, 50)
      if (response.success && response.data) {
        setEntries(response.data)
        setCachedData(cacheKey, response.data, CACHE_TTL.leaderboard)
        setTotalPages(response.pagination?.totalPages || 0)
      } else {
        throw new Error((response as any).error || 'Failed to fetch leaderboard')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      setEntries([])
    } finally {
      setLoading(false)
    }
  }, [selectedRegion, page])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

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

        <div className="mb-8">
          <p className="text-sm text-gray-400 mb-4">Select Region:</p>
          <RegionSelector selectedRegion={selectedRegion} onRegionChange={(r) => { setSelectedRegion(r); setPage(1) }} />
        </div>

        {loading ? (
          <LoadingSpinner text="Loading leaderboard..." quote />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchLeaderboard} />
        ) : entries.length === 0 ? (
          <EmptyState title="No leaderboard data" message="Leaderboard data is being compiled. Check back soon." />
        ) : (
          <>
            <LeaderboardTable entries={entries} />

            <div className="mt-6 flex justify-between items-center text-sm text-gray-400">
              <p>Showing {entries.length} players — Page {page}{totalPages > 0 ? ` of ${totalPages}` : ''}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-4 py-2 rounded bg-shadow-light/20 hover:bg-shadow-light/40 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={totalPages > 0 && page >= totalPages}
                  className="px-4 py-2 rounded bg-shadow-light/20 hover:bg-shadow-light/40 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
