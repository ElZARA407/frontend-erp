import { PageHeader } from "@/components/layout/page-header";
import { ClientTable } from "@/components/features/clients/client-table";

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        description="Liste des clients et préparation des appels API."
      />
      <ClientTable />
    </div>
  );
}
