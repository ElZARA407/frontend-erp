'use client'
import {  useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FlaskConical, Layers3, Package, PencilLine, Plus, Trash2, Upload } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Pagination } from '@/components/ui/pagination'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ExcelImportDialog } from '@/components/ui/excel-import-dialog'
import { formatDate, formatDateTime, formatMGA, formatQty } from '@/lib/utils'
import { DateRangeFilter } from '@/components/ui/date-range-filter'
import { useLocations } from '@/lib/hooks/use-organisation'
import {
  useCategories,
  useDeleteCategory,
  useDeleteMatiere,
  useDeleteProduct,
  useImportMatieres,
  useImportProducts,
  useMatieres,
  useProducts,
} from '@/lib/hooks/use-catalogue'
import type {
  CatalogueMatiere,
  CatalogueProduct,
} from '@/lib/catalogue.types'
import { CategorieForm } from './categorie-form'
import { MatiereForm } from './matiere-form'
import { ProduitForm } from './produit-form'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { SortControl, type SortDirection } from '@/components/ui/sort-control'

type CatalogueTab = 'categories' | 'produits' | 'matieres'

const PAGE_SIZE = 10



function getProductQualitesLabel(product: CatalogueProduct) {
  const stocks = Array.isArray(product.stocks_par_qualite) ? product.stocks_par_qualite : []

  if (stocks.length === 0) return 'Aucune qualité'

  return stocks
    .map((stock) => {
      const label = stock.libelle ?? stock.qualite ?? `Q#${stock.classement_id}`
      const qty = Number(stock.stock_disponible_fictif ?? stock.stock_disponible ?? stock.stock_total ?? 0)

      return `${label} (${formatQty(qty)})`
    })
    .join(' / ')
}

function getProductPrixLabel(product: CatalogueProduct) {
  const stocks = Array.isArray(product.stocks_par_qualite) ? product.stocks_par_qualite : []

  if (stocks.length === 0) return '—'

  return stocks
    .map((stock) => {
      const label = stock.libelle ?? stock.qualite ?? `Q#${stock.classement_id}`
      return `${label}: ${formatMGA(Number(stock.prix_unitaire ?? 0))}`
    })
    .join(' / ')
}

export function CatalogueView() {
  const router = useRouter()
  const [tab, setTab] = useState<CatalogueTab>('categories')
  const [productLocationId, setProductLocationId] = useState('')
  const [productStockState, setProductStockState] = useState<'all' | 'available' | 'rupture'>('all')
  const [productDateDebut, setProductDateDebut] = useState('')
  const [productDateFin, setProductDateFin] = useState('')
  const [confirmAction, setConfirmAction] = useState<null | {
  type: 'delete-category' | 'delete-product' | 'delete-matiere'
  id: number
}>(null)
  const [productSortBy, setProductSortBy] = useState('date')
  const [productSortDir, setProductSortDir] = useState<SortDirection>('desc')

  const [matiereSortBy, setMatiereSortBy] = useState('date')
  const [matiereSortDir, setMatiereSortDir] = useState<SortDirection>('desc')


const [matiereLocationId, setMatiereLocationId] = useState('')
const [matiereStockState, setMatiereStockState] = useState<'all' | 'available' | 'rupture'>('all')
const [matiereDateDebut, setMatiereDateDebut] = useState('')
const [matiereDateFin, setMatiereDateFin] = useState('')

  const [categoryPage, setCategoryPage] = useState(1)

  const [productPage, setProductPage] = useState(1)
  const [productSearch, setProductSearch] = useState('')
  const [productCategoryId, setProductCategoryId] = useState<string>('')
  const [productActive, setProductActive] = useState<string>('')

  const [matierePage, setMatierePage] = useState(1)
  const [matiereSearch, setMatiereSearch] = useState('')
  const [matiereType, setMatiereType] = useState<string>('')
  const [matiereActive, setMatiereActive] = useState<string>('')

  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [showProductDialog, setShowProductDialog] = useState(false)
  const [showMatiereDialog, setShowMatiereDialog] = useState(false)
  const [showProductImportDialog, setShowProductImportDialog] = useState(false)
  const [showMatiereImportDialog, setShowMatiereImportDialog] = useState(false)

  const [selectedProduct, setSelectedProduct] = useState<CatalogueProduct | null>(null)
  const [selectedMatiere, setSelectedMatiere] = useState<CatalogueMatiere | null>(null)

  const { data: categories, isLoading: categoriesLoading } = useCategories()
  const { data: locationsData } = useLocations()
  const locations = Array.isArray(locationsData) ? locationsData : []
  const { data: productsPage, isLoading: productsLoading } = useProducts({
    search: productSearch || undefined,
    categorie_id: productCategoryId ? Number(productCategoryId) : undefined,
    actif: productActive === '' ? undefined : productActive === 'true',
    location_id: productLocationId ? Number(productLocationId) : undefined,
    stock_state: productStockState === 'all' ? undefined : productStockState,
    date_debut: productDateDebut || undefined,
    date_fin: productDateFin || undefined,
    page: productPage,
    per_page: PAGE_SIZE,
    sort_by: productSortBy,
    sort_dir: productSortDir,
  })
  const { data: matieresPage, isLoading: matieresLoading } = useMatieres({
    search: matiereSearch || undefined,
    type: matiereType || undefined,
    actif: matiereActive === '' ? undefined : matiereActive === 'true',
    location_id: matiereLocationId ? Number(matiereLocationId) : undefined,
    stock_state: matiereStockState === 'all' ? undefined : matiereStockState,
    date_debut: matiereDateDebut || undefined,
    date_fin: matiereDateFin || undefined,
    page: matierePage,
    per_page: PAGE_SIZE,
    sort_by: matiereSortBy,
    sort_dir: matiereSortDir,
  })

  const productsPageData = productsPage?.data
  const matieresPageData = matieresPage?.data

  const deleteCategory = useDeleteCategory()
  const deleteProduct = useDeleteProduct()
  const deleteMatiere = useDeleteMatiere()
  const importProducts = useImportProducts()
  const importMatieres = useImportMatieres()

  const categoriesList = useMemo(() => categories ?? [], [categories])
  const products = Array.isArray(productsPageData?.data) ? productsPageData.data : []
  const matieres = Array.isArray(matieresPageData?.data) ? matieresPageData.data : []

  const categoriesPageData = useMemo(() => {
    const total = categoriesList.length
    const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE))
    const currentPage = Math.min(Math.max(categoryPage, 1), lastPage)
    const start = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE
    const end = total === 0 ? 0 : Math.min(start + PAGE_SIZE, total)

    return {
      data: categoriesList.slice(start, end),
      current_page: currentPage,
      last_page: lastPage,
      total,
      from: total === 0 ? 0 : start + 1,
      to: end,
    }
  }, [categoriesList, categoryPage])

  // useEffect(() => {
  //   setProductPage(1)
  // }, [
  //   productSearch,
  //   productCategoryId,
  //   productActive,
  //   productLocationId,
  //   productStockState,
  //   productDateDebut,
  //   productDateFin,
  // ])

  // useEffect(() => {
  //   setMatierePage(1)
  // }, [
  //   matiereSearch,
  //   matiereType,
  //   matiereActive,
  //   matiereLocationId,
  //   matiereStockState,
  //   matiereDateDebut,
  //   matiereDateFin,
  // ])

  const headerActions =
    tab === 'categories' ? (
      <Button
        icon={<Plus className="h-3.5 w-3.5" />}
        onClick={() => setShowCategoryDialog(true)}
      >
        Nouvelle catégorie
      </Button>
    ) : tab === 'produits' ? (
      <>
        <Button
          variant="outline"
          icon={<Upload className="h-3.5 w-3.5" />}
          loading={importProducts.isPending}
          onClick={() => setShowProductImportDialog(true)}
        >
          Importer Excel
        </Button>
        <Button
          icon={<Plus className="h-3.5 w-3.5" />}
          onClick={() => {
            setSelectedProduct(null)
            setShowProductDialog(true)
          }}
        >
          Nouveau produit
        </Button>
      </>
    ) : (
      <>
        <Button
          variant="outline"
          icon={<Upload className="h-3.5 w-3.5" />}
          loading={importMatieres.isPending}
          onClick={() => setShowMatiereImportDialog(true)}
        >
          Importer Excel
        </Button>
        <Button
          icon={<Plus className="h-3.5 w-3.5" />}
          onClick={() => {
            setSelectedMatiere(null)
            setShowMatiereDialog(true)
          }}
        >
          Nouvelle matière
        </Button>
      </>
    )

  const handleImportProducts = async ({
    file,
    sheetNames,
  }: {
    file: File
    sheetNames: string[]
  }) => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      sheetNames.forEach((sheetName) => {
        formData.append('sheet_names[]', sheetName)
      })

      await importProducts.mutateAsync(formData)
      setShowProductImportDialog(false)
    } catch {
      // toast géré par le hook
    }
  }

  const handleImportMatieres = async ({
    file,
    sheetNames,
  }: {
    file: File
    sheetNames: string[]
  }) => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      sheetNames.forEach((sheetName) => {
        formData.append('sheet_names[]', sheetName)
      })

      await importMatieres.mutateAsync(formData)
      setShowMatiereImportDialog(false)
    } catch {
      // toast géré par le hook
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Catalogue"
        subtitle="Catégories, produits et matières premières"
        actions={headerActions}
      />

      <div className="flex flex-wrap gap-2">
        {[
          { key: 'categories', label: 'Catégories', icon: Layers3 },
          { key: 'produits', label: 'Produits', icon: Package },
          { key: 'matieres', label: 'Matières', icon: FlaskConical },
        ].map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={tab === key ? 'primary' : 'outline'}
            size="sm"
            icon={<Icon className="h-3.5 w-3.5" />}
            onClick={() => setTab(key as CatalogueTab)}
          >
            {label}
          </Button>
        ))}
      </div>

      {tab === 'categories' && (
        <div className="space-y-5">
          <Card>
            {categoriesLoading ? (
              <div className="space-y-3 p-5">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-surface-border text-left text-xs uppercase tracking-wide text-steel-400">
                        <th className="px-4 py-3">Nom</th>
                        <th className="px-4 py-3">Produits</th>
                        <th className="px-4 py-3">Créée le</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border">
                      {categoriesPageData.data.map((category) => (
                        <tr key={category.id} className="hover:bg-surface-subtle/70">
                          <td className="px-4 py-3 font-medium text-steel-900">{category.nom}</td>
                          <td className="px-4 py-3">
                            <Badge variant="info">{category.produits_count ?? 0}</Badge>
                          </td>
                          <td className="px-4 py-3 text-steel-500">
                            {formatDateTime(category.created_at)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<Trash2 className="h-3.5 w-3.5" />}
                                onClick={() => setConfirmAction({ type: 'delete-category', id: category.id })}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  currentPage={categoriesPageData.current_page}
                  lastPage={categoriesPageData.last_page}
                  total={categoriesPageData.total}
                  from={categoriesPageData.from}
                  to={categoriesPageData.to}
                  onPageChange={setCategoryPage}
                />
              </>
            )}
          </Card>
        </div>
      )}

      {tab === 'produits' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-end gap-3">
            <Input
              className="w-full md:w-72"
              label="Recherche"
              placeholder="Nomenclature ou désignation"
              value={productSearch}
              onChange={(e) => {
                setProductSearch(e.target.value)
                setProductPage(1)
              }}
            />
            <Select
              className="w-full md:w-56"
              label="Catégorie"
              placeholder="Toutes"
              options={categoriesList.map((category) => ({
                value: category.id,
                label: category.nom,
              }))}
              value={productCategoryId}
              onChange={(e) => {
                setProductCategoryId(e.target.value)
                setProductPage(1)
              }}
            />
            <Select
              className="w-full md:w-44"
              label="Statut"
              placeholder="Tous"
              options={[
                { value: 'true', label: 'Actifs' },
                { value: 'false', label: 'Inactifs' },
              ]}
              value={productActive}
              onChange={(e) => {
                setProductActive(e.target.value)
                setProductPage(1)
              }}
            />

            <Select
              className="w-full md:w-56"
              label="Location"
              placeholder="Toutes"
              options={locations.map((location) => ({
                value: location.id,
                label: location.nom,
              }))}
              value={productLocationId}
              onChange={(e) => {
                setProductLocationId(e.target.value)
                setProductPage(1)
              }}
            />

            <Select
              className="w-full md:w-44"
              label="Stock"
              options={[
                { value: 'all', label: 'Tous' },
                { value: 'available', label: 'Disponible' },
                { value: 'rupture', label: 'Rupture' },
              ]}
              value={productStockState}
              onChange={(e) => {
                setProductStockState(e.target.value as 'all' | 'available' | 'rupture')
                setProductPage(1)
              }}
            />

            <DateRangeFilter
              className="w-full md:w-[28rem]"
              dateDebut={productDateDebut}
              dateFin={productDateFin}
              onDateDebutChange={(value) => {
                setProductDateDebut(value)
                setProductPage(1)
              }}
              onDateFinChange={(value) => {
                setProductDateFin(value)
                setProductPage(1)
              }}
            />
            <SortControl
              sortBy={productSortBy}
              sortDir={productSortDir}
              options={[
                { value: 'date', label: 'Date' },
                { value: 'designation', label: 'Désignation' },
                { value: 'reference', label: 'Référence' },
              ]}
              onSortByChange={(value) => {
                setProductSortBy(value)
                setProductPage(1)
              }}
              onSortDirChange={(value) => {
                setProductSortDir(value)
                setProductPage(1)
              }}
            />
          </div>

          <Card>
            {productsLoading ? (
              <div className="space-y-3 p-5">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-surface-border text-left text-xs uppercase tracking-wide text-steel-400">
                        <th className="px-4 py-3">Nomencla</th>
                        <th className="px-4 py-3">Désignation</th>
                        <th className="px-4 py-3">Catégorie</th>
                        <th className="px-4 py-3">Stock</th>
                        <th className="px-4 py-3">Actif</th>
                        <th className="px-4 py-3">Prix unitaire</th>
                        <th className="px-4 py-3">Créé le</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border">
                      {products.map((product: CatalogueProduct) => (
                        <tr
                          key={product.id}
                          className="cursor-pointer hover:bg-surface-subtle/70"
                          onClick={() => router.push(`/catalogue/produits/${product.id}`)}
                        >
                          <td className="px-4 py-3 font-medium text-steel-900">{product.nomencla}</td>
                          <td className="px-4 py-3 text-steel-600">{product.designation}</td>
                          <td className="px-4 py-3">
                            <Badge variant="info">{product.categorie?.nom ?? '—'}</Badge>
                          </td>
                          <td className="px-4 py-3 text-steel-600">
                            {getProductQualitesLabel(product)}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={product.actif ? 'success' : 'muted'} dot>
                              {product.actif ? 'Actif' : 'Inactif'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-steel-600">{getProductPrixLabel(product)}</td>
                          <td className="px-4 py-3 text-steel-500">
                            {formatDate(product.created_at)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<PencilLine className="h-3.5 w-3.5" />}
                                onClick={(event) => {
                                  event.stopPropagation()
                                  setSelectedProduct(product)
                                  setShowProductDialog(true)
                                }}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<Trash2 className="h-3.5 w-3.5" />}
                                onClick={(event) => {
                                  event.stopPropagation()
                                  setConfirmAction({ type: 'delete-product', id: product.id })
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {productsPageData && (
                  <Pagination
                    currentPage={productsPageData.current_page ?? productPage}
                    lastPage={productsPageData.last_page ?? 1}
                    total={productsPageData.total ?? 0}
                    from={productsPageData.from ?? 0}
                    to={productsPageData.to ?? 0}
                    onPageChange={setProductPage}
                  />
                )}
              </>
            )}
          </Card>
        </div>
      )}

      {tab === 'matieres' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-end gap-3">
            <Input
              className="w-full md:w-72"
              label="Recherche"
              placeholder="Nom ou référence"
              value={matiereSearch}
              onChange={(e) => {
                setMatiereSearch(e.target.value)
                setMatierePage(1)
              }}
            />
            <Select
              className="w-full md:w-52"
              label="Type"
              placeholder="Tous"
              options={[
                { value: 'preformes', label: 'Préformes' },
                { value: 'broyee', label: 'Broyée' },
                { value: 'brute', label: 'Brute' },
                { value: 'vierge', label: 'Vierge' },
                { value: 'colorant', label: 'Colorant' },
                { value: 'autre', label: 'Autre' },
              ]}
              value={matiereType}
              onChange={(e) => {
                setMatiereType(e.target.value)
                setMatierePage(1)
              }}
            />
            <Select
              className="w-full md:w-44"
              label="Statut"
              placeholder="Tous"
              options={[
                { value: 'true', label: 'Actifs' },
                { value: 'false', label: 'Inactifs' },
              ]}
              value={matiereActive}
              onChange={(e) => {
                setMatiereActive(e.target.value)
                setMatierePage(1)
              }}
            />

            <Select
              className="w-full md:w-56"
              label="Location"
              placeholder="Toutes"
              options={locations.map((location) => ({
                value: location.id,
                label: location.nom,
              }))}
              value={matiereLocationId}
              onChange={(e) => {
                setMatiereLocationId(e.target.value)
                setMatierePage(1)
              }}
            />

            <Select
              className="w-full md:w-44"
              label="Stock"
              options={[
                { value: 'all', label: 'Tous' },
                { value: 'available', label: 'Disponible' },
                { value: 'rupture', label: 'Rupture' },
              ]}
              value={matiereStockState}
              onChange={(e) => {
                setMatiereStockState(e.target.value as 'all' | 'available' | 'rupture')
                setMatierePage(1)
              }}
            />

            <DateRangeFilter
              className="w-full md:w-[28rem]"
              dateDebut={matiereDateDebut}
              dateFin={matiereDateFin}
              onDateDebutChange={(value) => {
                setMatiereDateDebut(value)
                setMatierePage(1)
              }}
              onDateFinChange={(value) => {
                setMatiereDateFin(value)
                setMatierePage(1)
              }}
            />

            <SortControl
              sortBy={matiereSortBy}
              sortDir={matiereSortDir}
              options={[
                { value: 'date', label: 'Date' },
                { value: 'nom', label: 'Nom' },
                { value: 'reference', label: 'Référence' },
              ]}
              onSortByChange={(value) => {
                setMatiereSortBy(value)
                setMatierePage(1)
              }}
              onSortDirChange={(value) => {
                setMatiereSortDir(value)
                setMatierePage(1)
              }}
            />
          </div>

          <Card>
            {matieresLoading ? (
              <div className="space-y-3 p-5">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-surface-border text-left text-xs uppercase tracking-wide text-steel-400">
                        <th className="px-4 py-3">Référence</th>
                        <th className="px-4 py-3">Nom</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Stock</th>
                        <th className="px-4 py-3">Prix moyen</th>
                        <th className="px-4 py-3">Actif</th>
                        <th className="px-4 py-3">Créée le</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border">
                      {matieres.map((matiere: CatalogueMatiere) => (
                        <tr
                          key={matiere.id}
                          className="cursor-pointer hover:bg-surface-subtle/70"
                          onClick={() => router.push(`/catalogue/matieres/${matiere.id}`)}
                        >
                          <td className="px-4 py-3 font-medium text-steel-900">{matiere.reference}</td>
                          <td className="px-4 py-3 text-steel-600">{matiere.nom}</td>
                          <td className="px-4 py-3">
                            <Badge variant="info">{matiere.type}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-medium text-steel-700">
                              {formatQty(matiere.stock_total)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-medium text-steel-700">
                              {formatMGA(matiere.prix_moyen)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={matiere.actif ? 'success' : 'muted'} dot>
                              {matiere.actif ? 'Actif' : 'Inactif'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-steel-500">
                            {formatDate(matiere.created_at)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<PencilLine className="h-3.5 w-3.5" />}
                                onClick={(event) => {
                                  event.stopPropagation()
                                  setSelectedMatiere(matiere)
                                  setShowMatiereDialog(true)
                                }}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<Trash2 className="h-3.5 w-3.5" />}
                                onClick={(event) => {
                                  event.stopPropagation()
                                  setConfirmAction({ type: 'delete-matiere', id: matiere.id })
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {matieresPageData && (
                  <Pagination
                    currentPage={matieresPageData.current_page ?? matierePage}
                    lastPage={matieresPageData.last_page ?? 1}
                    total={matieresPageData.total ?? 0}
                    from={matieresPageData.from ?? 0}
                    to={matieresPageData.to ?? 0}
                    onPageChange={setMatierePage}
                  />
                )}
              </>
            )}
          </Card>
        </div>
      )}

      <Dialog
        open={showCategoryDialog}
        onClose={() => setShowCategoryDialog(false)}
        title="Nouvelle catégorie"
        size="sm"
      >
        <CategorieForm onSuccess={() => setShowCategoryDialog(false)} />
      </Dialog>

      <Dialog
        open={showProductDialog}
        onClose={() => setShowProductDialog(false)}
        title={selectedProduct ? 'Modifier le produit' : 'Nouveau produit'}
        size="xl"
      >
        <ProduitForm
          key={selectedProduct?.id ?? 'product-new'}
          categories={categoriesList}
          defaultValues={selectedProduct ?? undefined}
          onSuccess={() => setShowProductDialog(false)}
        />
      </Dialog>

      <Dialog
        open={showMatiereDialog}
        onClose={() => setShowMatiereDialog(false)}
        title={selectedMatiere ? 'Modifier la matière' : 'Nouvelle matière'}
        size="lg"
      >
        <MatiereForm
          key={selectedMatiere?.id ?? 'matiere-new'}
          defaultValues={selectedMatiere ?? undefined}
          onSuccess={() => setShowMatiereDialog(false)}
        />
      </Dialog>

      <ExcelImportDialog
        open={showProductImportDialog}
        onOpenChange={setShowProductImportDialog}
        title="Importer des produits"
        description="Importe les produits depuis le fichier modèle du catalogue."
        loading={importProducts.isPending}
        defaultSheetNames={['Produits_classifies']}
        onImport={handleImportProducts}
      />

      <ExcelImportDialog
        open={showMatiereImportDialog}
        onOpenChange={setShowMatiereImportDialog}
        title="Importer des matières"
        description="Importe les matières premières depuis le fichier modèle du catalogue."
        loading={importMatieres.isPending}
        defaultSheetNames={['Sheet1']}
        onImport={handleImportMatieres}
      />

      <ConfirmationDialog
  open={confirmAction !== null}
  title="Suppression"
  description={
    confirmAction?.type === 'delete-category'
      ? 'Voulez vous vraiment supprimer cette catégorie ?'
      : confirmAction?.type === 'delete-product'
        ? 'Voulez vous vraiment archiver ce produit ?'
        : 'Voulez vous vraiment archiver cette matière ?'
  }
  confirmLabel="Oui"
  cancelLabel="Non"
  variant="danger"
  loading={deleteCategory.isPending || deleteProduct.isPending || deleteMatiere.isPending}
  onClose={() => setConfirmAction(null)}
  onConfirm={() => {
    if (!confirmAction) return

    const options = { onSuccess: () => setConfirmAction(null) }

    if (confirmAction.type === 'delete-category') deleteCategory.mutate(confirmAction.id, options)
    if (confirmAction.type === 'delete-product') deleteProduct.mutate(confirmAction.id, options)
    if (confirmAction.type === 'delete-matiere') deleteMatiere.mutate(confirmAction.id, options)
  }}
/>
    </div>
  )
}
