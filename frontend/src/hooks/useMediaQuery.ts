'use client'

import { useState, useEffect } from 'react'

interface MediaQueries {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isLarge: boolean
}

const BREAKPOINTS = {
  mobile: '(max-width: 640px)',
  tablet: '(min-width: 641px) and (max-width: 1024px)',
  desktop: '(min-width: 1025px)',
  large: '(min-width: 1440px)',
}

export function useMediaQuery(): MediaQueries {
  const [queries, setQueries] = useState<MediaQueries>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isLarge: false,
  })

  useEffect(() => {
    // Check initial values
    const updateQueries = () => {
      const mobileMatch = window.matchMedia(BREAKPOINTS.mobile).matches
      const tabletMatch = window.matchMedia(BREAKPOINTS.tablet).matches
      const desktopMatch = window.matchMedia(BREAKPOINTS.desktop).matches
      const largeMatch = window.matchMedia(BREAKPOINTS.large).matches

      setQueries({
        isMobile: mobileMatch,
        isTablet: tabletMatch,
        isDesktop: desktopMatch,
        isLarge: largeMatch,
      })
    }

    updateQueries()

    const mobileMedia = window.matchMedia(BREAKPOINTS.mobile)
    const tabletMedia = window.matchMedia(BREAKPOINTS.tablet)
    const desktopMedia = window.matchMedia(BREAKPOINTS.desktop)
    const largeMedia = window.matchMedia(BREAKPOINTS.large)

    const handleChange = () => updateQueries()

    mobileMedia.addEventListener('change', handleChange)
    tabletMedia.addEventListener('change', handleChange)
    desktopMedia.addEventListener('change', handleChange)
    largeMedia.addEventListener('change', handleChange)

    return () => {
      mobileMedia.removeEventListener('change', handleChange)
      tabletMedia.removeEventListener('change', handleChange)
      desktopMedia.removeEventListener('change', handleChange)
      largeMedia.removeEventListener('change', handleChange)
    }
  }, [])

  return queries
}
