import { PageHeader } from "@/components/layout/page-header";
import { BpTable } from "@/components/features/production/bp-table";

export default function ProductionPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Production"
        description="Bons de production et suivi des sessions."
      />
      <BpTable />
    </div>
  );
}
