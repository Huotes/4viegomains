'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Search, X } from 'lucide-react'

interface SearchInputProps {
  onSearch: (query: string) => void
  placeholder?: string
  debounceMs?: number
  showHint?: boolean
  isValid?: (value: string) => boolean
}

export function SearchInput({
  onSearch,
  placeholder = 'Player Name#TAG',
  debounceMs = 500,
  showHint = true,
  isValid = () => true,
}: SearchInputProps): React.ReactElement {
  const [value, setValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [hasError, setHasError] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      if (value.trim()) {
        const valid = isValid(value.trim())
        setHasError(!valid)
        if (valid) {
          onSearch(value.trim())
        }
      } else {
        setHasError(false)
      }
    }, debounceMs)

    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value, onSearch, debounceMs, isValid])

  const handleClear = () => {
    setValue('')
    setHasError(false)
  }

  return (
    <div className="relative w-full">
      <div
        className={cn(
          'flex items-center gap-2 rounded-lg border bg-shadow-dark/50 px-4 py-3 transition-all duration-300',
          isFocused
            ? 'border-mist-green/50 mist-glow'
            : hasError
              ? 'border-danger/50'
              : 'border-shadow-light'
        )}
      >
        <Search className={cn(
          'h-5 w-5 flex-shrink-0',
          isFocused ? 'text-mist-green' : hasError ? 'text-danger' : 'text-mist-cyan/50'
        )} />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={cn(
            'flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none text-sm md:text-base',
            hasError && 'text-danger'
          )}
        />
        {value && (
          <button
            onClick={handleClear}
            className="p-1 text-mist-cyan/50 hover:text-mist-green transition-colors flex-shrink-0"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showHint && !hasError && (
        <p className="mt-1.5 text-xs text-gray-500">
          Format: <code className="font-mono text-mist-cyan/70">YourName#TAG</code>
        </p>
      )}

      {hasError && (
        <p className="mt-1.5 text-xs text-danger">
          Invalid format. Use Name#TAG (e.g., Faker#NA1)
        </p>
      )}
    </div>
  )
}

interface SearchDropdownProps {
  query: string
  results: Array<{ id: string; label: string; subtitle?: string; icon?: React.ReactNode }>
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
    <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-lg border border-shadow-light/50 bg-shadow-medium glass overflow-hidden animate-fade-in-up">
      {isLoading && (
        <div className="flex items-center justify-center p-4">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-mist-green border-t-transparent" />
          <span className="ml-3 text-sm text-gray-400">Searching...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-4 text-danger text-sm">
          <span className="text-lg">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {results.length > 0 && (
        <ul className="max-h-72 overflow-y-auto">
          {results.map((result, idx) => (
            <li key={result.id} className={idx > 0 ? 'border-t border-shadow-light/30' : ''}>
              <button
                onClick={() => onSelect(result.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-shadow-light/40 transition-colors text-left group"
              >
                {result.icon && (
                  <span className="flex-shrink-0 text-lg">{result.icon}</span>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate group-hover:text-mist-green transition-colors">
                    {result.label}
                  </p>
                  {result.subtitle && (
                    <p className="text-xs text-gray-500 truncate">{result.subtitle}</p>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {query && results.length === 0 && !isLoading && !error && (
        <div className="p-6 text-center">
          <p className="text-gray-400 text-sm">No results found for "{query}"</p>
          <p className="text-gray-500 text-xs mt-2">Try searching with a valid Riot ID</p>
        </div>
      )}
    </div>
  )
}
