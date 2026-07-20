'use client'

import { useEffect, useMemo } from 'react'
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
import { useClients } from '@/lib/hooks/use-clients'
import { useLocations } from '@/lib/hooks/use-organisation'
import { useProducts } from '@/lib/hooks/use-catalogue'
import { useCreateCommande } from '@/lib/hooks/use-commandes'
import { formatMGA, formatQty } from '@/lib/utils'
import { commandeSchema, type CommandeSchema } from '@/lib/schemas/commande.schema'
import type { CreateCommandePayload } from '@/lib/api/commandes'
import type { CatalogueProduct } from '@/lib/catalogue.types'

interface CommandeFormProps {
  onSuccess?: () => void
}

type CommandeFormValues = CommandeSchema
type CommandeLineFormValues = CommandeFormValues['lignes'][number]

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

function createEmptyLine(): CommandeLineFormValues {
  return {
    produit_id: 0,
    classement_id: 0,
    quantite: 1,
    prix_unitaire: 0,
  }
}

export function CommandeForm({ onSuccess }: CommandeFormProps) {
  const createCommande = useCreateCommande()

  const { data: clientsPage } = useClients({ actif: true, per_page: 100 })
  const { data: locationsData } = useLocations()
  

  const clients = Array.isArray(clientsPage?.data?.data) ? clientsPage.data.data : []
  const locations = Array.isArray(locationsData) ? locationsData : []
  

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<CommandeFormValues>({
    resolver: zodResolver(commandeSchema) as unknown as Resolver<CommandeFormValues>,
    defaultValues: {
      client_id: 0,
      date: new Date().toISOString().slice(0, 10),
      date_livraison_prevue: '',
      location_id: 0,
      echeance: 30,
      lignes: [createEmptyLine()],
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })

  const watchLocationId = useWatch({ control, name: 'location_id' })
  const locationId = Number(watchLocationId) > 0 ? Number(watchLocationId) : locations[0]?.id ?? 0
  const { data: productsPage } = useProducts({
    actif: true,
    per_page: 500,
    location_id: locationId || undefined,
  })

const products = Array.isArray(productsPage?.data?.data) ? productsPage.data.data : []

  const eligibleProducts = useMemo(
    () => products.filter((product) => getAvailableClassements(product).length > 0),
    [products],
  )

  const productOptions = useMemo(
    () =>
      eligibleProducts.map((product) => ({
        value: product.id,
        label: product.designation,
        description: product.nomencla,
      })),
    [eligibleProducts],
  )

  const defaultLine = useMemo<CommandeLineFormValues>(() => {
    const defaultProduct = eligibleProducts[0]
    const defaultClassement = getAvailableClassements(defaultProduct)[0]

    return {
      produit_id: defaultProduct?.id ?? 0,
      classement_id: defaultClassement?.value ?? 0,
      quantite: 1,
      prix_unitaire: 0,
    }
  }, [eligibleProducts])



  useEffect(() => {
    if (!eligibleProducts.length) return

    const currentLines = getValues('lignes') ?? []

    currentLines.forEach((line, index) => {
      const currentProduct = eligibleProducts.find((product) => product.id === Number(line.produit_id))

      if (!currentProduct) {
        const firstProduct = eligibleProducts[0]
        const firstClassement = getAvailableClassements(firstProduct)[0]

        setValue(`lignes.${index}.produit_id`, firstProduct?.id ?? 0, {
          shouldValidate: true,
          shouldDirty: true,
        })
        setValue(`lignes.${index}.classement_id`, firstClassement?.value ?? 0, {
          shouldValidate: true,
          shouldDirty: true,
        })
        return
      }

      const nextClassements = getAvailableClassements(currentProduct)
      const classementStillValid = nextClassements.some((item) => item.value === Number(line.classement_id))

      if (!classementStillValid) {
        setValue(`lignes.${index}.classement_id`, nextClassements[0]?.value ?? 0, {
          shouldValidate: true,
          shouldDirty: true,
        })
      }
    })
  }, [eligibleProducts, getValues, setValue])

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lignes',
  })

  useEffect(() => {
    if (clients.length > 0 && Number(getValues('client_id') || 0) <= 0) {
      setValue('client_id', clients[0].id, { shouldValidate: true, shouldDirty: false })
    }

    if (locations.length > 0 && Number(getValues('location_id') || 0) <= 0) {
      setValue('location_id', locations[0].id, { shouldValidate: true, shouldDirty: false })
    }

    const currentLine = getValues('lignes.0')
    if (defaultLine.produit_id > 0 && Number(currentLine?.produit_id ?? 0) <= 0) {
      setValue('lignes.0.produit_id', defaultLine.produit_id, {
        shouldValidate: true,
        shouldDirty: false,
      })
      setValue('lignes.0.classement_id', defaultLine.classement_id, {
        shouldValidate: true,
        shouldDirty: false,
      })
    }
  }, [clients, defaultLine, getValues, locations, setValue])

  const lignes = useWatch({ control, name: 'lignes' }) ?? []
  const total = useMemo(
    () =>
      lignes.reduce(
        (sum, ligne) => sum + (Number(ligne.quantite) || 0) * (Number(ligne.prix_unitaire) || 0),
        0,
      ),
    [lignes],
  )

  const onSubmit = (values: CommandeFormValues) => {
    const payload: CreateCommandePayload = {
      client_id: Number(values.client_id),
      date: values.date,
      date_livraison_prevue: values.date_livraison_prevue?.trim() ? values.date_livraison_prevue : undefined,
      location_id: Number(values.location_id),
      echeance: Number(values.echeance),
      lignes: values.lignes.map((ligne) => ({
        produit_id: Number(ligne.produit_id),
        classement_id: Number(ligne.classement_id),
        quantite: Number(ligne.quantite),
        prix_unitaire: Number(ligne.prix_unitaire),
      })),
    }

    createCommande.mutate(payload, { onSuccess })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select
          label="Client *"
          options={clients.map((client) => ({ value: client.id, label: client.nom }))}
          placeholder="Sélectionner un client"
          error={errors.client_id?.message}
          {...register('client_id', { valueAsNumber: true })}
        />
        <Select
          label="Échéance paiement *"
          options={[
            { value: 15, label: '15 jours' },
            { value: 30, label: '30 jours' },
            { value: 60, label: '60 jours' },
          ]}
          error={errors.echeance?.message}
          {...register('echeance', { valueAsNumber: true })}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Date commande *"
          type="date"
          error={errors.date?.message}
          {...register('date')}
        />
        <Input
          label="Livraison prévue"
          type="date"
          error={errors.date_livraison_prevue?.message}
          {...register('date_livraison_prevue')}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select
          label="Localisation *"
          options={locations.map((location) => ({ value: location.id, label: location.nom }))}
          placeholder="Sélectionner une localisation"
          error={errors.location_id?.message}
          {...register('location_id', { valueAsNumber: true })}
        />
        <div className="rounded-lg border border-surface-border bg-surface-subtle px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Total commande</p>
          <p className="mt-1 text-lg font-semibold text-steel-900">{formatMGA(total)}</p>
        </div>
      </div>

      <div className="rounded-lg border border-surface-border">
        <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-steel-500">
            Lignes de commande
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            icon={<Plus className="h-3.5 w-3.5" />}
            onClick={() => append({ ...defaultLine })}
          >
            Ajouter
          </Button>
        </div>

        <div className="space-y-4 p-4">
          {fields.map((field, index) => (
            <CommandeLineRow
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

        {errors.lignes && (
          <p className="px-4 py-3 text-xs text-red-600">{errors.lignes.message}</p>
        )}
      </div>

      <div className="flex justify-end border-t border-surface-border pt-4">
        <Button type="submit" loading={createCommande.isPending}>
          Créer la commande
        </Button>
      </div>
    </form>
  )
}

function CommandeLineRow({
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
  control: Control<CommandeFormValues>
  setValue: UseFormSetValue<CommandeFormValues>
  register: UseFormRegister<CommandeFormValues>
  remove: () => void
  products: CatalogueProduct[]
  productOptions: Array<{ value: number; label: string; description?: string }>
  errors: FieldErrors<CommandeFormValues>
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
    <>
    <div className="grid grid-cols-1 gap-3 rounded-lg border border-surface-border p-3 lg:grid-cols-6">
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

      <Input
        label="Prix unitaire *"
        type="number"
        step="1"
        error={errors.lignes?.[index]?.prix_unitaire?.message}
        {...register(`lignes.${index}.prix_unitaire`, { valueAsNumber: true })}
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
    <div className='p-8'></div>
    </>
  )
}