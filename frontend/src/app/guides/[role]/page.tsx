'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { RoleBadge } from '@/components/ui/Badge'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/Loading'
import type { Role, Guide } from '@/lib/types'
import { ROLE_LABELS, ROLES, CACHE_TTL } from '@/lib/constants'
import { getGuidesByRole, getCachedData, setCachedData } from '@/lib/api'
import Link from 'next/link'
import { ArrowLeft, Eye, ThumbsUp } from 'lucide-react'

interface GuidesPageProps {
  params: Promise<{ role: string }>
}

export default function GuidesPage({ params }: GuidesPageProps): React.ReactElement {
  const { role: roleParam } = params as any
  const role = roleParam as Role
  const isValidRole = ROLES.includes(role)

  const [guides, setGuides] = useState<Guide[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGuides = useCallback(async () => {
    if (!isValidRole) {
      setLoading(false)
      return
    }

    const cacheKey = `guides:${role}`
    const cached = getCachedData<Guide[]>(cacheKey)
    if (cached) {
      setGuides(cached)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await getGuidesByRole(role)
      if (response.success && response.data) {
        setGuides(response.data)
        setCachedData(cacheKey, response.data, CACHE_TTL.guide)
      } else {
        throw new Error(response.error || 'Failed to fetch guides')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      setGuides([])
    } finally {
      setLoading(false)
    }
  }, [role, isValidRole])

  useEffect(() => {
    fetchGuides()
  }, [fetchGuides])

  if (!isValidRole) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-shadow-black to-shadow-dark flex items-center justify-center">
        <Card>
          <CardContent className="text-center">
            <p className="text-red-400 font-semibold">Invalid role: {roleParam}</p>
            <p className="text-gray-400 mt-2">Valid roles: {ROLES.join(', ')}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-shadow-black to-shadow-dark">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2 text-mist-cyan hover:text-mist-green mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <h1 className="font-cinzel text-4xl font-bold gradient-text-soul">{ROLE_LABELS[role]} Guides</h1>
            <RoleBadge role={role} />
          </div>
          <p className="text-gray-400">Expert guides and tutorials for mastering Viego in {ROLE_LABELS[role]}.</p>
        </div>

        <div className="flex gap-2 mb-8 flex-wrap">
          {ROLES.map((r) => (
            <Link key={r} href={`/guides/${r}`}>
              <button className={`px-4 py-2 rounded-lg font-semibold transition-all ${role === r ? 'bg-mist-green/20 text-mist-green border border-mist-green' : 'bg-shadow-light/20 text-gray-400 border border-shadow-light/50'}`}>
                {ROLE_LABELS[r]}
              </button>
            </Link>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner text="Loading guides..." quote />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchGuides} />
        ) : guides.length === 0 ? (
          <EmptyState title="No guides available" message={`No guides for ${ROLE_LABELS[role]} yet. Check back soon!`} />
        ) : (
          <div className="space-y-6">
            {guides.map((guide) => (
              <Card key={guide.id} glow="mist" className="hover:shadow-lg transition-all">
                <CardContent className="space-y-4">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex-1 min-w-max">
                      <h3 className="font-cinzel text-2xl font-bold mb-2">{guide.title}</h3>
                      <p className="text-sm text-gray-400 mb-3">{guide.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>By {guide.author}</span>
                        <span>Updated {new Date(guide.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 text-right">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Eye className="h-4 w-4" />
                        <span>{guide.views.toLocaleString()} views</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-mist-green">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{guide.helpful.toLocaleString()} helpful</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
