'use client'

import { useState, useCallback, useEffect } from 'react'
import type { MetaStats } from '@/lib/types'
import type { Role } from '@/lib/types'
import { getChampionStats, getCachedData, setCachedData } from '@/lib/api'
import { CACHE_TTL } from '@/lib/constants'

interface UseChampionStatsOptions {
  role?: Role
  skip?: boolean
}

export function useChampionStats({ role, skip = false }: UseChampionStatsOptions = {}) {
  const [stats, setStats] = useState<MetaStats | null>(null)
  const [loading, setLoading] = useState(!skip)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    if (skip) return

    const cacheKey = `champion-stats:${role || 'all'}`
    const cached = getCachedData<MetaStats>(cacheKey)

    if (cached) {
      setStats(cached)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await getChampionStats(role)
      if (response.success && response.data) {
        setStats(response.data)
        setCachedData(cacheKey, response.data, CACHE_TTL.analytics)
      } else {
        throw new Error(response.error || 'Failed to fetch stats')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      setStats(null)
    } finally {
      setLoading(false)
    }
  }, [role, skip])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, error, refetch: fetchStats }
}
