import { Input } from '@/components/ui/input'

interface DateRangeFilterProps {
  dateDebut: string
  dateFin: string
  onDateDebutChange: (value: string) => void
  onDateFinChange: (value: string) => void
  className?: string
}

export function DateRangeFilter({
  dateDebut,
  dateFin,
  onDateDebutChange,
  onDateFinChange,
  className,
}: DateRangeFilterProps) {
  return (
    <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${className ?? ''}`}>
      <Input
        label="Du"
        type="date"
        value={dateDebut}
        onChange={(event) => onDateDebutChange(event.target.value)}
      />
      <Input
        label="Au"
        type="date"
        value={dateFin}
        onChange={(event) => onDateFinChange(event.target.value)}
      />
    </div>
  )
}