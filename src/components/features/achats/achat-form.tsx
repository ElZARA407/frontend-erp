'use client'

import { useMemo, useState } from 'react'
import { Controller, useFieldArray, useForm, useWatch, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Select } from '@/components/ui/select'
import { useCreateAchat } from '@/lib/hooks/use-achats'
import { useCreateProduct, useCategories, useMatieres, useProducts, useClassments } from '@/lib/hooks/use-catalogue'
import { useFournisseurs } from '@/lib/hooks/use-lot3'
import { useLocations } from '@/lib/hooks/use-organisation'
import { achatSchema, type AchatSchema } from '@/lib/schemas/achat.schema'
import { formatMGA } from '@/lib/utils'

type AchatLine = AchatSchema['lignes'][number]

function createEmptyLine(): AchatLine {
  return {
    article_type: 'matiere',
    matiere_id: 0,
    produit_id: undefined,
    classement_id: undefined,
    quantite: 1,
    prix_unitaire: 0,
    observations_ligne: '',
  }
}

export function AchatForm({ onSuccess }: { onSuccess?: () => void }) {
  const createAchat = useCreateAchat()
  const createProduct = useCreateProduct()

  const [showProductDialog, setShowProductDialog] = useState(false)
  const [quickProduct, setQuickProduct] = useState({
    designation: '',
    unite: 'PCS',
    colisage: 1,
    poids: 0,
    seuil: 0,
  })

  const { data: fournisseursPage } = useFournisseurs({ actif: true, per_page: 100 })
  const { data: locationsData } = useLocations()
  const { data: matieresPage } = useMatieres({ actif: true, per_page: 500 })
  const { data: productsPage } = useProducts({ actif: true, per_page: 500 })
  const { data: categoriesData } = useCategories()
  const { data: classementsData } = useClassments()

  const fournisseurs = Array.isArray(fournisseursPage?.data?.data) ? fournisseursPage.data.data : []
  const locations = Array.isArray(locationsData) ? locationsData : []
  const matieres = useMemo(
    () => (Array.isArray(matieresPage?.data?.data) ? matieresPage.data.data : []),
    [matieresPage],
  )
  const products = Array.isArray(productsPage?.data?.data) ? productsPage.data.data : []
  const categories = Array.isArray(categoriesData) ? categoriesData : []
  const classements = useMemo(
    () => (Array.isArray(classementsData) ? classementsData : []),
    [classementsData],
  )

  const mchCategory = categories.find((category) => String(category.nom).toUpperCase() === 'MCH')
  const mchProducts = products.filter((product) => String(product.categorie?.nom ?? '').toUpperCase() === 'MCH')

  const matiereOptions = useMemo(
    () => matieres.map((matiere) => ({
      value: matiere.id,
      label: `${matiere.reference} - ${matiere.nom}`,
      description: matiere.type,
    })),
    [matieres],
  )

  const productOptions = useMemo(
    () => mchProducts.map((product) => ({
      value: product.id,
      label: product.designation,
      description: product.nomencla,
    })),
    [mchProducts],
  )

  const classementOptions = useMemo(
    () => classements.map((classement) => ({
      value: classement.id,
      label: classement.qualite_libelle ?? classement.qualite ?? `Classement #${classement.id}`,
    })),
    [classements],
  )

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AchatSchema>({
    resolver: zodResolver(achatSchema) as unknown as Resolver<AchatSchema>,
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      fournisseur_id: fournisseurs[0]?.id ?? 0,
      location_id: locations[0]?.id ?? 0,
      vehicule: '',
      observations: '',
      lignes: [createEmptyLine()],
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lignes',
  })

  const lignes = useWatch({ control, name: 'lignes' }) ?? []
  const total = lignes.reduce(
    (sum, ligne) => sum + (Number(ligne.quantite) || 0) * (Number(ligne.prix_unitaire) || 0),
    0,
  )

  const onSubmit = (values: AchatSchema) => {
    createAchat.mutate(values, {
      onSuccess: () => {
        reset()
        onSuccess?.()
      },
    })
  }

  const handleCreateMchProduct = async () => {
    if (!mchCategory) return

    await createProduct.mutateAsync({
      categorie_id: mchCategory.id,
      designation: quickProduct.designation.trim(),
      contenance: null,
      format: null,
      unite: quickProduct.unite.trim() || 'PCS',
      colisage: Number(quickProduct.colisage) || 1,
      poids: String(quickProduct.poids || 0),
      seuil: Number(quickProduct.seuil) || 0,
      actif: true,
    })

    setQuickProduct({
      designation: '',
      unite: 'PCS',
      colisage: 1,
      poids: 0,
      seuil: 0,
    })
    setShowProductDialog(false)
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Select
            label="Fournisseur *"
            options={fournisseurs.map((fournisseur) => ({ value: fournisseur.id, label: fournisseur.nom }))}
            error={errors.fournisseur_id?.message}
            {...register('fournisseur_id', { valueAsNumber: true })}
          />

          <Select
            label="Location *"
            options={locations.map((location) => ({ value: location.id, label: location.nom }))}
            error={errors.location_id?.message}
            {...register('location_id', { valueAsNumber: true })}
          />

          <Input label="Date *" type="date" error={errors.date?.message} {...register('date')} />
          <Input label="Véhicule" placeholder="Immatriculation / référence" error={errors.vehicule?.message} {...register('vehicule')} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-steel-700">Observations</label>
          <textarea
            rows={3}
            className="min-h-20 w-full rounded-md border border-surface-border bg-white px-3 py-2 text-sm placeholder:text-steel-400 focus:border-steel-500 focus:outline-none focus:ring-1 focus:ring-steel-500/30"
            placeholder="Notes sur la réception"
            {...register('observations')}
          />
        </div>

        <div className="rounded-lg border border-surface-border">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-border px-4 py-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-steel-500">Lignes de réception</p>
              <p className="text-xs text-steel-400">Matières premières ou marchandises MCH.</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowProductDialog(true)}>
                NOUVEAU PRODUIT MCH
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                icon={<Plus className="h-3.5 w-3.5" />}
                onClick={() => append(createEmptyLine())}
              >
                Ajouter
              </Button>
            </div>
          </div>

          <div className="space-y-2 p-3">
            {fields.map((field, index) => {
              const ligne = lignes[index]
              const type = ligne?.article_type ?? 'matiere'
              const totalLigne = (Number(ligne?.quantite) || 0) * (Number(ligne?.prix_unitaire) || 0)

              return (
                <div
                  key={field.id}
                  className="grid grid-cols-2 gap-2 rounded-lg border border-surface-border p-2.5 md:grid-cols-12 md:items-end md:gap-2"
                >
                  <Select
                    label="Type *"
                    options={[
                      { value: 'matiere', label: 'Matière première' },
                      { value: 'produit', label: 'Produit MCH' },
                    ]}
                    className="col-span-2 md:col-span-2"
                    error={errors.lignes?.[index]?.article_type?.message}
                    {...register(`lignes.${index}.article_type` as const)}
                    onChange={(event) => {
                      const nextType = event.target.value as 'matiere' | 'produit'
                      setValue(`lignes.${index}.article_type`, nextType, { shouldValidate: true, shouldDirty: true })
                      setValue(`lignes.${index}.matiere_id`, nextType === 'matiere' ? matiereOptions[0]?.value ?? 0 : undefined, { shouldValidate: true })
                      setValue(`lignes.${index}.produit_id`, nextType === 'produit' ? productOptions[0]?.value ?? 0 : undefined, { shouldValidate: true })
                      setValue(`lignes.${index}.classement_id`, nextType === 'produit' ? classementOptions[0]?.value ?? 0 : undefined, { shouldValidate: true })
                    }}
                  />

                  {type === 'matiere' ? (
                    <Controller
                      control={control}
                      name={`lignes.${index}.matiere_id` as const}
                      render={({ field }) => (
                        <SearchableSelect
                          label="Matière *"
                          options={matiereOptions}
                          placeholder="Choisir une matière"
                          searchPlaceholder="Rechercher une référence ou un nom..."
                          noOptionsMessage="Aucune matière trouvée."
                          error={errors.lignes?.[index]?.matiere_id?.message}
                          value={field.value}
                          onValueChange={(value) => field.onChange(Number(value))}
                          className="col-span-2 md:col-span-4"
                        />
                      )}
                    />
                  ) : (
                    <Controller
                      control={control}
                      name={`lignes.${index}.produit_id` as const}
                      render={({ field }) => (
                        <SearchableSelect
                          label="Produit MCH *"
                          options={productOptions}
                          placeholder={productOptions.length ? 'Choisir un produit MCH' : 'Créer un produit MCH'}
                          searchPlaceholder="Rechercher une nomenclature ou désignation..."
                          noOptionsMessage="Aucun produit MCH trouvé."
                          error={errors.lignes?.[index]?.produit_id?.message}
                          value={field.value}
                          onValueChange={(value) => field.onChange(Number(value))}
                          className="col-span-2 md:col-span-3"
                        />
                      )}
                    />
                  )}

                  {type === 'produit' && (
                    <Controller
                      control={control}
                      name={`lignes.${index}.classement_id` as const}
                      render={({ field }) => (
                        <SearchableSelect
                          label="Classement *"
                          options={classementOptions}
                          placeholder="Choisir un classement"
                          searchPlaceholder="Rechercher..."
                          noOptionsMessage="Aucun classement."
                          error={errors.lignes?.[index]?.classement_id?.message}
                          value={field.value}
                          onValueChange={(value) => field.onChange(Number(value))}
                          className="col-span-1 md:col-span-2"
                        />
                      )}
                    />
                  )}

                  <Input
                    label="Quantité *"
                    type="number"
                    step="0.001"
                    className="col-span-1 text-right md:col-span-1"
                    error={errors.lignes?.[index]?.quantite?.message}
                    {...register(`lignes.${index}.quantite` as const, { valueAsNumber: true })}
                  />

                  <Input
                    label="PU *"
                    type="number"
                    step="1"
                    className="col-span-1 text-right md:col-span-1"
                    error={errors.lignes?.[index]?.prix_unitaire?.message}
                    {...register(`lignes.${index}.prix_unitaire` as const, { valueAsNumber: true })}
                  />

                  <div
                    className={`rounded-md border border-surface-border bg-surface-subtle px-2.5 py-1.5 col-span-1 ${
                      type === 'produit' ? 'md:col-span-2' : 'md:col-span-3'
                    }`}
                  >
                    <p className="text-[10px] uppercase tracking-wide text-steel-400">Total</p>
                    <p className="text-sm font-semibold text-steel-900 leading-tight">{formatMGA(totalLigne)}</p>
                  </div>

                  <div className="col-span-1 flex items-center justify-center md:col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      icon={<Trash2 className="h-3.5 w-3.5" />}
                      onClick={() => remove(index)}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-surface-border bg-surface-subtle px-4 py-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Total BR</p>
            <p className="mt-1 text-lg font-semibold text-steel-900">{formatMGA(total)}</p>
          </div>
          <Button type="submit" loading={createAchat.isPending}>
            Créer le BR
          </Button>
        </div>
      </form>

      <Dialog
        open={showProductDialog}
        onClose={() => setShowProductDialog(false)}
        title="Nouveau produit MCH"
        size="lg"
      >
        <div className="space-y-4">
          {!mchCategory && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              La catégorie MCH est introuvable. Créez-la d’abord dans le catalogue.
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* <Input
              label="Nomenclature *"
              value={quickProduct.nomencla}
              onChange={(event) => setQuickProduct((current) => ({ ...current, nomencla: event.target.value }))}
            /> */}
            <Input
              label="Désignation *"
              value={quickProduct.designation}
              onChange={(event) => setQuickProduct((current) => ({ ...current, designation: event.target.value }))}
            />
            <Input
              label="Unité *"
              value={quickProduct.unite}
              onChange={(event) => setQuickProduct((current) => ({ ...current, unite: event.target.value }))}
            />
            <Input
              label="Colisage"
              type="number"
              value={quickProduct.colisage}
              onChange={(event) => setQuickProduct((current) => ({ ...current, colisage: Number(event.target.value) }))}
            />
            <Input
              label="Poids"
              type="number"
              value={quickProduct.poids}
              onChange={(event) => setQuickProduct((current) => ({ ...current, poids: Number(event.target.value) }))}
            />
            <Input
              label="Seuil"
              type="number"
              value={quickProduct.seuil}
              onChange={(event) => setQuickProduct((current) => ({ ...current, seuil: Number(event.target.value) }))}
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-surface-border pt-4">
            <Button type="button" variant="outline" onClick={() => setShowProductDialog(false)}>
              Annuler
            </Button>
            <Button
              type="button"
              loading={createProduct.isPending}
              disabled={!mchCategory  || !quickProduct.designation.trim()}
              onClick={() => void handleCreateMchProduct()}
            >
              Créer le produit
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  )
}