import { PageHeader } from "@/components/layout/page-header";
import { StockTable } from "@/components/features/stocks/stock-table";

export default function StocksPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Stocks" description="Consultation des stocks." />
      <StockTable />
    </div>
  );
}
