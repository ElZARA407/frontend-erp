import { PageHeader } from "@/components/layout/page-header";
import { AchatTable } from "@/components/features/achats/achat-table";

export default function AchatsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Achats" description="Demandes et réceptions." />
      <AchatTable />
    </div>
  );
}
