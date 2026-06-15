import { PageHeader } from "@/components/layout/page-header";

export default async function CommandeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Commande #${id}`}
        description="Suivi détaillé de la commande."
      />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        Détails commande à implémenter.
      </div>
    </div>
  );
}
