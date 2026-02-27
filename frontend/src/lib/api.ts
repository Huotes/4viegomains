import type {
  ApiResponse,
  PaginatedResponse,
  ViegoBuild,
  ViegoRunes,
  Matchup,
  PlayerProfile,
  MatchSummary,
  MetaStats,
  LeaderboardEntry,
  RoleAnalysis,
  MetaTrend,
  PatchImpact,
  PlayerSearchResult,
  Guide,
} from './types'
import type { Role, Region } from './types'
import { ApiError } from './types'
import { API_CONFIG, PAGINATION_DEFAULTS } from './constants'

const baseURL = API_CONFIG.baseUrl

/**
 * Fetch wrapper with error handling
 */
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${baseURL}${endpoint}`

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }))
      throw new ApiError(error.message || 'API request failed', response.status, error.code)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error occurred'
    )
  }
}

/**
 * Builds API
 */

export async function getBuilds(
  role?: Role,
  page: number = 1,
  limit: number = PAGINATION_DEFAULTS.defaultPageSize
): Promise<PaginatedResponse<ViegoBuild>> {
  const params = new URLSearchParams()
  if (role) params.append('role', role)
  params.append('page', page.toString())
  params.append('limit', limit.toString())

  return fetchAPI(`/builds?${params.toString()}`)
}

export async function getBuildByRole(role: Role): Promise<ApiResponse<ViegoBuild>> {
  return fetchAPI(`/builds/${role}`)
}

/**
 * Runes API
 */

export async function getRunes(
  role?: Role,
  page: number = 1,
  limit: number = PAGINATION_DEFAULTS.defaultPageSize
): Promise<PaginatedResponse<ViegoRunes>> {
  const params = new URLSearchParams()
  if (role) params.append('role', role)
  params.append('page', page.toString())
  params.append('limit', limit.toString())

  return fetchAPI(`/runes?${params.toString()}`)
}

export async function getRunesByRole(role: Role): Promise<ApiResponse<ViegoRunes>> {
  return fetchAPI(`/runes/${role}`)
}

/**
 * Matchups API
 */

export async function getMatchups(
  role?: Role,
  page: number = 1,
  limit: number = PAGINATION_DEFAULTS.defaultPageSize
): Promise<PaginatedResponse<Matchup>> {
  const params = new URLSearchParams()
  if (role) params.append('role', role)
  params.append('page', page.toString())
  params.append('limit', limit.toString())

  return fetchAPI(`/matchups?${params.toString()}`)
}

export async function getMatchupsByRole(role: Role): Promise<ApiResponse<Matchup[]>> {
  return fetchAPI(`/matchups/${role}`)
}

/**
 * Player Profile API
 */

export async function getPlayerProfile(
  name: string,
  tag: string,
  region: Region
): Promise<ApiResponse<PlayerProfile>> {
  return fetchAPI(`/players/${region}/${name}/${tag}`)
}

export async function searchPlayers(
  query: string,
  region?: Region,
  limit: number = 10
): Promise<ApiResponse<PlayerSearchResult[]>> {
  const params = new URLSearchParams()
  params.append('q', query)
  if (region) params.append('region', region)
  params.append('limit', limit.toString())

  return fetchAPI(`/players/search?${params.toString()}`)
}

/**
 * Player Matches API
 */

export async function getPlayerMatches(
  summonerId: string,
  region: Region,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<MatchSummary>> {
  const params = new URLSearchParams()
  params.append('page', page.toString())
  params.append('limit', limit.toString())

  return fetchAPI(`/players/${region}/${summonerId}/matches?${params.toString()}`)
}

export async function getMatchDetails(
  matchId: string,
  region: Region
): Promise<ApiResponse<MatchSummary>> {
  return fetchAPI(`/matches/${region}/${matchId}`)
}

/**
 * Leaderboard API
 */

export async function getLeaderboard(
  region: Region,
  page: number = 1,
  limit: number = 50
): Promise<PaginatedResponse<LeaderboardEntry>> {
  const params = new URLSearchParams()
  params.append('page', page.toString())
  params.append('limit', limit.toString())

  return fetchAPI(`/leaderboard/${region}?${params.toString()}`)
}

export async function getGlobalLeaderboard(
  page: number = 1,
  limit: number = 50
): Promise<PaginatedResponse<LeaderboardEntry>> {
  const params = new URLSearchParams()
  params.append('page', page.toString())
  params.append('limit', limit.toString())

  return fetchAPI(`/leaderboard/global?${params.toString()}`)
}

/**
 * Analytics API
 */

export async function getAnalytics(
  role?: Role
): Promise<ApiResponse<MetaStats>> {
  const params = new URLSearchParams()
  if (role) params.append('role', role)

  return fetchAPI(`/analytics?${params.toString()}`)
}

export async function getRoleAnalysis(role: Role): Promise<ApiResponse<RoleAnalysis>> {
  return fetchAPI(`/analytics/roles/${role}`)
}

export async function getMetaTrend(
  days: number = 30
): Promise<ApiResponse<MetaTrend[]>> {
  const params = new URLSearchParams()
  params.append('days', days.toString())

  return fetchAPI(`/analytics/trend?${params.toString()}`)
}

export async function getPatchImpact(
  patchVersion?: string
): Promise<ApiResponse<PatchImpact>> {
  const params = new URLSearchParams()
  if (patchVersion) params.append('patch', patchVersion)

  return fetchAPI(`/analytics/patch-impact?${params.toString()}`)
}

/**
 * Guides API
 */

export async function getGuides(
  role?: Role,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<Guide>> {
  const params = new URLSearchParams()
  if (role) params.append('role', role)
  params.append('page', page.toString())
  params.append('limit', limit.toString())

  return fetchAPI(`/guides?${params.toString()}`)
}

export async function getGuideById(guideId: string): Promise<ApiResponse<Guide>> {
  return fetchAPI(`/guides/${guideId}`)
}

export async function getGuidesByRole(role: Role): Promise<ApiResponse<Guide[]>> {
  return fetchAPI(`/guides/role/${role}`)
}

/**
 * Health Check API
 */

export async function healthCheck(): Promise<ApiResponse<{ status: string }>> {
  return fetchAPI('/health')
}

/**
 * Stats Tracking API (optional)
 */

export async function recordViewEvent(
  resourceType: string,
  resourceId: string
): Promise<ApiResponse<{ recorded: boolean }>> {
  return fetchAPI('/events/view', {
    method: 'POST',
    body: JSON.stringify({ resourceType, resourceId }),
  })
}

/**
 * Cache utility for client-side caching
 */
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

const cache = new Map<string, CacheEntry<unknown>>()

export function getCachedData<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined
  if (!entry) return null

  const now = Date.now()
  if (now - entry.timestamp > entry.ttl * 60 * 1000) {
    cache.delete(key)
    return null
  }

  return entry.data
}

export function setCachedData<T>(key: string, data: T, ttlMinutes: number): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMinutes,
  })
}

export function clearCache(pattern?: string): void {
  if (!pattern) {
    cache.clear()
    return
  }

  const regex = new RegExp(pattern)
  for (const key of cache.keys()) {
    if (regex.test(key)) {
      cache.delete(key)
    }
  }
}

/**
 * Type guard for API errors
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}
