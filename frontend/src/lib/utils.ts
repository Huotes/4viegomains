import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Role, Region, EloTier } from './types'
import { REGION_CLUSTERS, TIER_COLORS, ROLE_LABELS } from './constants'

/**
 * Merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Format win rate as percentage string
 */
export function formatWinRate(winRate: number): string {
  return `${(winRate * 100).toFixed(1)}%`
}

/**
 * Format pick rate as percentage string
 */
export function formatPickRate(pickRate: number): string {
  return `${(pickRate * 100).toFixed(1)}%`
}

/**
 * Format ban rate as percentage string
 */
export function formatBanRate(banRate: number): string {
  return `${(banRate * 100).toFixed(1)}%`
}

/**
 * Format large numbers with K/M suffix
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toFixed(0)
}

/**
 * Format KDA (Kills/Deaths/Assists)
 */
export function formatKDA(kills: number, deaths: number, assists: number): string {
  return `${kills}/${deaths}/${assists}`
}

/**
 * Calculate KDA ratio
 */
export function calculateKDA(kills: number, deaths: number, assists: number): number {
  if (deaths === 0) {
    return kills + assists
  }
  return (kills + assists) / deaths
}

/**
 * Format gold amount
 */
export function formatGold(gold: number): string {
  return `${formatNumber(gold)}g`
}

/**
 * Format match duration
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

/**
 * Format timestamp to relative time
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return past.toLocaleDateString()
}

/**
 * Get region cluster for API calls
 */
export function getRegionCluster(region: Region): string {
  return REGION_CLUSTERS[region] || 'americas'
}

/**
 * Get Dragon Doll image URL
 */
export function getDDragonURL(
  path: string,
  version: string = '14.1.1'
): string {
  return `https://ddragon.leagueoflegends.com/cdn/${version}/${path}`
}

/**
 * Get champion splash art URL
 */
export function getChampionSplashURL(championName: string, skin: number = 0): string {
  return getDDragonURL(`img/champion/splash/${championName}_${skin}.jpg`)
}

/**
 * Get champion tile URL
 */
export function getChampionTileURL(championName: string): string {
  return getDDragonURL(`img/champion/${championName}.png`)
}

/**
 * Get item icon URL
 */
export function getItemIconURL(itemId: number): string {
  return getDDragonURL(`img/item/${itemId}.png`)
}

/**
 * Get rune icon URL from Community Dragon
 */
export function getRuneIconURL(runePath: string): string {
  return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-static-data/global/default/${runePath}`
}

/**
 * Get spell icon URL
 */
export function getSpellIconURL(spellName: string): string {
  return getDDragonURL(`img/spell/${spellName}.png`)
}

/**
 * Get rank emblem URL
 */
export function getRankEmblemURL(tier: EloTier): string {
  const tierLower = tier.toLowerCase()
  return getDDragonURL(`img/rank/${tierLower}.png`)
}

/**
 * Get role icon (returns emoji or icon name)
 */
export function getRoleIcon(role: Role): string {
  const icons: Record<Role, string> = {
    top: '⚔️',
    jungle: '🌲',
    mid: '✨',
    bot: '🏹',
    support: '🛡️',
  }
  return icons[role]
}

/**
 * Get role label
 */
export function getRoleLabel(role: Role): string {
  return ROLE_LABELS[role]
}

/**
 * Get tier color
 */
export function getTierColor(tier: EloTier): string {
  return TIER_COLORS[tier] || '#888888'
}

/**
 * Get tier background gradient
 */
export function getTierGradient(tier: EloTier): string {
  const gradients: Record<EloTier, string> = {
    IRON: 'linear-gradient(135deg, #5c5559 0%, #3d3a37 100%)',
    BRONZE: 'linear-gradient(135deg, #b3633f 0%, #8b4513 100%)',
    SILVER: 'linear-gradient(135deg, #a8a8a8 0%, #808080 100%)',
    GOLD: 'linear-gradient(135deg, #c89b3c 0%, #9d7c2f 100%)',
    PLATINUM: 'linear-gradient(135deg, #3f956f 0%, #2d6a4f 100%)',
    DIAMOND: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
    MASTER: 'linear-gradient(135deg, #7c4dff 0%, #6200ee 100%)',
    GRANDMASTER: 'linear-gradient(135deg, #ff6b6b 0%, #dc2626 100%)',
    CHALLENGER: 'linear-gradient(135deg, #ffd54f 0%, #f9a825 100%)',
  }
  return gradients[tier]
}

/**
 * Determine difficulty based on win rate
 */
export function getDifficulty(winRate: number): 'easy' | 'medium' | 'hard' {
  if (winRate > 0.52) return 'easy'
  if (winRate > 0.48) return 'medium'
  return 'hard'
}

/**
 * Get color based on performance
 */
export function getPerformanceColor(value: number, max: number = 100): string {
  const percentage = value / max
  if (percentage >= 0.65) return '#00ff87' // Mist green (good)
  if (percentage >= 0.50) return '#ffd54f' // Soul gold (medium)
  return '#ff6b6b' // Error red (poor)
}

/**
 * Validate Riot ID format (Name#TAG)
 */
export function isValidRiotId(riotId: string): boolean {
  const match = riotId.match(/^[\w\s]{1,16}#[\w]{3,5}$/)
  return match !== null
}

/**
 * Parse Riot ID into name and tag
 */
export function parseRiotId(riotId: string): { name: string; tag: string } | null {
  const match = riotId.match(/^(.+)#(.+)$/)
  if (!match) return null
  return { name: match[1], tag: match[2] }
}

/**
 * Format Riot ID
 */
export function formatRiotId(name: string, tag: string): string {
  return `${name}#${tag}`
}

/**
 * Convert seconds to human readable time
 */
export function secondsToHuman(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

/**
 * Round to decimal places
 */
export function round(value: number, decimals: number = 2): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

/**
 * Check if value is within acceptable range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * Generate avatar URL from profile icon ID
 */
export function getAvatarURL(profileIconId: number): string {
  return getDDragonURL(`img/profileicon/${profileIconId}.png`)
}

/**
 * Debounce function for search/input
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>
  return function executedFunction(...args: Parameters<T>): void {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, delay)
  }
}
