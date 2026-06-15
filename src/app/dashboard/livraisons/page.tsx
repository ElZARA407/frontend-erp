import { PageHeader } from "@/components/layout/page-header";
import { LivraisonTable } from "@/components/features/livraisons/livraison-table";

export default function LivraisonsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Livraisons" description="Suivi des livraisons." />
      <LivraisonTable />
    </div>
  );
}
