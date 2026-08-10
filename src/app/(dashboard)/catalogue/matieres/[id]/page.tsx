import { MatiereDetailView } from '@/components/features/catalogue/matiere-detail-view'

export default async function MatiereDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <MatiereDetailView id={Number(id)} />
}
