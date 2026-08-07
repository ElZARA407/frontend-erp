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
import { useLocations } from '@/lib/hooks/use-organisation'
import { useClients } from '@/lib/hooks/use-clients'
import { useProducts } from '@/lib/hooks/use-catalogue'
import { useCreateBonSortie } from '@/lib/hooks/use-bons-sortie'
import { MOTIFS_SORTIE } from '@/lib/constants'
import { formatQty } from '@/lib/utils'
import { bonSortieSchema, type BonSortieSchema } from '@/lib/schemas/bons-sortie.schema'
import type { BonSortieMotif } from '@/lib/bons-sortie.types'
import type { CatalogueProduct } from '@/lib/catalogue.types'
import { SearchableSelect } from '@/components/ui/searchable-select'

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
  date: string
  motif: BonSortieMotif
  client_id?: number
  observations?: string
  lignes: BonSortieLineFormValues[]
}

function getAvailableClassements(product?: CatalogueProduct | null) {
  const stockList = Array.isArray(product?.stocks_par_qualite) ? product.stocks_par_qualite : []

  return stockList
    .filter((item) => Number(item.stock_total) > 0 && Number(item.classement_id) > 0)
    .map((item) => ({
      value: Number(item.classement_id),
      label: item.libelle ?? item.qualite ?? `Classement #${item.classement_id}`,
      stock_total: Number(item.stock_total) || 0,
    }))
}

function createEmptyLine(): BonSortieLineFormValues {
  return {
    produit_id: 0,
    classement_id: 0,
    quantite: 1,
  }
}

export function BonSortieForm({ onSuccess }: BonSortieFormProps) {
  const createBonSortie = useCreateBonSortie()

  const { data: clientsPage } = useClients({ actif: true, per_page: 100 })
  const { data: locationsData } = useLocations()
  const { data: productsPage } = useProducts({ actif: true, per_page: 500 })

  const clients = Array.isArray(clientsPage?.data?.data) ? clientsPage.data.data : []
  const locations = Array.isArray(locationsData) ? locationsData : []
  const products = Array.isArray(productsPage?.data?.data) ? productsPage.data.data : []

  const eligibleProducts = useMemo(
    () => products.filter((product) => getAvailableClassements(product).length > 0),
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

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<BonSortieFormValues>({
    resolver: zodResolver(bonSortieSchema) as unknown as Resolver<BonSortieFormValues>,
    defaultValues: {
      location_id: 0,
      date: new Date().toISOString().slice(0, 10),
      motif: 'usage_interne',
      client_id: undefined,
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

  const initializedRef = useRef(false)

  useEffect(() => {
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

    setValue('location_id', locations[0]?.id ?? 0, { shouldValidate: true })

    const defaultProduct = eligibleProducts[0]
    const defaultClassement = getAvailableClassements(defaultProduct)[0]

    if (defaultProduct) {
      setValue('lignes.0.produit_id', defaultProduct.id, {
        shouldValidate: true,
        shouldDirty: false,
      })
      setValue('lignes.0.classement_id', defaultClassement?.value ?? 0, {
        shouldValidate: true,
        shouldDirty: false,
      })
    }

    initializedRef.current = true
  }, [eligibleProducts, getValues, locations, setValue])

  const lignes = useWatch({ control, name: 'lignes' }) ?? []
  const totalQuantite = lignes.reduce((sum, ligne) => sum + (Number(ligne.quantite) || 0), 0)

  const onSubmit = (values: BonSortieFormValues) => {
    const payload: BonSortieSchema = {
      location_id: values.location_id,
      date: values.date,
      motif: values.motif,
      client_id: values.client_id ?? undefined,
      observations: values.observations ?? undefined,
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
          label="Localisation *"
          options={locations.map((location) => ({ value: location.id, label: location.nom }))}
          placeholder="Choisir une localisation"
          error={errors.location_id?.message}
          {...register('location_id', { valueAsNumber: true })}
        />
        <Input label="Date *" type="date" error={errors.date?.message} {...register('date')} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select
          label="Motif *"
          options={MOTIFS_SORTIE.map((motif) => ({ value: motif.value, label: motif.label }))}
          error={errors.motif?.message}
          {...register('motif')}
        />
        <Select
          label="Client"
          options={clients.map((client) => ({ value: client.id, label: client.nom }))}
          placeholder="Aucun client"
          {...register('client_id', {
            setValueAs: (value) => (value === '' ? undefined : Number(value)),
          })}
        />
      </div>

      <div className="rounded-lg border border-surface-border">
        <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-steel-500">
            Lignes de sortie
          </p>
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
              products={eligibleProducts}
              productOptions={productOptions}
              errors={errors}
            />
          ))}
        </div>

        {errors.lignes && <p className="px-4 py-3 text-xs text-red-600">{errors.lignes.message}</p>}
      </div>

      <div className="rounded-lg border border-surface-border bg-surface-subtle px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Total quantités</p>
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
  products: CatalogueProduct[]
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

  const classementOptions = useMemo(
    () => getAvailableClassements(selectedProduct),
    [selectedProduct],
  )

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
    <div className="grid grid-cols-1 gap-3 rounded-lg border border-surface-border p-3 md:grid-cols-4">
      {/* <Controller
        control={control}
        name={`lignes.${index}.produit_id`}
        render={({ field }) => (
          <Select
            label="Produit *"
            options={productOptions}
            placeholder={productOptions.length ? 'Choisir un produit' : 'Aucun produit disponible'}
            error={errors.lignes?.[index]?.produit_id?.message}
            value={String(field.value ?? '')}
            onChange={(e) => {
              const nextProduitId = Number(e.target.value)
              field.onChange(nextProduitId)

              const nextProduct = products.find((product) => product.id === nextProduitId)
              const nextClassements = getAvailableClassements(nextProduct)

              setValue(`lignes.${index}.classement_id`, nextClassements[0]?.value ?? 0, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }}
            onBlur={field.onBlur}
            name={field.name}
            ref={field.ref}
          />
        )}
      /> */}

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
                    const nextClassements = getAvailableClassements(nextProduct)
      
                    setValue(`lignes.${index}.classement_id`, nextClassements[0]?.value ?? 0, {
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
              label: `${option.label}${option.stock_total > 0 ? ` (${formatQty(option.stock_total)})` : ''}`,
            }))}
            placeholder={
              classementOptions.length
                ? 'Choisir un classement'
                : 'Choisir d’abord un produit avec stock'
            }
            error={errors.lignes?.[index]?.classement_id?.message}
            disabled={!classementOptions.length}
            value={String(field.value ?? '')}
            onChange={(e) => field.onChange(Number(e.target.value))}
            onBlur={field.onBlur}
            name={field.name}
            ref={field.ref}
          />
        )}
      />

      <Input
        label="Quantité *"
        type="number"
        step="1"
        error={errors.lignes?.[index]?.quantite?.message}
        {...register(`lignes.${index}.quantite`, { valueAsNumber: true })}
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