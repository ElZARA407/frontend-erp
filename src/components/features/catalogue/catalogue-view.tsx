// src/components/features/catalogue/catalogue-view.tsx
'use client'

import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Pagination } from '@/components/ui/pagination'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDateTime, formatMGA, formatQty } from '@/lib/utils'
import {
  useCategories,
  useDeleteCategory,
  useDeleteMatiere,
  useDeleteProduct,
  useMatieres,
  useProducts,
} from '@/lib/hooks/use-catalogue'
import type {
  CatalogueCategory,
  CatalogueMatiere,
  CatalogueProduct,
} from '@/lib/catalogue.types'
import { CategorieForm } from './categorie-form'
import { MatiereForm } from './matiere-form'
import { ProduitForm } from './produit-form'
import {
  Layers3,
  Package,
  FlaskConical,
  Plus,
  PencilLine,
  Trash2,
} from 'lucide-react'

type CatalogueTab = 'categories' | 'produits' | 'matieres'

export function CatalogueView() {
  const [tab, setTab] = useState<CatalogueTab>('categories')

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

  const [selectedProduct, setSelectedProduct] = useState<CatalogueProduct | null>(null)
  const [selectedMatiere, setSelectedMatiere] = useState<CatalogueMatiere | null>(null)

  const { data: categories, isLoading: categoriesLoading } = useCategories()
  const { data: productsPage, isLoading: productsLoading } = useProducts({
    search: productSearch || undefined,
    categorie_id: productCategoryId ? Number(productCategoryId) : undefined,
    actif: productActive === '' ? undefined : productActive === 'true',
    page: productPage,
    per_page: 20,
  })
  const { data: matieresPage, isLoading: matieresLoading } = useMatieres({
    search: matiereSearch || undefined,
    type: matiereType || undefined,
    actif: matiereActive === '' ? undefined : matiereActive === 'true',
    page: matierePage,
    per_page: 20,
  })

  const deleteCategory = useDeleteCategory()
  const deleteProduct = useDeleteProduct()
  const deleteMatiere = useDeleteMatiere()

  const categoriesList = useMemo(() => categories ?? [], [categories])
  const products = productsPage?.data ?? []
  const matieres = matieresPage?.data ?? []

  return (
    <div className="space-y-5">
      <PageHeader
        title="Catalogue"
        subtitle="Catégories, produits et matières premières"
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
          <div className="flex justify-end">
            <Button icon={<Plus className="h-3.5 w-3.5" />} onClick={() => setShowCategoryDialog(true)}>
              Nouvelle catégorie
            </Button>
          </div>

          <Card>
            {categoriesLoading ? (
              <div className="space-y-3 p-5">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
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
                    {categoriesList.map((category) => (
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
                              onClick={() => deleteCategory.mutate(category.id)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
            <Button
              className="ml-auto"
              icon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => {
                setSelectedProduct(null)
                setShowProductDialog(true)
              }}
            >
              Nouveau produit
            </Button>
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
                        <th className="px-4 py-3">Classements</th>
                        <th className="px-4 py-3">Actif</th>
                        <th className="px-4 py-3">Créé le</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border">
                      {(Array.isArray(products) ? products : (products as any)?.data || []).map((product: CatalogueProduct) => (
                        <tr key={product.id} className="hover:bg-surface-subtle/70">
                          <td className="px-4 py-3 font-medium text-steel-900">{product.nomencla}</td>
                          <td className="px-4 py-3 text-steel-600">{product.designation}</td>
                          <td className="px-4 py-3">
                            <Badge variant="info">{product.categorie?.nom ?? '—'}</Badge>
                          </td>
                          <td className="px-4 py-3 text-steel-600">
                            {product.classements?.length ?? 0}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={product.actif ? 'success' : 'muted'} dot>
                              {product.actif ? 'Actif' : 'Inactif'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-steel-500">
                            {formatDateTime(product.created_at)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<PencilLine className="h-3.5 w-3.5" />}
                                onClick={() => {
                                  setSelectedProduct(product)
                                  setShowProductDialog(true)
                                }}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<Trash2 className="h-3.5 w-3.5" />}
                                onClick={() => deleteProduct.mutate(product.id)}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {productsPage && (
                <Pagination
                    currentPage={productPage} // Uses your local state tracking variable
                    lastPage={(productsPage as any).last_page || 1}
                    total={(productsPage as any).total || 0}
                    from={(productsPage as any).from ?? 0}
                    to={(productsPage as any).to ?? 0}
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
            <Button
              className="ml-auto"
              icon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => {
                setSelectedMatiere(null)
                setShowMatiereDialog(true)
              }}
            >
              Nouvelle matière
            </Button>
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
                        {(Array.isArray(matieres) ? matieres : (matieres as any)?.data || []).map((matiere: CatalogueMatiere) => (
                        <tr key={matiere.id} className="hover:bg-surface-subtle/70">
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
                            {formatDateTime(matiere.created_at)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<PencilLine className="h-3.5 w-3.5" />}
                                onClick={() => {
                                  setSelectedMatiere(matiere)
                                  setShowMatiereDialog(true)
                                }}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<Trash2 className="h-3.5 w-3.5" />}
                                onClick={() => deleteMatiere.mutate(matiere.id)}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {matieresPage && (
                <Pagination
                    currentPage={matierePage} // Uses your local state tracking variable for matieres
                    lastPage={(matieresPage as any).last_page || 1}
                    total={(matieresPage as any).total || 0}
                    from={(matieresPage as any).from ?? 0}
                    to={(matieresPage as any).to ?? 0}
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
          defaultValues={selectedMatiere ?? undefined}
          onSuccess={() => setShowMatiereDialog(false)}
        />
      </Dialog>
    </div>
  )
}