/**
 * Core Champion Data Types
 */
export type Role = 'top' | 'jungle' | 'mid' | 'bot' | 'support'
export type Region = 'na1' | 'euw1' | 'kr' | 'br1' | 'jp1' | 'ru' | 'oc1' | 'tr1'
export type EloTier = 'IRON' | 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND' | 'MASTER' | 'GRANDMASTER' | 'CHALLENGER'

/**
 * Item & Build Types
 */
export interface Item {
  id: number
  name: string
  description: string
  icon: string
  cost: number
  builds: number
  winRate: number
  pickRate: number
}

export interface ViegoBuild {
  id: string
  name: string
  role: Role
  items: Item[]
  winRate: number
  pickRate: number
  matchCount: number
  lastUpdated: string
}

/**
 * Rune Types
 */
export interface Rune {
  id: number
  name: string
  description: string
  icon: string
}

export interface RuneTree {
  id: number
  name: string
  icon: string
  description: string
  runes: Rune[]
}

export interface ViegoRunes {
  id: string
  role: Role
  primary: RuneTree
  secondary: RuneTree
  shards: Rune[]
  winRate: number
  pickRate: number
  matchCount: number
  lastUpdated: string
}

/**
 * Skill Order Types
 */
export interface SkillOrder {
  ability: 'Q' | 'W' | 'E' | 'R'
  level: number
}

/**
 * Matchup Types
 */
export interface Matchup {
  id: string
  enemyChampionId: number
  enemyChampionName: string
  enemyChampionIcon: string
  role: Role
  winRate: number
  matchCount: number
  difficulty: 'easy' | 'medium' | 'hard'
  tips: string[]
}

/**
 * Player Profile Types
 */
export interface MatchSummary {
  matchId: string
  timestamp: string
  duration: number
  result: 'win' | 'loss'
  role: Role
  kills: number
  deaths: number
  assists: number
  cs: number
  gold: number
  itemBuild: Item[]
  runes: ViegoRunes
}

export interface PerformanceIndex {
  laning: number
  teamfight: number
  macroplay: number
  cs: number
  kda: number
  overall: number
}

export interface PlayerProfile {
  summonerId: string
  puuid: string
  name: string
  tag: string
  region: Region
  level: number
  profileIcon: number
  rank: {
    tier: EloTier
    rank: string
    leaguePoints: number
    wins: number
    losses: number
  }
  viegoMastery: {
    championId: number
    championLevel: number
    championPoints: number
    lastPlayTime: string
  }
  recentMatches: MatchSummary[]
  stats: {
    winRate: number
    kda: number
    avgCs: number
    avgGold: number
    avgDamage: number
    avgDamageTaken: number
  }
  performanceIndex: PerformanceIndex
  otpScore: number
}

/**
 * Analytics Types
 */
export interface RoleAnalysis {
  role: Role
  winRate: number
  pickRate: number
  banRate: number
  avgKda: number
  avgCs: number
  avgGold: number
  itemPopularity: { itemName: string; pickRate: number }[]
  runePopularity: { runeName: string; pickRate: number }[]
  matchCount: number
}

export interface MetaStats {
  timestamp: string
  overallWinRate: number
  overallPickRate: number
  overallBanRate: number
  byRole: Record<Role, RoleAnalysis>
  topBuildByRole: Record<Role, ViegoBuild>
  topRunesByRole: Record<Role, ViegoRunes>
  topMatchups: Matchup[]
  patchVersion: string
}

/**
 * Leaderboard Types
 */
export interface OTPScore {
  matchCount: number
  winRate: number
  avgKda: number
  totalMastery: number
  consistency: number
  overall: number
}

export interface LeaderboardEntry {
  rank: number
  summonerId: string
  puuid: string
  name: string
  tag: string
  region: Region
  tier: EloTier
  rank_: string
  leaguePoints: number
  viegoMastery: number
  otpScore: OTPScore
  lastUpdated: string
}

/**
 * Trend Types
 */
export interface MetaTrend {
  date: string
  winRate: number
  pickRate: number
  banRate: number
  avgKda: number
}

export interface PatchImpact {
  patchVersion: string
  releaseDate: string
  changes: string[]
  winRateChange: number
  pickRateChange: number
  banRateChange: number
  impact: 'buffed' | 'nerfed' | 'unchanged'
}

/**
 * API Response Types
 */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
  timestamp: string
}

/**
 * Search Types
 */
export interface PlayerSearchResult {
  summonerId: string
  puuuid: string
  name: string
  tag: string
  region: Region
  level: number
  profileIcon: number
  viegoMastery: number
}

/**
 * Guide Types
 */
export interface Guide {
  id: string
  role: Role
  title: string
  author: string
  description: string
  content: string
  build: ViegoBuild
  runes: ViegoRunes
  matchups: Matchup[]
  createdAt: string
  updatedAt: string
  views: number
  helpful: number
}

/**
 * Error Types
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
