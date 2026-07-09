import { StocksView } from '@/components/features/stocks/stocks-view'
import { PageHeader } from '@/components/layout/page-header'

export default function StocksPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Stock" />
      <StocksView />
    </div>
  )
}