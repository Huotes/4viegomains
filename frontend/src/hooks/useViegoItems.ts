'use client'

import { useState, useCallback, useEffect } from 'react'
import type { Role } from '@/lib/types'
import { getItems, getCachedData, setCachedData } from '@/lib/api'
import { CACHE_TTL } from '@/lib/constants'

interface UseViegoItemsOptions {
  role?: Role
  stage?: string
  skip?: boolean
}

export function useViegoItems({
  role,
  stage,
  skip = false,
}: UseViegoItemsOptions = {}) {
  const [items, setItems] = useState<any>(null)
  const [loading, setLoading] = useState(!skip)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = useCallback(async () => {
    if (skip) return

    const cacheKey = `items:${role || 'all'}:${stage || 'all'}`
    const cached = getCachedData<any>(cacheKey)

    if (cached) {
      setItems(cached)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await getItems(role, stage)
      if (response.success && response.data) {
        setItems(response.data)
        setCachedData(cacheKey, response.data, CACHE_TTL.builds)
      } else {
        throw new Error(response.error || 'Failed to fetch items')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      setItems(null)
    } finally {
      setLoading(false)
    }
  }, [role, stage, skip])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  return { items, loading, error, refetch: fetchItems }
}
