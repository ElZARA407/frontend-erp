import { PageHeader } from "@/components/layout/page-header";
import { CommandeTable } from "@/components/features/commandes/commande-table";

export default function CommandesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Commandes"
        description="Gestion des commandes et du cycle de vente."
      />
      <CommandeTable />
    </div>
  );
}
