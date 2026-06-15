export function Topbar() {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm text-slate-500">Projet ERP CMP</p>
        <p className="font-medium">Interface de gestion</p>
      </div>
      <div className="text-sm text-slate-500">Prêt à connecter l'API</div>
    </header>
  );
}
