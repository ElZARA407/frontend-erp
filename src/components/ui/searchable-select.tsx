'use client'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { Check, ChevronDown, Search, X } from 'lucide-react'

export type SearchableSelectOption = {
  value: string | number
  label: string
  description?: string
  disabled?: boolean
}

interface SearchableSelectProps {
  label?: string
  value?: string | number | null
  options: SearchableSelectOption[]
  placeholder?: string
  searchPlaceholder?: string
  noOptionsMessage?: string
  error?: string
  disabled?: boolean
  className?: string
  onValueChange: (value: string | number | null) => void
}

export function SearchableSelect({
  label,
  value,
  options,
  placeholder = 'Sélectionner',
  searchPlaceholder = 'Rechercher...',
  noOptionsMessage = 'Aucun résultat.',
  error,
  disabled = false,
  className = '',
  onValueChange,
}: SearchableSelectProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [dropdownStyle, setDropdownStyle] = useState<CSSProperties>({})

  const normalizedValue = value === undefined || value === null ? '' : String(value)

  const selectedOption = useMemo(
    () => options.find((option) => String(option.value) === normalizedValue),
    [normalizedValue, options],
  )

  const filteredOptions = useMemo(() => {
    const term = search.trim().toLowerCase()

    if (!term) return options

    return options.filter((option) => {
      const label = option.label.toLowerCase()
      const description = option.description?.toLowerCase() ?? ''

      return label.includes(term) || description.includes(term)
    })
  }, [options, search])

  useEffect(() => {
    if (!open || !triggerRef.current) return

    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (!rect) return

      const viewportHeight = window.innerHeight
      const maxHeight = 280
      const spaceBelow = viewportHeight - rect.bottom - 8
      const spaceAbove = rect.top - 8
      const shouldOpenUp = spaceBelow < 180 && spaceAbove > spaceBelow

      setDropdownStyle({
        left: rect.left,
        width: rect.width,
        maxHeight,
        top: shouldOpenUp ? undefined : rect.bottom + 4,
        bottom: shouldOpenUp ? viewportHeight - rect.top + 4 : undefined,
      })
    }

    updatePosition()

    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)

    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    const timer = window.setTimeout(() => {
      searchInputRef.current?.focus()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [open])

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node

      if (rootRef.current?.contains(target)) return

      const dropdown = document.getElementById('searchable-select-dropdown')
      if (dropdown?.contains(target)) return

      setOpen(false)
      setSearch('')
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        setSearch('')
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const handleSelect = (option: SearchableSelectOption) => {
    if (option.disabled) return

    onValueChange(option.value)
    setOpen(false)
    setSearch('')
  }

  const handleClear = () => {
    onValueChange(null)
    setSearch('')
  }

  return (
    <div ref={rootRef} className={className}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-steel-700">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          disabled={disabled}
          onClick={() => {
            if (!disabled) setOpen((current) => !current)
          }}
          className={[
            'flex h-10 w-full items-center justify-between gap-2 rounded-md border bg-white px-3 text-left text-sm outline-none transition',
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100'
              : 'border-surface-border focus:border-primary-500 focus:ring-2 focus:ring-primary-100',
            disabled
              ? 'cursor-not-allowed bg-surface-subtle text-steel-400'
              : 'text-steel-900 hover:border-primary-300',
          ].join(' ')}
        >
          <span className={selectedOption ? 'truncate' : 'truncate text-steel-400'}>
            {selectedOption?.label ?? placeholder}
          </span>

          <span className="flex shrink-0 items-center gap-1">
            {selectedOption && !disabled && (
              <span
                role="button"
                tabIndex={-1}
                onClick={(event) => {
                  event.stopPropagation()
                  handleClear()
                }}
                className="rounded p-0.5 text-steel-400 hover:bg-surface-subtle hover:text-steel-700"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            )}
            <ChevronDown
              className={[
                'h-4 w-4 text-steel-400 transition-transform',
                open ? 'rotate-180' : '',
              ].join(' ')}
            />
          </span>
        </button>

        {open && (
          <div
            id="searchable-select-dropdown"
            style={dropdownStyle}
            className="fixed z-[9999] overflow-hidden rounded-md border border-surface-border bg-white shadow-xl"
          >
            <div className="border-b border-surface-border p-2">
              <div className="flex h-9 items-center gap-2 rounded-md border border-surface-border bg-white px-2">
                <Search className="h-3.5 w-3.5 shrink-0 text-steel-400" />
                <input
                  ref={searchInputRef}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="h-full min-w-0 flex-1 border-0 bg-transparent text-sm text-steel-900 outline-none placeholder:text-steel-400"
                />
              </div>
            </div>

            <div className="max-h-[240px] overflow-y-auto py-1">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-6 text-center text-sm text-steel-400">
                  {noOptionsMessage}
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const selected = String(option.value) === normalizedValue

                  return (
                    <button
                      key={String(option.value)}
                      type="button"
                      disabled={option.disabled}
                      onClick={() => handleSelect(option)}
                      className={[
                        'flex w-full items-start justify-between gap-3 px-3 py-2 text-left text-sm transition',
                        selected ? 'bg-primary-50 text-primary-700' : 'text-steel-700',
                        option.disabled
                          ? 'cursor-not-allowed opacity-50'
                          : 'hover:bg-surface-subtle',
                      ].join(' ')}
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium">
                          {option.label}
                        </span>
                        {option.description && (
                          <span className="mt-0.5 block truncate text-xs text-steel-400">
                            {option.description}
                          </span>
                        )}
                      </span>

                      {selected && <Check className="mt-0.5 h-4 w-4 shrink-0" />}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}