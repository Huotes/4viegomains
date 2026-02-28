'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface Tab {
  id: string
  label: string
  icon?: React.ReactNode
}

interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
  onTabChange?: (tabId: string) => void
  children: React.ReactNode
  variant?: 'default' | 'pills'
  fullWidth?: boolean
}

export function Tabs({
  tabs,
  defaultTab,
  onTabChange,
  children,
  variant = 'default',
  fullWidth = false,
}: TabsProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)
  const [indicatorStyle, setIndicatorStyle] = useState({ width: '0px', left: '0px' })
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  useEffect(() => {
    const activeButton = tabRefs.current[activeTab]
    if (activeButton) {
      setIndicatorStyle({
        width: `${activeButton.offsetWidth}px`,
        left: `${activeButton.offsetLeft}px`,
      })
    }
  }, [activeTab])

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    onTabChange?.(tabId)
  }

  return (
    <div className="w-full">
      <div
        className={cn(
          'relative flex overflow-x-auto',
          variant === 'default' && 'border-b border-mist-green/20'
        )}
      >
        {/* Animated Indicator */}
        {variant === 'default' && (
          <div
            className="absolute bottom-0 h-1 bg-gradient-to-r from-mist-green to-mist-cyan transition-all duration-300"
            style={{
              width: indicatorStyle.width,
              left: indicatorStyle.left,
            }}
          />
        )}

        {tabs.map((tab) => (
          <button
            key={tab.id}
            ref={(el) => {
              if (el) tabRefs.current[tab.id] = el
            }}
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              'relative flex items-center gap-2 px-4 py-3 font-semibold transition-all duration-300 whitespace-nowrap',
              fullWidth && 'flex-1',
              activeTab === tab.id
                ? variant === 'pills'
                  ? 'bg-gradient-to-r from-mist-green to-mist-cyan text-shadow-black'
                  : 'text-mist-green'
                : 'text-gray-400 hover:text-mist-cyan',
              variant === 'pills' && activeTab === tab.id && 'rounded-lg',
              variant === 'pills' && activeTab !== tab.id && 'hover:bg-shadow-light/30 rounded-lg'
            )}
          >
            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
            <span className="text-sm md:text-base">{tab.label}</span>
          </button>
        ))}
      </div>
      <div className="mt-4 md:mt-6 animate-fade-in-up">{children}</div>
    </div>
  )
}

interface TabContentProps {
  tabId: string
  activeTab: string
  children: React.ReactNode
}

export function TabContent({
  tabId,
  activeTab,
  children,
}: TabContentProps): React.ReactElement | null {
  if (tabId !== activeTab) return null
  return <>{children}</>
}
