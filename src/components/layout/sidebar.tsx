import Link from "next/link";

const items = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/clients", label: "Clients" },
  { href: "/dashboard/commandes", label: "Commandes" },
  { href: "/dashboard/production", label: "Production" },
  { href: "/dashboard/stocks", label: "Stocks" },
  { href: "/dashboard/achats", label: "Achats" },
  { href: "/dashboard/livraisons", label: "Livraisons" },
  { href: "/dashboard/factures", label: "Factures" },
  { href: "/dashboard/recyclage", label: "Recyclage" },
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-slate-950 px-5 py-6 text-slate-100 lg:block">
      <div className="mb-8">
        <div className="text-xs uppercase tracking-[0.3em] text-cyan-300">CMP ERP</div>
        <div className="mt-2 text-2xl font-semibold">Frontend</div>
      </div>
      <nav className="space-y-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-xl px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
