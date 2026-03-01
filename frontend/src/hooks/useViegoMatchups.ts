'use client'

import { useState, useCallback, useEffect } from 'react'
import type { Matchup } from '@/lib/types'
import type { Role } from '@/lib/types'
import { getMatchups, getCachedData, setCachedData } from '@/lib/api'
import { CACHE_TTL } from '@/lib/constants'

interface UseViegoMatchupsOptions {
  role?: Role
  page?: number
  limit?: number
  skip?: boolean
}

export function useViegoMatchups({
  role,
  page = 1,
  limit = 20,
  skip = false,
}: UseViegoMatchupsOptions = {}) {
  const [matchups, setMatchups] = useState<Matchup[]>([])
  const [loading, setLoading] = useState(!skip)
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(0)

  const fetchMatchups = useCallback(async () => {
    if (skip) return

    const cacheKey = `matchups:${role || 'all'}:${page}:${limit}`
    const cached = getCachedData<Matchup[]>(cacheKey)

    if (cached) {
      setMatchups(cached)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await getMatchups(role, page, limit)
      if (response.success && response.data) {
        setMatchups(response.data)
        setCachedData(cacheKey, response.data, CACHE_TTL.matchups)
        setTotalPages(response.pagination?.totalPages || 0)
      } else {
        throw new Error((response as any).error || 'Failed to fetch matchups')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      setMatchups([])
    } finally {
      setLoading(false)
    }
  }, [role, page, limit, skip])

  useEffect(() => {
    fetchMatchups()
  }, [fetchMatchups])

  return { matchups, loading, error, totalPages, refetch: fetchMatchups }
}
