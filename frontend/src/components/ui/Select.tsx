'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, X } from 'lucide-react'

interface Option {
  value: string
  label: string
  icon?: React.ReactNode
}

interface SelectProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options: Option[]
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  placeholder?: string
  searchable?: boolean
  clearable?: boolean
  disabled?: boolean
}

export function Select({
  options,
  value,
  defaultValue,
  onChange,
  placeholder = 'Select an option',
  searchable = false,
  clearable = false,
  disabled = false,
  className,
  ...props
}: SelectProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [internalValue, setInternalValue] = useState(value || defaultValue || '')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const selectedOption = options.find((opt) => opt.value === internalValue)
  const filteredOptions = searchable
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value)
    }
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      if (searchable && searchInputRef.current) {
        searchInputRef.current.focus()
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, searchable])

  const handleSelect = (optionValue: string) => {
    setInternalValue(optionValue)
    onChange?.(optionValue)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setInternalValue('')
    onChange?.('')
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full', className)}
      {...props}
    >
      {/* Trigger Button */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between gap-2 rounded-lg border px-4 py-2.5',
          'bg-shadow-medium/40 text-left transition-all duration-300',
          isOpen
            ? 'border-mist-green/50 bg-shadow-medium/60'
            : 'border-shadow-light/30 hover:border-shadow-light/50',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {selectedOption?.icon && (
            <span className="flex-shrink-0">{selectedOption.icon}</span>
          )}
          <span className={cn(
            'text-sm truncate',
            selectedOption ? 'text-white' : 'text-gray-500'
          )}>
            {selectedOption?.label || placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {clearable && selectedOption && (
            <button
              onClick={handleClear}
              className="p-1 text-mist-cyan/50 hover:text-mist-green transition-colors"
              aria-label="Clear selection"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <ChevronDown
            className={cn(
              'h-4 w-4 text-mist-cyan/50 transition-transform duration-300',
              isOpen && 'rotate-180'
            )}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-lg border border-shadow-light/50 bg-shadow-medium glass overflow-hidden animate-fade-in-up">
          {searchable && (
            <div className="border-b border-shadow-light/30 p-2">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cn(
                  'w-full bg-shadow-dark/50 border border-shadow-light/30 rounded px-3 py-2',
                  'text-sm text-white placeholder-gray-500 focus:outline-none',
                  'transition-all duration-300 focus:border-mist-green/50'
                )}
              />
            </div>
          )}

          <ul className="max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <li key={option.value}>
                  <button
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      'w-full flex items-center gap-2 px-4 py-2.5 text-left transition-colors text-sm',
                      internalValue === option.value
                        ? 'bg-mist-green/20 text-mist-green'
                        : 'text-gray-300 hover:bg-shadow-light/40'
                    )}
                  >
                    {option.icon && (
                      <span className="flex-shrink-0">{option.icon}</span>
                    )}
                    <span>{option.label}</span>
                  </button>
                </li>
              ))
            ) : (
              <li className="px-4 py-3 text-center text-sm text-gray-500">
                No options found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
