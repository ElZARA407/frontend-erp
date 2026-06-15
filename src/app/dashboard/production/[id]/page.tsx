import { PageHeader } from "@/components/layout/page-header";

export default async function ProductionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Production #${id}`}
        description="Détail du bon de production."
      />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        Détails production à implémenter.
      </div>
    </div>
  );
}
