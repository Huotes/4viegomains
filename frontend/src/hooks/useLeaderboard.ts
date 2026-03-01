'use client'

import { useState, useCallback, useEffect } from 'react'
import type { LeaderboardEntry } from '@/lib/types'
import { getLeaderboard, getCachedData, setCachedData } from '@/lib/api'
import { CACHE_TTL } from '@/lib/constants'
import type { Region } from '@/lib/types'

interface UseLeaderboardOptions {
  region?: Region
  page?: number
  limit?: number
  skip?: boolean
}

export function useLeaderboard({
  region,
  page = 1,
  limit = 50,
  skip = false,
}: UseLeaderboardOptions = {}) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(!skip && !!region)
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(0)
  const [total, setTotal] = useState(0)

  const fetchLeaderboard = useCallback(async () => {
    if (skip || !region) return

    const cacheKey = `leaderboard:${region}:${page}:${limit}`
    const cached = getCachedData<LeaderboardEntry[]>(cacheKey)

    if (cached) {
      setEntries(cached)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await getLeaderboard(region, page, limit)

      if (response.success && response.data) {
        setEntries(response.data)
        setCachedData(cacheKey, response.data, CACHE_TTL.leaderboard)
        setTotalPages(response.pagination.totalPages)
        setTotal(response.pagination.total)
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
  }, [region, page, limit, skip])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  return {
    entries,
    loading,
    error,
    totalPages,
    total,
    refetch: fetchLeaderboard,
  }
}
