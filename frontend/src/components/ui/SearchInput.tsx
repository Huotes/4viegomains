'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from './Button'
import { Search, X } from 'lucide-react'

interface SearchInputProps {
  onSearch: (query: string) => void
  placeholder?: string
  debounceMs?: number
}

export function SearchInput({
  onSearch,
  placeholder = 'Search player (Name#TAG)',
  debounceMs = 500,
}: SearchInputProps): React.ReactElement {
  const [value, setValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      if (value.trim()) {
        onSearch(value.trim())
      }
    }, debounceMs)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value, onSearch, debounceMs])

  const handleClear = () => {
    setValue('')
  }

  return (
    <div
      className={cn(
        'relative flex items-center rounded-lg border border-shadow-light bg-shadow-dark/50 transition-all duration-200',
        isFocused && 'mist-glow border-mist-green/50'
      )}
    >
      <Search className="ml-3 h-5 w-5 text-mist-cyan/50" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="flex-1 bg-transparent px-3 py-2 text-white placeholder-gray-500 focus:outline-none"
      />
      {value && (
        <button
          onClick={handleClear}
          className="pr-3 text-mist-cyan/50 hover:text-mist-cyan transition-colors"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

interface SearchDropdownProps {
  query: string
  results: Array<{ id: string; label: string; icon?: React.ReactNode }>
  onSelect: (id: string) => void
  isLoading?: boolean
  error?: string
}

export function SearchDropdown({
  query,
  results,
  onSelect,
  isLoading = false,
  error,
}: SearchDropdownProps): React.ReactElement {
  if (!query && !isLoading && !error) {
    return <></>
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 rounded-lg border border-shadow-light bg-shadow-medium glass z-50">
      {isLoading && (
        <div className="flex items-center justify-center p-4">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-mist-green border-t-transparent" />
        </div>
      )}

      {error && (
        <div className="p-4 text-red-400 text-sm">{error}</div>
      )}

      {results.length > 0 && (
        <ul className="max-h-60 overflow-y-auto">
          {results.map((result) => (
            <li key={result.id}>
              <button
                onClick={() => onSelect(result.id)}
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-shadow-light transition-colors text-left"
              >
                {result.icon}
                <span className="text-white">{result.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {query && results.length === 0 && !isLoading && !error && (
        <div className="p-4 text-gray-400 text-sm text-center">No results found</div>
      )}
    </div>
  )
}
