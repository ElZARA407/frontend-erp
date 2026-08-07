import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './button'

interface PaginationProps {
  currentPage?: number | null
  lastPage?: number | null
  total?: number | null
  from?: number | null
  to?: number | null
  onPageChange: (page: number) => void
}

function safeNumber(value: unknown, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export function Pagination({ currentPage, lastPage, total, from, to, onPageChange }: PaginationProps) {
  const safeTotal = Math.max(0, safeNumber(total, 0))
  const safeLastPage = Math.max(1, safeNumber(lastPage, 1))
  const safeCurrentPage = Math.min(
    Math.max(1, safeNumber(currentPage, 1)),
    safeLastPage,
  )
  const safeFrom = safeTotal === 0 ? 0 : Math.max(1, safeNumber(from, 1))
  const safeTo = safeTotal === 0 ? 0 : Math.min(safeTotal, safeNumber(to, safeFrom))

  return (
    <div className="flex items-center justify-between border-t border-surface-border px-4 py-3">
      <p className="text-xs text-steel-500">
        {safeFrom}–{safeTo} sur <span className="font-medium text-steel-700">{safeTotal}</span>
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          disabled={safeCurrentPage <= 1}
          onClick={() => onPageChange(safeCurrentPage - 1)}
          icon={<ChevronLeft className="h-3.5 w-3.5" />}
        >
          Préc.
        </Button>
        <span className="px-3 text-xs text-steel-600">
          {safeCurrentPage} / {safeLastPage}
        </span>
        <Button
          variant="ghost"
          size="sm"
          disabled={safeCurrentPage >= safeLastPage}
          onClick={() => onPageChange(safeCurrentPage + 1)}
          icon={<ChevronRight className="h-3.5 w-3.5" />}
        >
          Suiv.
        </Button>
      </div>
    </div>
  )
}