'use client'

import { Button } from '@/components/ui/Button'
import { REGION_LABELS, REGIONS } from '@/lib/constants'
import type { Region } from '@/lib/types'

interface RegionSelectorProps {
  selectedRegion: Region
  onRegionChange: (region: Region) => void
  className?: string
}

const REGION_ABBREVIATIONS: Record<Region, string> = {
  na1: 'NA',
  euw1: 'EUW',
  kr: 'KR',
  br1: 'BR',
  jp1: 'JP',
  ru: 'RU',
  oc1: 'OCE',
  tr1: 'TR',
}

export function RegionSelector({
  selectedRegion,
  onRegionChange,
  className = '',
}: RegionSelectorProps) {
  return (
    <div className={`flex gap-2 flex-wrap ${className}`}>
      {REGIONS.map((region) => (
        <Button
          key={region}
          variant={selectedRegion === region ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => onRegionChange(region)}
          className={`
            transition-all
            duration-200
            ${selectedRegion === region
              ? 'bg-mist-green/20 border-mist-green text-mist-green'
              : 'border-shadow-light/50 text-gray-400 hover:text-mist-cyan hover:border-mist-cyan/50'
            }
          `}
          title={REGION_LABELS[region]}
        >
          {REGION_ABBREVIATIONS[region]}
        </Button>
      ))}
    </div>
  )
}
