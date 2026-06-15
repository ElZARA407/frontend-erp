type Props = {
  title?: string;
  emptyMessage?: string;
};

export function DataTable({
  title = "Table",
  emptyMessage = "Aucune donnée pour le moment.",
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 font-medium">{title}</div>
      <div className="text-sm text-slate-500">{emptyMessage}</div>
    </div>
  );
}
