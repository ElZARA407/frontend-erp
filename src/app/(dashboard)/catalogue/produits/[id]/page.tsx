import { ProduitDetailView } from '@/components/features/catalogue/produit-detail-view'

export default async function ProduitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <ProduitDetailView id={Number(id)} />
}
