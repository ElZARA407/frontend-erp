import { PageHeader } from "@/components/layout/page-header";
import { FactureTable } from "@/components/features/factures/facture-table";

export default function FacturesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Factures" description="Gestion de la facturation." />
      <FactureTable />
    </div>
  );
}
