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
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { useLocations } from '@/lib/hooks/use-organisation'
import { useClients } from '@/lib/hooks/use-clients'
import { useStocks } from '@/lib/hooks/use-stocks'
import { useCreateBonSortie } from '@/lib/hooks/use-bons-sortie'
import { MOTIFS_SORTIE } from '@/lib/constants'
import { formatQty } from '@/lib/utils'
import { bonSortieSchema, type BonSortieSchema } from '@/lib/schemas/bons-sortie.schema'
import type { BonSortieMotif } from '@/lib/bons-sortie.types'
import type { Stock } from '@/lib/types'

interface BonSortieFormProps {
  onSuccess?: () => void
}

type BonSortieLineFormValues = {
  produit_id: number
  classement_id: number
  quantite: number
}

type BonSortieFormValues = {
  location_id: number
  destination_location_id?: number
  date: string
  motif: BonSortieMotif
  client_id?: number
  motif_detail?: string
  observations?: string
  lignes: BonSortieLineFormValues[]
}

type StockProductOption = {
  id: number
  label: string
  classements: Array<{
    value: number
    label: string
    stock_total: number
    stock_reel: number
    stock_reserve: number
  }>
}

function createEmptyLine(): BonSortieLineFormValues {
  return {
    produit_id: 0,
    classement_id: 0,
    quantite: 1,
  }
}

function getFictifStock(stock: Stock) {
  return Number(stock.stock_disponible_fictif ?? stock.stock_disponible ?? stock.stock_total ?? 0)
}

function buildProductOptionsFromStocks(stocks: Stock[]): StockProductOption[] {
  const grouped = new Map<number, StockProductOption>()

  for (const stock of stocks) {
    if (stock.entite_type !== 'produit') continue
    if (!stock.entite_id) continue
    if (!stock.classement?.id) continue

    const stockFictif = getFictifStock(stock)

    const productId = Number(stock.entite_id)
    const designation = stock.entite?.designation ?? stock.entite?.nom ?? `Produit #${productId}`
    const code = stock.entite?.nomencla ?? stock.entite?.reference ?? `#${productId}`
    const existing = grouped.get(productId)

    const classementOption = {
      value: Number(stock.classement.id),
      label:
        stock.classement.libelle ??
        stock.classement.designation ??
        stock.classement.qualite ??
        `Classement #${stock.classement.id}`,
      stock_total: stockFictif,
      stock_reel: Number(stock.stock_total) || 0,
      stock_reserve: Number(stock.stock_reserve) || 0,
    }

    if (existing) {
      const alreadyExists = existing.classements.some(
        (option) => option.value === classementOption.value,
      )

      if (!alreadyExists) {
        existing.classements.push(classementOption)
      }

      continue
    }

    grouped.set(productId, {
      id: productId,
      label: `${designation} (${code})`,
      classements: [classementOption],
    })
  }

  return Array.from(grouped.values()).sort((a, b) => a.label.localeCompare(b.label))
}

function detailLabelForMotif(motif: BonSortieMotif): string {
  if (motif === 'perte') return 'Motif de perte *'
  if (motif === 'casse') return 'Description casse *'
  if (motif === 'destruction') return 'Motif de destruction *'
  if (motif === 'consommation_interne') return 'Détail consommation interne'
  if (motif === 'don') return 'Bénéficiaire / commentaire'
  if (motif === 'autre') return 'Commentaire *'
  return 'Détail'
}

export function BonSortieForm({ onSuccess }: BonSortieFormProps) {
  const createBonSortie = useCreateBonSortie()

  const { data: clientsPage } = useClients({ actif: true, per_page: 100 })
  const { data: locationsData } = useLocations()

  const clients = Array.isArray(clientsPage?.data?.data) ? clientsPage.data.data : []
  const locations = Array.isArray(locationsData) ? locationsData : []

  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    getValues,
    formState: { errors },
  } = useForm<BonSortieFormValues>({
    resolver: zodResolver(bonSortieSchema) as unknown as Resolver<BonSortieFormValues>,
    defaultValues: {
      location_id: 0,
      destination_location_id: undefined,
      date: new Date().toISOString().slice(0, 10),
      motif: 'consommation_interne',
      client_id: undefined,
      motif_detail: '',
      observations: '',
      lignes: [createEmptyLine()],
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })

  const locationId = useWatch({ control, name: 'location_id' })
  const motif = useWatch({ control, name: 'motif' })
  const lignes = useWatch({ control, name: 'lignes' }) ?? []

  const { data: stocksPage } = useStocks({
    location_id: Number(locationId) > 0 ? Number(locationId) : undefined,
    entite_type: 'produit',
    per_page: 500,
    page: 1,
  })

  const stocks = Array.isArray(stocksPage?.data?.data) ? stocksPage.data.data : []
  const stockProductOptions = useMemo(() => buildProductOptionsFromStocks(stocks), [stocks])

  const productOptions = useMemo(
    () => stockProductOptions.map((product) => ({ value: product.id, label: product.label })),
    [stockProductOptions],
  )

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lignes',
  })

  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current) return
    if (!locations.length) return

    const currentLocationId = getValues('location_id')

    if (currentLocationId > 0) {
      initializedRef.current = true
      return
    }

    setValue('location_id', locations[0]?.id ?? 0, { shouldValidate: true })
    initializedRef.current = true
  }, [getValues, locations, setValue])

  useEffect(() => {
    if (!stockProductOptions.length) return

    const currentLines = getValues('lignes') ?? []
    const firstLine = currentLines[0]

    if ((firstLine?.produit_id ?? 0) > 0 && (firstLine?.classement_id ?? 0) > 0) {
      return
    }

    const defaultProduct = stockProductOptions[0]
    const defaultClassement = defaultProduct?.classements[0]

    if (!defaultProduct || !defaultClassement) return

    setValue('lignes.0.produit_id', defaultProduct.id, {
      shouldValidate: true,
      shouldDirty: false,
    })
    setValue('lignes.0.classement_id', defaultClassement.value, {
      shouldValidate: true,
      shouldDirty: false,
    })
  }, [getValues, setValue, stockProductOptions])

  useEffect(() => {
    if (motif !== 'transfert') {
      setValue('destination_location_id', undefined, { shouldValidate: true })
    }

    if (motif !== 'echantillon') {
      setValue('client_id', undefined, { shouldValidate: true })
    }
  }, [motif, setValue])

  const totalQuantite = lignes.reduce((sum, ligne) => sum + (Number(ligne.quantite) || 0), 0)

  const onSubmit = (values: BonSortieFormValues) => {
    let hasStockError = false

    values.lignes.forEach((ligne, index) => {
      const product = stockProductOptions.find((item) => item.id === Number(ligne.produit_id))
      const classement = product?.classements.find(
        (item) => item.value === Number(ligne.classement_id),
      )

      const available = Number(classement?.stock_total ?? 0)
      const quantity = Number(ligne.quantite ?? 0)

      if (quantity > available) {
        hasStockError = true
        setError(`lignes.${index}.quantite`, {
          type: 'manual',
          message: `Stock disponible insuffisant. Disponible fictif : ${formatQty(available)}. Ce stock est déjà réservé par des documents non livrés.`,
        })
      }
    })

    if (hasStockError) {
      return
    }

    const payload: BonSortieSchema = {
      location_id: Number(values.location_id),
      destination_location_id:
        values.motif === 'transfert' ? values.destination_location_id : undefined,
      date: values.date,
      motif: values.motif,
      client_id: values.motif === 'echantillon' ? values.client_id : undefined,
      motif_detail: values.motif_detail?.trim() || undefined,
      observations: values.observations?.trim() || undefined,
      lignes: values.lignes.map((ligne) => ({
        produit_id: Number(ligne.produit_id),
        classement_id: Number(ligne.classement_id),
        quantite: Number(ligne.quantite),
      })),
    }

    createBonSortie.mutate(payload, { onSuccess })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select
          label="Localisation source *"
          options={locations.map((location) => ({ value: location.id, label: location.nom }))}
          placeholder="Choisir une localisation"
          error={errors.location_id?.message}
          {...register('location_id', { valueAsNumber: true })}
        />
        <Input label="Date *" type="date" error={errors.date?.message} {...register('date')} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select
          label="Raison de sortie *"
          options={MOTIFS_SORTIE.map((item) => ({ value: item.value, label: item.label }))}
          error={errors.motif?.message}
          {...register('motif')}
        />

        {motif === 'transfert' && (
          <Select
            label="Destination *"
            options={locations
              .filter((location) => Number(location.id) !== Number(locationId))
              .map((location) => ({ value: location.id, label: location.nom }))}
            placeholder="Choisir la destination"
            error={errors.destination_location_id?.message}
            {...register('destination_location_id', {
              setValueAs: (value) => (value === '' ? undefined : Number(value)),
            })}
          />
        )}

        {motif === 'echantillon' && (
          <SearchableSelect
            label="Client *"
            options={clients.map((client) => ({ value: client.id, label: client.nom }))}
            value={getValues('client_id') ?? null}
            onValueChange={(value) =>
              setValue('client_id', Number(value) || undefined, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            placeholder="Choisir un client"
            searchPlaceholder="Rechercher un client..."
            noOptionsMessage="Aucun client trouvé."
            error={errors.client_id?.message}
          />
        )}

        {['perte', 'casse', 'consommation_interne', 'don', 'destruction', 'autre'].includes(motif) && (
          <Input
            label={detailLabelForMotif(motif)}
            placeholder="Préciser le contexte"
            error={errors.motif_detail?.message}
            {...register('motif_detail')}
          />
        )}
      </div>

      <Input
        label="Observation"
        placeholder="Observation générale facultative"
        error={errors.observations?.message}
        {...register('observations')}
      />

      <div className="rounded-lg border border-surface-border">
        <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-steel-500">
              Lignes de sortie
            </p>
            <p className="text-xs text-steel-400">
              Les produits affichés dépendent du stock disponible dans la localisation source.
            </p>
          </div>
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

        <div className="space-y-4 p-4">
          {fields.map((field, index) => (
            <BonSortieLineRow
              key={field.id}
              index={index}
              control={control}
              setValue={setValue}
              register={register}
              remove={() => remove(index)}
              products={stockProductOptions}
              productOptions={productOptions}
              errors={errors}
            />
          ))}
        </div>

        {errors.lignes && (
          <p className="px-4 py-3 text-xs text-red-600">{errors.lignes.message}</p>
        )}
      </div>

      <div className="rounded-lg border border-surface-border bg-surface-subtle px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
          Total quantités
        </p>
        <p className="mt-1 text-lg font-semibold text-steel-900">{formatQty(totalQuantite)}</p>
      </div>

      <div className="flex justify-end border-t border-surface-border pt-4">
        <Button type="submit" loading={createBonSortie.isPending}>
          Créer le bon de sortie
        </Button>
      </div>
    </form>
  )
}

function BonSortieLineRow({
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
  control: Control<BonSortieFormValues>
  setValue: UseFormSetValue<BonSortieFormValues>
  register: UseFormRegister<BonSortieFormValues>
  remove: () => void
  products: StockProductOption[]
  productOptions: Array<{ value: number; label: string }>
  errors: FieldErrors<BonSortieFormValues>
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
    () => products.find((product) => product.id === Number(produitId)),
    [produitId, products],
  )

  const classementOptions = selectedProduct?.classements ?? []

  useEffect(() => {
    if (!classementOptions.length) {
      if (Number(classementId) !== 0) {
        setValue(`lignes.${index}.classement_id`, 0, {
          shouldValidate: true,
          shouldDirty: true,
        })
      }
      return
    }

    const currentValue = Number(classementId) || 0
    const stillValid = classementOptions.some((option) => option.value === currentValue)

    if (!stillValid) {
      setValue(`lignes.${index}.classement_id`, classementOptions[0].value, {
        shouldValidate: true,
        shouldDirty: true,
      })
    }
  }, [classementId, classementOptions, index, setValue])

  return (
    <div className="grid grid-cols-1 gap-3 rounded-lg border border-surface-border p-3 sm:grid-cols-2 xl:grid-cols-6">
      <Controller
        control={control}
        name={`lignes.${index}.produit_id`}
        render={({ field }) => (
          <SearchableSelect
            label="Produit *"
            options={productOptions}
            placeholder={productOptions.length ? 'Choisir un produit' : 'Aucun produit disponible'}
            searchPlaceholder="Rechercher une désignation ou une nomencla..."
            noOptionsMessage="Aucun produit trouvé."
            error={errors.lignes?.[index]?.produit_id?.message}
            disabled={!productOptions.length}
            value={field.value}
            onValueChange={(nextValue) => {
              const nextProduitId = Number(nextValue)
              field.onChange(nextProduitId)

              const nextProduct = products.find((product) => product.id === nextProduitId)
              const nextClassement = nextProduct?.classements[0]

              setValue(`lignes.${index}.classement_id`, nextClassement?.value ?? 0, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }}
            className="lg:col-span-2"
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
              label: `${option.label} (${formatQty(option.stock_total)})`,
            }))}
            placeholder={
              classementOptions.length
                ? 'Choisir un classement'
                : 'Choisir d’abord un produit'
            }
            error={errors.lignes?.[index]?.classement_id?.message}
            disabled={!classementOptions.length}
            value={String(field.value ?? '')}
            onChange={(event) => field.onChange(Number(event.target.value))}
            onBlur={field.onBlur}
            name={field.name}
            ref={field.ref}
            className="lg:col-span-3"
          />
        )}
      />

      <Input
        label="Quantité *"
        type="number"
        step="0.001"
        min="0"
        error={errors.lignes?.[index]?.quantite?.message}
        className="lg:col-span-2"
        {...register(`lignes.${index}.quantite`, { valueAsNumber: true })}
      />

      <div className="flex items-end justify-end lg:col-span-2">
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