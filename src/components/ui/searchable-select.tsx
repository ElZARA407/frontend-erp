'use client'

import { useEffect, useMemo, useRef, useState, type HTMLAttributes } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SearchableSelectOption {
  value: string | number
  label: string
  description?: string
  disabled?: boolean
}

interface SearchableSelectProps extends HTMLAttributes<HTMLDivElement> {
  id?: string
  label?: string
  error?: string
  options: SearchableSelectOption[]
  value: string | number | null | undefined
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  noOptionsMessage?: string
  disabled?: boolean
}

export function SearchableSelect({
  id,
  label,
  error,
  options,
  value,
  onValueChange,
  placeholder = 'Sélectionner...',
  searchPlaceholder = 'Rechercher...',
  noOptionsMessage = 'Aucun résultat.',
  disabled = false,
  className,
  ...props
}: SearchableSelectProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const selectId = id ?? `searchable-select-${label?.toLowerCase().replace(/\s+/g, '-') ?? 'field'}`
  const selectedOption = useMemo(
    () => options.find((option) => String(option.value) === String(value)) ?? null,
    [options, value],
  )

  const filteredOptions = useMemo(() => {
    const needle = query.trim().toLowerCase()

    if (!needle) {
      return options
    }

    return options.filter((option) => {
      const haystack = [option.label, option.description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(needle)
    })
  }, [options, query])

  useEffect(() => {
    if (!open) {
      setQuery('')
      return
    }

    inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current) return
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  return (
    <div ref={rootRef} className={cn('flex min-w-0 flex-col gap-1.5', className)} {...props}>
      {label && (
        <label htmlFor={selectId} className="text-xs font-medium text-steel-700">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          id={selectId}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => {
            if (disabled) return
            setOpen((prev) => !prev)
            setQuery('')
          }}
          className={cn(
            'flex h-9 w-full items-center justify-between gap-3 rounded-md border border-surface-border bg-white px-3 text-left text-sm',
            'transition-colors focus:border-steel-500 focus:outline-none focus:ring-1 focus:ring-steel-500/30',
            'disabled:cursor-not-allowed disabled:opacity-60',
            error && 'border-red-400 focus:border-red-500 focus:ring-red-500/20',
            open && 'border-steel-500 ring-1 ring-steel-500/30',
            !selectedOption && 'text-steel-400',
          )}
        >
          <span className="min-w-0 flex-1 truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={cn('h-4 w-4 flex-none text-steel-400 transition-transform', open && 'rotate-180')}
          />
        </button>

        {open && !disabled && (
          <div className="absolute z-30 mt-1 w-full rounded-md border border-surface-border bg-white shadow-lg">
            <div className="border-b border-surface-border p-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-steel-400" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      e.preventDefault()
                      setOpen(false)
                    }

                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const first = filteredOptions[0]
                      if (first && !first.disabled) {
                        onValueChange(String(first.value))
                        setOpen(false)
                        setQuery('')
                      }
                    }
                  }}
                  placeholder={searchPlaceholder}
                  className={cn(
                    'h-8 w-full rounded-md border border-surface-border bg-white pl-9 pr-3 text-sm',
                    'placeholder:text-steel-400 focus:border-steel-500 focus:outline-none focus:ring-1 focus:ring-steel-500/30',
                  )}
                />
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto py-1">
              {filteredOptions.length === 0 ? (
                <p className="px-3 py-4 text-sm text-steel-400">{noOptionsMessage}</p>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = String(option.value) === String(value)

                  return (
                    <button
                      key={String(option.value)}
                      type="button"
                      disabled={option.disabled}
                      onClick={() => {
                        if (option.disabled) return
                        onValueChange(String(option.value))
                        setOpen(false)
                        setQuery('')
                      }}
                      className={cn(
                        'flex w-full flex-col gap-0.5 px-3 py-2 text-left text-sm transition-colors',
                        'hover:bg-surface-subtle',
                        isSelected && 'bg-surface-subtle text-steel-900',
                        option.disabled && 'cursor-not-allowed opacity-50',
                      )}
                    >
                      <span className="truncate font-medium">{option.label}</span>
                      {option.description && (
                        <span className="truncate text-xs text-steel-500">{option.description}</span>
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}