'use client'

import { useState } from 'react'
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
}

export function Tabs({
  tabs,
  defaultTab,
  onTabChange,
  children,
}: TabsProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0].id)

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    onTabChange?.(tabId)
  }

  return (
    <div className="w-full">
      <div className="flex border-b border-shadow-light">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 font-semibold transition-all border-b-2 relative',
              activeTab === tab.id
                ? 'text-mist-green border-b-mist-green mist-glow-active'
                : 'text-gray-400 border-b-transparent hover:text-mist-cyan border-b-shadow-light'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">{children}</div>
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
