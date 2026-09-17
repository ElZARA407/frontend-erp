'use client'

import { useEffect, useMemo, useRef } from 'react'
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
  type Control,
  type FieldErrors,
  type Resolver,
  type UseFormRegister,
  type UseFormSetValue,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, ShieldCheck, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { useClients } from '@/lib/hooks/use-clients'
import { useLocations } from '@/lib/hooks/use-organisation'
import { useProducts } from '@/lib/hooks/use-catalogue'
import {
  useCorrectVenteDirecteAdmin,
  useUpdateVenteDirecte,
} from '@/lib/hooks/use-ventes-directes'
import { createIdempotencyKey } from '@/lib/idempotency'
import { formatMGA, formatQty } from '@/lib/utils'
import {
  venteDirecteSchema,
  type VenteDirecteSchema,
} from '@/lib/schemas/ventes-directes.schema'
import type { CatalogueProduct } from '@/lib/catalogue.types'
import type {
  VenteDirecte,
  VenteDirectePayload,
} from '@/lib/ventes-directes.types'

interface VenteDirecteFormProps {
  defaultValues?: VenteDirecte

  /*
   * Utilisé exclusivement par la vue des brouillons.
   * Ce payload n'est pas encore une vente directe réelle.
   */
  draftValues?: VenteDirectePayload | null

  correctionAdmin?: boolean

  /*
   * Permet au bouton situé dans la vue/Dialog de soumettre ce formulaire.
   */
  formId?: string

  /*
   * true : le pied de page de la vue porte le bouton de sauvegarde.
   */
  hideActions?: boolean

  /*
   * Si fourni, le formulaire n'écrit jamais dans ventes_directes.
   * Il transmet les données au parent pour enregistrer le brouillon partagé.
   */
  onSaveDraft?: (payload: VenteDirectePayload) => Promise<void>

  onSuccess?: () => void
}

type VenteDirecteFormValues = VenteDirecteSchema
type VenteDirecteLineFormValues =
  VenteDirecteFormValues['lignes'][number]

function createEmptyLine(): VenteDirecteLineFormValues {
  return {
    produit_id: 0,
    classement_id: 0,
    quantite: 1,
    prix_unitaire: 0,
  }
}

function getFictifStock(item: {
  stock_disponible_fictif?: number
  stock_disponible?: number
  stock_total?: number
}) {
  return Number(
    item.stock_disponible_fictif ??
      item.stock_disponible ??
      item.stock_total ??
      0,
  )
}

function getAvailableClassements(
  product?: CatalogueProduct | null,
) {
  const stockList = Array.isArray(product?.stocks_par_qualite)
    ? product.stocks_par_qualite
    : []

  return stockList
    .filter((item) => Number(item.classement_id) > 0)
    .map((item) => ({
      value: Number(item.classement_id),
      label:
        item.libelle ??
        item.qualite ??
        `Classement #${item.classement_id}`,
      stock_total: getFictifStock(item),
      stock_reel: Number(item.stock_total) || 0,
      stock_reserve: Number(item.stock_reserve) || 0,
    }))
}

export function VenteDirecteForm({
  defaultValues,
  draftValues = null,
  correctionAdmin = false,
  formId,
  hideActions = false,
  onSaveDraft,
  onSuccess,
}: VenteDirecteFormProps) {
  const updateVente = useUpdateVenteDirecte()
  const correctVenteAdmin = useCorrectVenteDirecteAdmin()

  const isEditingRealDocument = Boolean(defaultValues?.id)

  /*
   * Un brouillon existant ne doit jamais être écrasé par les valeurs
   * automatiques provenant du stock actuel.
   */
  const hasInitialValues =
    isEditingRealDocument ||
    Boolean(draftValues)

  const { data: clientsPage } = useClients({
    actif: true,
    per_page: 100,
  })

  const { data: locationsData } = useLocations()

  const clients = Array.isArray(clientsPage?.data?.data)
    ? clientsPage.data.data
    : []

  const locations = useMemo(
    () => (Array.isArray(locationsData) ? locationsData : []),
    [locationsData],
  )

  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    getValues,
    formState: { errors },
  } = useForm<VenteDirecteFormValues>({
    resolver: zodResolver(
      venteDirecteSchema,
    ) as unknown as Resolver<VenteDirecteFormValues>,

    defaultValues: {
      client_id:
        draftValues?.client_id ??
        defaultValues?.client?.id ??
        0,

      date:
        draftValues?.date ??
        defaultValues?.date ??
        new Date().toISOString().slice(0, 10),

      location_id:
        draftValues?.location_id ??
        defaultValues?.location?.id ??
        0,

      lignes:
        Array.isArray(draftValues?.lignes) &&
        draftValues.lignes.length > 0
          ? draftValues.lignes.map((ligne) => ({
              produit_id: Number(ligne.produit_id),
              classement_id: Number(ligne.classement_id),
              quantite: Number(ligne.quantite),
              prix_unitaire: Number(ligne.prix_unitaire),
            }))
          : Array.isArray(defaultValues?.lignes) &&
              defaultValues.lignes.length > 0
            ? defaultValues.lignes.map((ligne) => ({
                id: ligne.id,
                produit_id: Number(ligne.produit_id),
                classement_id: Number(ligne.classement_id),
                quantite: Number(ligne.quantite),
                prix_unitaire: Number(ligne.prix_unitaire),
              }))
            : [createEmptyLine()],
    },

    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })

  const watchLocationId = useWatch({
    control,
    name: 'location_id',
  })

  const locationId =
    Number(watchLocationId) > 0
      ? Number(watchLocationId)
      : locations[0]?.id ?? 0

  const { data: productsPage } = useProducts({
    actif: true,
    per_page: 500,
    location_id: locationId || undefined,
  })

  const products = useMemo(
    () =>
      Array.isArray(productsPage?.data?.data)
        ? productsPage.data.data
        : [],
    [productsPage],
  )

  const eligibleProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          getAvailableClassements(product).length > 0,
      ),
    [products],
  )

  const productOptions = useMemo(
    () =>
      eligibleProducts.map((product) => ({
        value: product.id,
        label: `${product.designation} (${product.nomencla})`,
      })),
    [eligibleProducts],
  )

  const defaultLine = useMemo<VenteDirecteLineFormValues>(() => {
    const defaultProduct = eligibleProducts[0]
    const defaultClassement =
      getAvailableClassements(defaultProduct)[0]

    return {
      produit_id: defaultProduct?.id ?? 0,
      classement_id: defaultClassement?.value ?? 0,
      quantite: 1,
      prix_unitaire: 0,
    }
  }, [eligibleProducts])

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lignes',
  })

  const initializedRef = useRef(false)

  /*
   * Valeurs automatiques seulement pour un nouveau formulaire vide.
   * Jamais pour une VD réelle ou un brouillon partagé repris.
   */
  useEffect(() => {
    if (hasInitialValues) return
    if (!eligibleProducts.length) return

    const currentLines = getValues('lignes') ?? []

    currentLines.forEach((line, index) => {
      const currentProduct = eligibleProducts.find(
        (product) =>
          product.id === Number(line.produit_id),
      )

      if (currentProduct) {
        const classements = getAvailableClassements(
          currentProduct,
        )

        const classementExists = classements.some(
          (item) =>
            item.value === Number(line.classement_id),
        )

        if (!classementExists) {
          setValue(
            `lignes.${index}.classement_id`,
            classements[0]?.value ?? 0,
            {
              shouldValidate: true,
              shouldDirty: true,
            },
          )
        }

        return
      }

      const firstProduct = eligibleProducts[0]
      const firstClassement =
        getAvailableClassements(firstProduct)[0]

      setValue(
        `lignes.${index}.produit_id`,
        firstProduct?.id ?? 0,
        {
          shouldValidate: true,
          shouldDirty: true,
        },
      )

      setValue(
        `lignes.${index}.classement_id`,
        firstClassement?.value ?? 0,
        {
          shouldValidate: true,
          shouldDirty: true,
        },
      )
    })
  }, [
    eligibleProducts,
    getValues,
    hasInitialValues,
    setValue,
  ])

  useEffect(() => {
    if (hasInitialValues) return
    if (initializedRef.current) return
    if (!locations.length || !eligibleProducts.length) return

    const currentLocationId = getValues('location_id')
    const currentLine = getValues('lignes.0')

    if (
      currentLocationId > 0 &&
      (currentLine?.produit_id ?? 0) > 0 &&
      (currentLine?.classement_id ?? 0) > 0
    ) {
      initializedRef.current = true
      return
    }

    setValue(
      'location_id',
      locations[0]?.id ?? 0,
      { shouldValidate: true },
    )

    const product = eligibleProducts[0]
    const classement = getAvailableClassements(product)[0]

    setValue(
      'lignes.0.produit_id',
      product?.id ?? 0,
      { shouldValidate: true },
    )

    setValue(
      'lignes.0.classement_id',
      classement?.value ?? 0,
      { shouldValidate: true },
    )

    initializedRef.current = true
  }, [
    eligibleProducts,
    getValues,
    hasInitialValues,
    locations,
    setValue,
  ])

  const lignes = useWatch({
    control,
    name: 'lignes',
  }) ?? []

  const total = lignes.reduce(
    (sum, ligne) =>
      sum +
      (Number(ligne.quantite) || 0) *
        (Number(ligne.prix_unitaire) || 0),
    0,
  )

  const onSubmit = async (
    values: VenteDirecteFormValues,
  ) => {
    const payload: VenteDirectePayload = {
      client_id: Number(values.client_id),
      date: values.date,
      location_id: Number(values.location_id),
      lignes: values.lignes.map((ligne) => ({
        produit_id: Number(ligne.produit_id),
        classement_id: Number(ligne.classement_id),
        quantite: Number(ligne.quantite),
        prix_unitaire: Number(ligne.prix_unitaire),
      })),
    }

    /*
     * Brouillon :
     * - aucun contrôle bloquant de stock ;
     * - aucune réservation ;
     * - la vérification réelle aura lieu à « Créer et valider ».
     */
    if (onSaveDraft) {
      try {
        await onSaveDraft(payload)
      } catch (error) {
        setError('root', {
          type: 'manual',
          message:
            error instanceof Error
              ? error.message
              : 'Impossible d’enregistrer le brouillon.',
        })
      }

      return
    }

    /*
     * Modification d'une vente réelle.
     */
    if (!isEditingRealDocument || !defaultValues?.id) {
      setError('root', {
        type: 'manual',
        message:
          'Cette vente doit être enregistrée comme brouillon avant sa création définitive.',
      })
      return
    }

    if (correctionAdmin) {
      const motif = (
        document.querySelector(
          '[data-correction-motif]',
        ) as HTMLTextAreaElement | null
      )?.value.trim()

      if (!motif || motif.length < 5) {
        setError('root', {
          type: 'manual',
          message:
            'Le motif de correction doit contenir au moins 5 caractères.',
        })
        return
      }

      correctVenteAdmin.mutate(
        {
          id: defaultValues.id,
          idempotencyKey: createIdempotencyKey(),
          payload: {
            ...payload,
            motif_correction: motif,
          },
        },
        { onSuccess },
      )

      return
    }

    let stockInsuffisant = false

    payload.lignes.forEach((ligne, index) => {
      const product = eligibleProducts.find(
        (item) => item.id === ligne.produit_id,
      )

      const classement = getAvailableClassements(product).find(
        (item) => item.value === ligne.classement_id,
      )

      const available = Number(classement?.stock_total ?? 0)

      if (ligne.quantite > available) {
        stockInsuffisant = true

        setError(`lignes.${index}.quantite`, {
          type: 'manual',
          message:
            `Stock disponible insuffisant. ` +
            `Disponible fictif : ${formatQty(available)}.`,
        })
      }
    })

    if (stockInsuffisant) return

    updateVente.mutate(
      {
        id: defaultValues.id,
        payload,
      },
      { onSuccess },
    )
  }

  return (
    <form
      id={formId}
      onSubmit={(event) => {
        void handleSubmit(onSubmit)(event)
      }}
      className="space-y-5"
    >
      {correctionAdmin && (
        <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-900">
            <ShieldCheck className="h-4 w-4" />
            Correction administrateur tracée
          </div>

          <textarea
            data-correction-motif
            minLength={5}
            required
            placeholder="Motif obligatoire de la correction"
            className="min-h-20 w-full rounded-md border border-amber-200 bg-white px-3 py-2 text-sm text-steel-900 outline-none focus:border-steel-500"
          />
        </div>
      )}

      {errors.root?.message && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errors.root.message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select
          label="Client *"
          options={clients.map((client) => ({
            value: client.id,
            label: client.nom,
          }))}
          placeholder="Choisir un client"
          error={errors.client_id?.message}
          {...register('client_id', {
            valueAsNumber: true,
          })}
        />

        <Input
          label="Date *"
          type="date"
          error={errors.date?.message}
          {...register('date')}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select
          label="Localisation *"
          options={locations.map((location) => ({
            value: location.id,
            label: location.nom,
          }))}
          placeholder="Choisir une localisation"
          error={errors.location_id?.message}
          {...register('location_id', {
            valueAsNumber: true,
          })}
        />

        <div className="rounded-lg border border-surface-border bg-surface-subtle px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
            Total estimé
          </p>

          <p className="mt-1 text-lg font-semibold text-steel-900">
            {formatMGA(total)}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-surface-border">
        <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-steel-500">
              Lignes de vente
            </p>

            <p className="text-xs text-steel-400">
              Produits, classements, quantités et prix.
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            icon={<Plus className="h-3.5 w-3.5" />}
            onClick={() => append(defaultLine)}
          >
            Ajouter une ligne
          </Button>
        </div>

        <div className="space-y-4 p-4">
          {fields.map((field, index) => (
            <VenteDirecteLineRow
              key={field.id}
              index={index}
              control={control}
              setValue={setValue}
              register={register}
              remove={() => remove(index)}
              products={eligibleProducts}
              productOptions={productOptions}
              errors={errors}
            />
          ))}
        </div>

        {errors.lignes?.message && (
          <p className="px-4 py-3 text-xs text-red-600">
            {errors.lignes.message}
          </p>
        )}
      </div>

      <div className="rounded-lg border border-surface-border bg-surface-subtle px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
          Total estimé
        </p>

        <p className="mt-1 text-lg font-semibold text-steel-900">
          {formatMGA(total)}
        </p>
      </div>

      {!hideActions && (
        <div className="flex justify-end border-t border-surface-border pt-4">
          <Button
            type="submit"
            loading={
              updateVente.isPending ||
              correctVenteAdmin.isPending
            }
          >
            {correctionAdmin
              ? 'Enregistrer la correction'
              : isEditingRealDocument
                ? 'Modifier la vente directe'
                : 'Enregistrer le brouillon'}
          </Button>
        </div>
      )}
    </form>
  )
}

function VenteDirecteLineRow({
  index,
  control,
  setValue,
  register,
  remove,
  products,
  productOptions,
  errors,
}: {
  index: number
  control: Control<VenteDirecteFormValues>
  setValue: UseFormSetValue<VenteDirecteFormValues>
  register: UseFormRegister<VenteDirecteFormValues>
  remove: () => void
  products: CatalogueProduct[]
  productOptions: Array<{
    value: number
    label: string
  }>
  errors: FieldErrors<VenteDirecteFormValues>
}) {
  const produitId = useWatch({
    control,
    name: `lignes.${index}.produit_id`,
  })

  const classementId = useWatch({
    control,
    name: `lignes.${index}.classement_id`,
  })

  const selectedProduct = useMemo(
    () =>
      products.find(
        (product) =>
          product.id === Number(produitId),
      ),
    [produitId, products],
  )

  const classementOptions = useMemo(
    () => getAvailableClassements(selectedProduct),
    [selectedProduct],
  )

  useEffect(() => {
    if (!classementOptions.length) {
      if (Number(classementId) !== 0) {
        setValue(
          `lignes.${index}.classement_id`,
          0,
          {
            shouldValidate: true,
            shouldDirty: true,
          },
        )
      }

      return
    }

    const currentValue = Number(classementId) || 0

    const isStillValid = classementOptions.some(
      (option) => option.value === currentValue,
    )

    if (!isStillValid) {
      setValue(
        `lignes.${index}.classement_id`,
        classementOptions[0].value,
        {
          shouldValidate: true,
          shouldDirty: true,
        },
      )
    }
  }, [
    classementId,
    classementOptions,
    index,
    setValue,
  ])

  return (
    <div className="grid grid-cols-1 gap-3 rounded-lg border border-surface-border p-3 sm:grid-cols-2 xl:grid-cols-6">
      <Controller
        control={control}
        name={`lignes.${index}.produit_id`}
        render={({ field }) => (
          <SearchableSelect
            label="Produit *"
            options={productOptions}
            placeholder={
              productOptions.length
                ? 'Choisir un produit'
                : 'Aucun produit disponible'
            }
            searchPlaceholder="Rechercher une désignation ou une nomenclature..."
            noOptionsMessage="Aucun produit trouvé."
            error={
              errors.lignes?.[index]?.produit_id?.message
            }
            disabled={!productOptions.length}
            value={field.value}
            onValueChange={(nextValue) => {
              const produitId = Number(nextValue)

              field.onChange(produitId)

              const product = products.find(
                (item) => item.id === produitId,
              )

              const classement =
                getAvailableClassements(product)[0]

              setValue(
                `lignes.${index}.classement_id`,
                classement?.value ?? 0,
                {
                  shouldValidate: true,
                  shouldDirty: true,
                },
              )
            }}
            className="xl:col-span-2"
          />
        )}
      />

      <Controller
        control={control}
        name={`lignes.${index}.classement_id`}
        render={({ field }) => (
          <Select
            label="Classement *"
            options={classementOptions.map((option) => ({
              value: option.value,
              label:
                `Disponible : ${option.label} ` +
                `(${formatQty(option.stock_total)})`,
            }))}
            placeholder={
              classementOptions.length
                ? 'Choisir un classement'
                : 'Choisir un produit'
            }
            error={
              errors.lignes?.[index]?.classement_id?.message
            }
            disabled={!classementOptions.length}
            value={String(field.value ?? '')}
            onChange={(event) =>
              field.onChange(
                Number(event.target.value),
              )
            }
            onBlur={field.onBlur}
            name={field.name}
            ref={field.ref}
          />
        )}
      />

      <Input
        label="Quantité *"
        type="number"
        min="0.001"
        step="0.001"
        error={errors.lignes?.[index]?.quantite?.message}
        {...register(`lignes.${index}.quantite`, {
          valueAsNumber: true,
        })}
      />

      <Input
        label="Prix unitaire *"
        type="number"
        min="0"
        step="0.01"
        error={
          errors.lignes?.[index]?.prix_unitaire?.message
        }
        {...register(`lignes.${index}.prix_unitaire`, {
          valueAsNumber: true,
        })}
      />

      <div className="flex items-end justify-end">
        <Button
          type="button"
          variant="ghost"
          icon={<Trash2 className="h-3.5 w-3.5" />}
          onClick={remove}
        >
          Supprimer
        </Button>
      </div>
    </div>
  )
}