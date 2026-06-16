import { PageHeader } from "@/components/layout/page-header";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Client #${id}`}
        // description="Fiche détail prête pour brancher l'API."
      />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        Détails client à implémenter.
      </div>
    </div>
  );
}
