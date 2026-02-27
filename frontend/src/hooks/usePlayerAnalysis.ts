'use client'

import { useState, useCallback, useEffect } from 'react'
import type { PlayerProfile } from '@/lib/types'
import { getPlayerProfile, getCachedData, setCachedData } from '@/lib/api'
import { CACHE_TTL } from '@/lib/constants'
import type { Region } from '@/lib/types'

interface UsePlayerAnalysisOptions {
  name?: string
  tag?: string
  region?: Region
  skip?: boolean
}

export function usePlayerAnalysis({
  name,
  tag,
  region,
  skip = false,
}: UsePlayerAnalysisOptions = {}) {
  const [player, setPlayer] = useState<PlayerProfile | null>(null)
  const [loading, setLoading] = useState(!skip && !!(name && tag && region))
  const [error, setError] = useState<string | null>(null)

  const fetchPlayer = useCallback(async () => {
    if (skip || !name || !tag || !region) return

    const cacheKey = `player:${region}:${name}:${tag}`
    const cached = getCachedData<PlayerProfile>(cacheKey)

    if (cached) {
      setPlayer(cached)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await getPlayerProfile(name, tag, region)

      if (response.success && response.data) {
        setPlayer(response.data)
        setCachedData(cacheKey, response.data, CACHE_TTL.playerProfile)
      } else {
        throw new Error(response.error || 'Failed to fetch player')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      setPlayer(null)
    } finally {
      setLoading(false)
    }
  }, [name, tag, region, skip])

  useEffect(() => {
    fetchPlayer()
  }, [fetchPlayer])

  return {
    player,
    loading,
    error,
    refetch: fetchPlayer,
  }
}
