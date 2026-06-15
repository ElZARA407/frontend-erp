import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/ui/stat-card";

const stats = [
  { label: "Clients", value: "0", description: "Données à connecter" },
  { label: "Commandes", value: "0", description: "Flux commercial" },
  { label: "Stocks", value: "0", description: "Suivi en temps réel" },
  { label: "Factures", value: "0", description: "Facturation" },
];

export default function DashboardHomePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble du backend et des modules métier."
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            title={stat.label}
            value={stat.value}
            description={stat.description}
          />
        ))}
      </section>
    </div>
  );
}
