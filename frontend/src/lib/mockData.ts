import type {
  ViegoBuild,
  ViegoRunes,
  Matchup,
  PlayerProfile,
  MetaStats,
  LeaderboardEntry,
  MetaTrend,
  Guide,
  Role,
} from './types'

// Real League of Legends item IDs
const ITEM_IDS = {
  TRINITY_FORCE: 3078,
  KRAKEN_SLAYER: 6672,
  BORK: 3153,
  BLACK_CLEAVER: 3154,
  SPIRIT_VISAGE: 3065,
  DEATH_DANCE: 6693,
  VOID_STAFF: 3135,
  MAW: 3142,
  STERAKS: 3748,
  FORCE_OF_NATURE: 4629,
  PLATED_STEELCAPS: 2015,
  MERCURY_TREADS: 2055,
  GHOSTBLADE: 6691,
  MANAMUNE: 3003,
}

const RUNE_TREES = ['Precision', 'Domination', 'Sorcery', 'Resolve', 'Inspiration']

export function getMockBuilds(role?: Role): ViegoBuild[] {
  const builds: ViegoBuild[] = [
    {
      id: '1',
      name: 'Bruiser Mythic',
      role: 'top',
      items: [
        {
          id: ITEM_IDS.TRINITY_FORCE,
          name: 'Trinity Force',
          description: 'Mythic Spellblade item',
          icon: String(ITEM_IDS.TRINITY_FORCE),
          cost: 3333,
          builds: 1,
          winRate: 0.53,
          pickRate: 0.48,
        },
        {
          id: ITEM_IDS.SPIRIT_VISAGE,
          name: 'Spirit Visage',
          description: 'Defensive MR item',
          icon: String(ITEM_IDS.SPIRIT_VISAGE),
          cost: 3200,
          builds: 1,
          winRate: 0.52,
          pickRate: 0.42,
        },
        {
          id: ITEM_IDS.DEATH_DANCE,
          name: "Death's Dance",
          description: 'Defensive AD item',
          icon: String(ITEM_IDS.DEATH_DANCE),
          cost: 3400,
          builds: 1,
          winRate: 0.51,
          pickRate: 0.40,
        },
      ],
      winRate: 0.53,
      pickRate: 0.48,
      matchCount: 25000,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Crit ADC',
      role: 'bot',
      items: [
        {
          id: ITEM_IDS.KRAKEN_SLAYER,
          name: 'Kraken Slayer',
          description: 'Mythic damage item',
          icon: String(ITEM_IDS.KRAKEN_SLAYER),
          cost: 3200,
          builds: 1,
          winRate: 0.51,
          pickRate: 0.45,
        },
        {
          id: ITEM_IDS.INFINITY_EDGE,
          name: "Infinity Edge",
          description: 'Crit damage item',
          icon: String(ITEM_IDS.TRINITY_FORCE),
          cost: 3400,
          builds: 1,
          winRate: 0.50,
          pickRate: 0.43,
        },
      ],
      winRate: 0.51,
      pickRate: 0.45,
      matchCount: 20000,
      lastUpdated: new Date().toISOString(),
    },
  ]

  return role ? builds.filter(b => b.role === role) : builds
}

// Add missing property name to ITEM_IDS
const ITEM_IDS_EXTENDED = {
  ...ITEM_IDS,
  INFINITY_EDGE: 3031,
}

export function getMockRunes(role?: Role): ViegoRunes[] {
  const runes: ViegoRunes[] = [
    {
      id: '1',
      role: 'top',
      primary: {
        id: 8000,
        name: 'Precision',
        icon: 'precision.png',
        description: 'Increased attack power and sustained damage',
        runes: [],
      },
      secondary: {
        id: 8200,
        name: 'Resolve',
        icon: 'resolve.png',
        description: 'Survivability and crowd control reduction',
        runes: [],
      },
      shards: [],
      winRate: 0.54,
      pickRate: 0.52,
      matchCount: 30000,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: '2',
      role: 'jungle',
      primary: {
        id: 8100,
        name: 'Domination',
        icon: 'domination.png',
        description: 'Burst damage and target access',
        runes: [],
      },
      secondary: {
        id: 8000,
        name: 'Precision',
        icon: 'precision.png',
        description: 'Attack power and damage',
        runes: [],
      },
      shards: [],
      winRate: 0.51,
      pickRate: 0.48,
      matchCount: 22000,
      lastUpdated: new Date().toISOString(),
    },
  ]

  return role ? runes.filter(r => r.role === role) : runes
}

export function getMockMatchups(role?: Role): Matchup[] {
  const matchups: Matchup[] = [
    {
      id: '1',
      enemyChampionId: 1,
      enemyChampionName: 'Annie',
      enemyChampionIcon: 'annie.png',
      role: 'mid',
      winRate: 0.58,
      matchCount: 5000,
      difficulty: 'easy',
      tips: ['Annie has low mobility early', 'Dodge her stun combos', 'Roam when she uses ult'],
    },
    {
      id: '2',
      enemyChampionId: 2,
      enemyChampionName: 'Ahri',
      enemyChampionIcon: 'ahri.png',
      role: 'mid',
      winRate: 0.42,
      matchCount: 4200,
      difficulty: 'hard',
      tips: ['Her R makes her unpredictable', 'Play around cooldowns', 'Teamfight heavily'],
    },
  ]

  return role ? matchups.filter(m => m.role === role) : matchups
}

export function getMockPlayerProfile(): PlayerProfile {
  return {
    summonerId: 'summoner123',
    puuid: 'puuid123',
    name: 'ViegoMain',
    tag: 'NA1',
    region: 'na1',
    level: 30,
    profileIcon: 1234,
    rank: {
      tier: 'DIAMOND',
      rank: 'I',
      leaguePoints: 75,
      wins: 248,
      losses: 201,
    },
    viegoMastery: {
      championId: 234,
      championLevel: 7,
      championPoints: 750000,
      lastPlayTime: new Date(Date.now() - 86400000).toISOString(),
    },
    recentMatches: [
      {
        matchId: 'match1',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        duration: 1800,
        result: 'win',
        role: 'mid',
        kills: 12,
        deaths: 2,
        assists: 8,
        cs: 312,
        gold: 18500,
        itemBuild: [],
        runes: {} as any,
      },
      {
        matchId: 'match2',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        duration: 2100,
        result: 'win',
        role: 'mid',
        kills: 9,
        deaths: 1,
        assists: 15,
        cs: 289,
        gold: 16200,
        itemBuild: [],
        runes: {} as any,
      },
      {
        matchId: 'match3',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        duration: 1500,
        result: 'loss',
        role: 'top',
        kills: 4,
        deaths: 5,
        assists: 3,
        cs: 245,
        gold: 10200,
        itemBuild: [],
        runes: {} as any,
      },
    ],
    stats: {
      winRate: 0.55,
      kda: 3.8,
      avgCs: 285,
      avgGold: 15000,
      avgDamage: 18500,
      avgDamageTaken: 24000,
    },
    performanceIndex: {
      laning: 85,
      teamfight: 78,
      macroplay: 72,
      cs: 88,
      kda: 85,
      overall: 82,
    },
    otpScore: 92,
  }
}

export function getMockLeaderboard(): LeaderboardEntry[] {
  return [
    {
      rank: 1,
      summonerId: 'sum1',
      puuid: 'puuid1',
      name: 'ViegoGod',
      tag: 'NA1',
      region: 'na1',
      tier: 'CHALLENGER',
      rank_: 'I',
      leaguePoints: 950,
      viegoMastery: 7,
      otpScore: {
        matchCount: 1250,
        winRate: 0.62,
        avgKda: 4.5,
        totalMastery: 1000000,
        consistency: 0.98,
        overall: 96,
      },
      lastUpdated: new Date().toISOString(),
    },
    {
      rank: 2,
      summonerId: 'sum2',
      puuid: 'puuid2',
      name: 'RuinedKing',
      tag: 'EUW',
      region: 'euw1',
      tier: 'CHALLENGER',
      rank_: 'I',
      leaguePoints: 845,
      viegoMastery: 7,
      otpScore: {
        matchCount: 1150,
        winRate: 0.60,
        avgKda: 4.2,
        totalMastery: 950000,
        consistency: 0.96,
        overall: 94,
      },
      lastUpdated: new Date().toISOString(),
    },
    {
      rank: 3,
      summonerId: 'sum3',
      puuid: 'puuid3',
      name: 'ShadowKing',
      tag: 'KR',
      region: 'kr',
      tier: 'GRANDMASTER',
      rank_: 'I',
      leaguePoints: 650,
      viegoMastery: 7,
      otpScore: {
        matchCount: 980,
        winRate: 0.58,
        avgKda: 4.0,
        totalMastery: 900000,
        consistency: 0.94,
        overall: 91,
      },
      lastUpdated: new Date().toISOString(),
    },
  ]
}

export function getMockMetaStats(): MetaStats {
  return {
    timestamp: new Date().toISOString(),
    overallWinRate: 0.51,
    overallPickRate: 0.12,
    overallBanRate: 0.08,
    byRole: {
      top: {
        role: 'top',
        winRate: 0.52,
        pickRate: 0.14,
        banRate: 0.06,
        avgKda: 3.2,
        avgCs: 298,
        avgGold: 15200,
        itemPopularity: [],
        runePopularity: [],
        matchCount: 45000,
      },
      jungle: {
        role: 'jungle',
        winRate: 0.50,
        pickRate: 0.11,
        banRate: 0.07,
        avgKda: 3.0,
        avgCs: 210,
        avgGold: 13500,
        itemPopularity: [],
        runePopularity: [],
        matchCount: 38000,
      },
      mid: {
        role: 'mid',
        winRate: 0.51,
        pickRate: 0.13,
        banRate: 0.09,
        avgKda: 3.5,
        avgCs: 320,
        avgGold: 16000,
        itemPopularity: [],
        runePopularity: [],
        matchCount: 52000,
      },
      bot: {
        role: 'bot',
        winRate: 0.49,
        pickRate: 0.09,
        banRate: 0.05,
        avgKda: 2.8,
        avgCs: 285,
        avgGold: 14200,
        itemPopularity: [],
        runePopularity: [],
        matchCount: 35000,
      },
      support: {
        role: 'support',
        winRate: 0.52,
        pickRate: 0.10,
        banRate: 0.04,
        avgKda: 2.5,
        avgCs: 45,
        avgGold: 8500,
        itemPopularity: [],
        runePopularity: [],
        matchCount: 32000,
      },
    },
    topBuildByRole: {} as any,
    topRunesByRole: {} as any,
    topMatchups: [],
    patchVersion: '14.4',
  }
}

export function getMockMetaTrends(): MetaTrend[] {
  const trends: MetaTrend[] = []
  const now = Date.now()
  for (let i = 0; i < 30; i++) {
    const date = new Date(now - i * 86400000)
    trends.push({
      date: date.toISOString().split('T')[0],
      winRate: 0.50 + Math.random() * 0.04 - 0.02,
      pickRate: 0.11 + Math.random() * 0.03 - 0.015,
      banRate: 0.07 + Math.random() * 0.02 - 0.01,
      avgKda: 3.2 + Math.random() * 0.5 - 0.25,
    })
  }
  return trends.reverse()
}

export function getMockGuides(role?: Role): Guide[] {
  const guides: Guide[] = [
    {
      id: '1',
      role: 'mid',
      title: 'Mastering Viego Mid Lane',
      author: 'ProPlayer123',
      description: 'Complete guide to playing Viego in mid lane with early game advantage strategies.',
      content: 'Detailed guide content here...',
      build: {} as any,
      runes: {} as any,
      matchups: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 25000,
      helpful: 1850,
    },
    {
      id: '2',
      role: 'top',
      title: 'Viego Top: Survive and Dominate',
      author: 'TopLaneKing',
      description: 'Strategic guide for top lane Viego with wave management and roaming tips.',
      content: 'Detailed guide content here...',
      build: {} as any,
      runes: {} as any,
      matchups: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 18500,
      helpful: 1420,
    },
  ]

  return role ? guides.filter(g => g.role === role) : guides
}
