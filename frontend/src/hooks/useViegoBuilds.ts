'use client'

import { useState, useCallback, useEffect } from 'react'
import type { ViegoBuild } from '@/lib/types'
import { getBuilds, getCachedData, setCachedData } from '@/lib/api'
import { CACHE_TTL } from '@/lib/constants'
import type { Role } from '@/lib/types'

interface UseViegoBuildsOptions {
  role?: Role
  page?: number
  limit?: number
  skip?: boolean
}

export function useViegoBuilds({
  role,
  page = 1,
  limit = 20,
  skip = false,
}: UseViegoBuildsOptions = {}) {
  const [builds, setBuilds] = useState<ViegoBuild[]>([])
  const [loading, setLoading] = useState(!skip)
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(0)

  const fetchBuilds = useCallback(async () => {
    if (skip) return

    const cacheKey = `builds:${role || 'all'}:${page}:${limit}`
    const cached = getCachedData<ViegoBuild[]>(cacheKey)

    if (cached) {
      setBuilds(cached)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await getBuilds(role, page, limit)

      if (response.success && response.data) {
        setBuilds(response.data)
        setCachedData(cacheKey, response.data, CACHE_TTL.builds)
        setTotalPages(response.pagination.totalPages)
      } else {
        throw new Error(response.error || 'Failed to fetch builds')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      setBuilds([])
    } finally {
      setLoading(false)
    }
  }, [role, page, limit, skip])

  useEffect(() => {
    fetchBuilds()
  }, [fetchBuilds])

  return {
    builds,
    loading,
    error,
    totalPages,
    refetch: fetchBuilds,
  }
}
