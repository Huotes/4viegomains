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
 * Fetch wrapper with error handling and timeout
 */
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${baseURL}${endpoint}`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }))
      throw new ApiError(error.message || 'API request failed', response.status, error.code)
    }

    return await response.json()
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof ApiError) {
      throw error
    }
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('Request timed out', 408)
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error occurred'
    )
  }
}

// ──────────────────────────────────────────────
// Champion Service Endpoints (champion-svc:8082)
// Nginx: /api/v1/champion/ → champion-svc
// ──────────────────────────────────────────────

export async function getBuilds(
  role?: Role,
  page: number = 1,
  limit: number = PAGINATION_DEFAULTS.defaultPageSize
): Promise<PaginatedResponse<ViegoBuild>> {
  const params = new URLSearchParams()
  if (role) params.append('role', role)
  params.append('page', page.toString())
  params.append('limit', limit.toString())
  return fetchAPI(`/champion/builds?${params.toString()}`)
}

export async function getBuildByRole(role: Role): Promise<ApiResponse<ViegoBuild>> {
  return fetchAPI(`/champion/builds?role=${role}`)
}

export async function getRunes(
  role?: Role,
  page: number = 1,
  limit: number = PAGINATION_DEFAULTS.defaultPageSize
): Promise<PaginatedResponse<ViegoRunes>> {
  const params = new URLSearchParams()
  if (role) params.append('role', role)
  params.append('page', page.toString())
  params.append('limit', limit.toString())
  return fetchAPI(`/champion/runes?${params.toString()}`)
}

export async function getRunesByRole(role: Role): Promise<ApiResponse<ViegoRunes>> {
  return fetchAPI(`/champion/runes?role=${role}`)
}

export async function getMatchups(
  role?: Role,
  page: number = 1,
  limit: number = PAGINATION_DEFAULTS.defaultPageSize
): Promise<PaginatedResponse<Matchup>> {
  const params = new URLSearchParams()
  if (role) params.append('role', role)
  params.append('page', page.toString())
  params.append('limit', limit.toString())
  return fetchAPI(`/champion/counters?${params.toString()}`)
}

export async function getMatchupsByRole(role: Role): Promise<ApiResponse<Matchup[]>> {
  return fetchAPI(`/champion/counters?role=${role}`)
}

export async function getChampionStats(role?: Role): Promise<ApiResponse<MetaStats>> {
  const params = new URLSearchParams()
  if (role) params.append('role', role)
  return fetchAPI(`/champion/stats?${params.toString()}`)
}

export async function getItems(
  role?: Role,
  stage?: string
): Promise<ApiResponse<any>> {
  const params = new URLSearchParams()
  if (role) params.append('role', role)
  if (stage) params.append('stage', stage)
  return fetchAPI(`/champion/items?${params.toString()}`)
}

export async function getSkills(role?: Role): Promise<ApiResponse<any>> {
  const params = new URLSearchParams()
  if (role) params.append('role', role)
  return fetchAPI(`/champion/skills?${params.toString()}`)
}

export async function getSummonerSpells(role?: Role): Promise<ApiResponse<any>> {
  const params = new URLSearchParams()
  if (role) params.append('role', role)
  return fetchAPI(`/champion/summoner-spells?${params.toString()}`)
}

// ──────────────────────────────────────────────
// Player Service Endpoints (player-svc:8083)
// Nginx: /api/v1/player/ → player-svc
// ──────────────────────────────────────────────

export async function getPlayerProfile(
  name: string,
  tag: string,
  region: Region
): Promise<ApiResponse<PlayerProfile>> {
  return fetchAPI(`/player/${region}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}/profile`)
}

export async function getPlayerMatches(
  name: string,
  tag: string,
  region: Region,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<MatchSummary>> {
  const params = new URLSearchParams()
  params.append('page', page.toString())
  params.append('limit', limit.toString())
  return fetchAPI(`/player/${region}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}/matches?${params.toString()}`)
}

export async function getPlayerPerformance(
  name: string,
  tag: string,
  region: Region
): Promise<ApiResponse<any>> {
  return fetchAPI(`/player/${region}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}/performance`)
}

export async function getPlayerRoles(
  name: string,
  tag: string,
  region: Region
): Promise<ApiResponse<any>> {
  return fetchAPI(`/player/${region}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}/roles`)
}

export async function getPlayerTrends(
  name: string,
  tag: string,
  region: Region
): Promise<ApiResponse<any>> {
  return fetchAPI(`/player/${region}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}/trends`)
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
  return fetchAPI(`/player/search?${params.toString()}`)
}

// ──────────────────────────────────────────────
// Leaderboard Service Endpoints (leaderboard-svc:8085)
// Nginx: /api/v1/leaderboard/ → leaderboard-svc
// Note: Currently a stub — returns placeholder data
// ──────────────────────────────────────────────

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

// ──────────────────────────────────────────────
// Analytics Service Endpoints (analytics-svc:8084)
// Nginx: /api/v1/analytics/ → analytics-svc
// Note: Currently a stub — fallback to champion-svc /stats
// ──────────────────────────────────────────────

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

// ──────────────────────────────────────────────
// Content Service Endpoints (content-svc:8086)
// Nginx: /api/v1/content/ → content-svc
// Note: Currently a stub
// ──────────────────────────────────────────────

export async function getGuides(
  role?: Role,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<Guide>> {
  const params = new URLSearchParams()
  if (role) params.append('role', role)
  params.append('page', page.toString())
  params.append('limit', limit.toString())
  return fetchAPI(`/content/guides?${params.toString()}`)
}

export async function getGuideById(guideId: string): Promise<ApiResponse<Guide>> {
  return fetchAPI(`/content/guides/${guideId}`)
}

export async function getGuidesByRole(role: Role): Promise<ApiResponse<Guide[]>> {
  return fetchAPI(`/content/guides/role/${role}`)
}

// ──────────────────────────────────────────────
// Health Check
// ──────────────────────────────────────────────

export async function healthCheck(): Promise<ApiResponse<{ status: string }>> {
  return fetchAPI('/health')
}

// ──────────────────────────────────────────────
// Client-side Cache Utility
// ──────────────────────────────────────────────

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

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}
