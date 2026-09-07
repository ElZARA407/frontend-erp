export default function DashboardLoading() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Chargement de la page">
      <div className="h-8 w-56 animate-pulse rounded bg-steel-100" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-md bg-steel-100" />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-md bg-steel-100" />
    </div>
  )
}
