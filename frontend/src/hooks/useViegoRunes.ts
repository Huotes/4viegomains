'use client'

import { useState, useCallback, useEffect } from 'react'
import type { ViegoRunes } from '@/lib/types'
import type { Role } from '@/lib/types'
import { getRunes, getCachedData, setCachedData } from '@/lib/api'
import { CACHE_TTL } from '@/lib/constants'

interface UseViegoRunesOptions {
  role?: Role
  page?: number
  limit?: number
  skip?: boolean
}

export function useViegoRunes({
  role,
  page = 1,
  limit = 20,
  skip = false,
}: UseViegoRunesOptions = {}) {
  const [runes, setRunes] = useState<ViegoRunes[]>([])
  const [loading, setLoading] = useState(!skip)
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(0)

  const fetchRunes = useCallback(async () => {
    if (skip) return

    const cacheKey = `runes:${role || 'all'}:${page}:${limit}`
    const cached = getCachedData<ViegoRunes[]>(cacheKey)

    if (cached) {
      setRunes(cached)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await getRunes(role, page, limit)
      if (response.success && response.data) {
        setRunes(response.data)
        setCachedData(cacheKey, response.data, CACHE_TTL.runes)
        setTotalPages(response.pagination?.totalPages || 0)
      } else {
        throw new Error((response as any).error || 'Failed to fetch runes')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      setRunes([])
    } finally {
      setLoading(false)
    }
  }, [role, page, limit, skip])

  useEffect(() => {
    fetchRunes()
  }, [fetchRunes])

  return { runes, loading, error, totalPages, refetch: fetchRunes }
}
