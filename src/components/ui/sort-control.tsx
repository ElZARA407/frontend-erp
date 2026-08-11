'use client'

import { ArrowDownAZ, ArrowUpAZ, ArrowUpDown } from 'lucide-react'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

export type SortDirection = 'asc' | 'desc'

export interface SortOption {
  value: string
  label: string
}

interface SortControlProps {
  sortBy: string
  sortDir: SortDirection
  options: SortOption[]
  onSortByChange: (value: string) => void
  onSortDirChange: (value: SortDirection) => void
  className?: string
  label?: string
}

export function SortControl({
  sortBy,
  sortDir,
  options,
  onSortByChange,
  onSortDirChange,
  className,
  label = 'Trier par',
}: SortControlProps) {
  return (
    <div className={`flex w-full items-end gap-2 md:w-auto ${className ?? ''}`}>
      <Select
        className="min-w-44"
        label={label}
        value={sortBy}
        onChange={(event) => onSortByChange(event.target.value)}
        options={options}
      />

      <Button
        type="button"
        variant="outline"
        className="h-10"
        icon={
          sortDir === 'desc' ? (
            <ArrowDownAZ className="h-4 w-4" />
          ) : (
            <ArrowUpAZ className="h-4 w-4" />
          )
        }
        onClick={() => onSortDirChange(sortDir === 'desc' ? 'asc' : 'desc')}
      >
        {sortDir === 'desc' ? 'Décroissant' : 'Croissant'}
      </Button>

      <span className="sr-only">
        <ArrowUpDown className="h-4 w-4" />
      </span>
    </div>
  )
}