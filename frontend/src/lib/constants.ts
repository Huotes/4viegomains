import type { Role, Region, EloTier } from './types'

/**
 * League of Legends Constants for Viego Analytics
 */

export const VIEGO_CHAMPION_ID = 234

export const ROLES: Role[] = ['top', 'jungle', 'mid', 'bot', 'support']

export const ROLE_LABELS: Record<Role, string> = {
  top: 'Top Lane',
  jungle: 'Jungle',
  mid: 'Mid Lane',
  bot: 'Bot Lane (ADC)',
  support: 'Support',
}

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  top: 'Top laner - sustained trades and map pressure',
  jungle: 'Jungler - ganks, objective control, and counter jungling',
  mid: 'Mid laner - roaming, wave clear, and skirmishes',
  bot: 'ADC - damage scaling and teamfight positioning',
  support: 'Support - utility, peel, and vision control',
}

export const REGIONS: Region[] = [
  'na1',
  'euw1',
  'kr',
  'br1',
  'jp1',
  'ru',
  'oc1',
  'tr1',
]

export const REGION_LABELS: Record<Region, string> = {
  na1: 'North America',
  euw1: 'Europe West',
  kr: 'Korea',
  br1: 'Brazil',
  jp1: 'Japan',
  ru: 'Russia',
  oc1: 'Oceania',
  tr1: 'Turkey',
}

export const REGION_CLUSTERS: Record<Region, string> = {
  na1: 'americas',
  br1: 'americas',
  euw1: 'europe',
  ru: 'europe',
  tr1: 'europe',
  kr: 'asia',
  jp1: 'asia',
  oc1: 'sea',
}

export const ELO_TIERS: EloTier[] = [
  'IRON',
  'BRONZE',
  'SILVER',
  'GOLD',
  'PLATINUM',
  'DIAMOND',
  'MASTER',
  'GRANDMASTER',
  'CHALLENGER',
]

export const ELO_TIER_LABELS: Record<EloTier, string> = {
  IRON: 'Iron',
  BRONZE: 'Bronze',
  SILVER: 'Silver',
  GOLD: 'Gold',
  PLATINUM: 'Platinum',
  DIAMOND: 'Diamond',
  MASTER: 'Master',
  GRANDMASTER: 'Grandmaster',
  CHALLENGER: 'Challenger',
}

export const TIER_COLORS: Record<EloTier, string> = {
  IRON: '#5c5559',
  BRONZE: '#b3633f',
  SILVER: '#a8a8a8',
  GOLD: '#c89b3c',
  PLATINUM: '#3f956f',
  DIAMOND: '#0891b2',
  MASTER: '#7c4dff',
  GRANDMASTER: '#ff6b6b',
  CHALLENGER: '#ffd54f',
}

export const TIER_GRADIENTS: Record<EloTier, string> = {
  IRON: 'from-gray-600 to-gray-700',
  BRONZE: 'from-orange-700 to-orange-800',
  SILVER: 'from-gray-300 to-gray-400',
  GOLD: 'from-yellow-500 to-yellow-600',
  PLATINUM: 'from-green-500 to-emerald-600',
  DIAMOND: 'from-cyan-400 to-blue-500',
  MASTER: 'from-purple-500 to-purple-600',
  GRANDMASTER: 'from-red-500 to-red-600',
  CHALLENGER: 'from-yellow-400 to-yellow-500',
}

export const SHADOW_ISLES_COLORS = {
  shadowBlack: '#0a0a0f',
  shadowDark: '#121218',
  shadowMedium: '#1a1a24',
  shadowLight: '#252533',
  mistGreen: '#00ff87',
  mistCyan: '#00e5ff',
  ruinationBlue: '#4fc3f7',
  ruinationPurple: '#7c4dff',
  soulGold: '#ffd54f',
} as const

export const DIFFICULTY_COLORS: Record<'easy' | 'medium' | 'hard', string> = {
  easy: '#00ff87',
  medium: '#ffd54f',
  hard: '#ff6b6b',
}

export const DIFFICULTY_LABELS: Record<'easy' | 'medium' | 'hard', string> = {
  easy: 'Favorable',
  medium: 'Even',
  hard: 'Difficult',
}

/**
 * API Configuration
 */
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  timeout: 30000,
  retries: 3,
} as const

/**
 * Cache Configuration (in minutes)
 */
export const CACHE_TTL = {
  builds: 30,
  runes: 30,
  matchups: 30,
  playerProfile: 5,
  playerMatches: 5,
  leaderboard: 15,
  analytics: 60,
  guide: 120,
} as const

/**
 * Pagination
 */
export const PAGINATION_DEFAULTS = {
  defaultPageSize: 20,
  maxPageSize: 100,
} as const

/**
 * Match Duration Categories (in seconds)
 */
export const MATCH_DURATION_CATEGORIES = {
  short: { min: 0, max: 1200, label: 'Short (0-20m)' },
  medium: { min: 1200, max: 2400, label: 'Medium (20-40m)' },
  long: { min: 2400, max: Infinity, label: 'Long (40m+)' },
} as const

/**
 * KDA Thresholds for Performance
 */
export const KDA_THRESHOLDS = {
  excellent: 4.0,
  good: 2.5,
  average: 1.5,
  poor: 0,
} as const

/**
 * CS Per Minute Thresholds by Role
 */
export const CS_THRESHOLDS: Record<Role, number> = {
  top: 6.0,
  jungle: 4.5,
  mid: 6.5,
  bot: 6.0,
  support: 1.5,
}

/**
 * Viego Lore References
 */
export const VIEGO_QUOTES = {
  main: 'Eu sou a ruína.',
  quotes: [
    'A Necrópole é meu reino, e a morte, meu trono.',
    'Cada alma que coleto me torna mais poderoso.',
    'Meu isolamento é minha força.',
    'O povo esquecido serve a meu propósito.',
    'A ruína caminha entre vocês.',
  ],
}

/**
 * Viego Champion Information
 */
export const VIEGO_INFO = {
  name: 'Viego',
  title: 'The Ruined King',
  region: 'Shadow Isles',
  release: '2021-01-21',
  difficulty: 'Moderate',
  description:
    'Viego, the Ruined King, is a melee fighter from the Shadow Isles who can possess enemies and steal their power.',
}
