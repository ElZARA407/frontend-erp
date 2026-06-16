// src/components/ui/pagination.tsx
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './button'

interface PaginationProps {
  currentPage: number
  lastPage:    number
  total:       number
  from:        number
  to:          number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, lastPage, total, from, to, onPageChange }: PaginationProps) {
  if (lastPage <= 1) return null

  return (
    <div className="flex items-center justify-between border-t border-surface-border px-4 py-3">
      <p className="text-xs text-steel-500">
        {from}–{to} sur <span className="font-medium text-steel-700">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          icon={<ChevronLeft className="h-3.5 w-3.5" />}
        >
          Préc.
        </Button>
        <span className="px-3 text-xs text-steel-600">
          {currentPage} / {lastPage}
        </span>
        <Button
          variant="ghost"
          size="sm"
          disabled={currentPage === lastPage}
          onClick={() => onPageChange(currentPage + 1)}
          icon={<ChevronRight className="h-3.5 w-3.5" />}
        >
          Suiv.
        </Button>
      </div>
    </div>
  )
}