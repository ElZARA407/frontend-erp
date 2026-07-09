'use client'

import { useEffect, useMemo, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { Plus, Trash2, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type SheetEntry = {
  value: string
}

type ExcelImportDialogFormValues = {
  sheets: SheetEntry[]
}

export interface ExcelImportDialogSubmitPayload {
  file: File
  sheetNames: string[]
}

interface ExcelImportDialogProps {
  open: boolean
  onClose?: () => void
  onOpenChange?: (open: boolean) => void
  title: string
  description?: string
  submitLabel?: string
  cancelLabel?: string
  loading?: boolean
  accept?: string
  templateFileName?: string
  defaultSheetNames?: string[]
  onImport?: (payload: ExcelImportDialogSubmitPayload) => void | Promise<void>
  onSubmit?: (payload: ExcelImportDialogSubmitPayload) => void | Promise<void>
}

export function ExcelImportDialog({
  open,
  onClose,
  onOpenChange,
  title,
  description,
  submitLabel = 'Importer',
  cancelLabel = 'Annuler',
  loading = false,
  accept = '.xlsx,.xls,.csv',
  templateFileName,
  defaultSheetNames = [''],
  onImport,
  onSubmit,
}: ExcelImportDialogProps) {
  const [file, setFile] = useState<File | null>(null)

  const initialSheets = useMemo<SheetEntry[]>(
    () =>
      defaultSheetNames.length > 0
        ? defaultSheetNames.map((name) => ({ value: name }))
        : [{ value: '' }],
    [defaultSheetNames],
  )

  const {
    control,
    handleSubmit,
    register,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<ExcelImportDialogFormValues>({
    defaultValues: {
      sheets: initialSheets,
    },
    mode: 'onSubmit',
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'sheets',
  })

  useEffect(() => {
    if (!open) {
      setFile(null)
      reset({
        sheets: initialSheets,
      })
    }
  }, [open, initialSheets, reset])

  const closeDialog = () => {
    onOpenChange?.(false)
    onClose?.()
  }

  const submitHandler = async (values: ExcelImportDialogFormValues) => {
    if (!file) {
      setError('root', {
        type: 'manual',
        message: 'Veuillez sélectionner un fichier Excel.',
      })
      return
    }

    const sheetNames = values.sheets
      .map((sheet) => sheet.value.trim())
      .filter((name) => name.length > 0)

    clearErrors('root')

    const handler = onImport ?? onSubmit
    if (!handler) {
      closeDialog()
      return
    }

    await handler({
      file,
      sheetNames,
    })

    closeDialog()
  }

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-steel-950/50 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-surface-border bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-surface-border px-5 py-4">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-steel-900">{title}</h2>
            {description ? <p className="text-sm text-steel-500">{description}</p> : null}
            {templateFileName ? (
              <p className="text-xs text-steel-400">
                Modèle attendu : {templateFileName}
              </p>
            ) : null}
          </div>

          <Button
            type="button"
            variant="ghost"
            onClick={closeDialog}
            aria-label="Fermer"
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(submitHandler)} className="space-y-5 px-5 py-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-steel-700">
              Fichier Excel
            </label>
            <input
              type="file"
              accept={accept}
              className="block w-full cursor-pointer rounded-md border border-surface-border bg-white px-3 py-2 text-sm text-steel-700 file:mr-4 file:rounded-md file:border-0 file:bg-steel-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-steel-800"
              onChange={(event) => {
                const selected = event.target.files?.[0] ?? null
                setFile(selected)
                if (selected) {
                  clearErrors('root')
                }
              }}
            />
            {file ? (
              <p className="text-xs text-steel-500">Fichier sélectionné : {file.name}</p>
            ) : null}
            {errors.root?.message ? (
              <p className="text-sm text-red-600">{errors.root.message}</p>
            ) : null}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-steel-700">Feuilles à lire</p>
                <p className="text-xs text-steel-500">
                  Saisis les noms exacts des feuilles Excel que le backend doit examiner.
                </p>
              </div>

              <Button
                type="button"
                variant="secondary"
                onClick={() => append({ value: '' })}
              >
                <Plus className="h-4 w-4" />
                Ajouter une feuille
              </Button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-2">
                  <div className="flex-1">
                    <Input
                      label={`Feuille ${index + 1}`}
                      placeholder="produits_finis_classifies"
                      error={errors.sheets?.[index]?.value?.message}
                      {...register(`sheets.${index}.value` as const, {
                        required: 'Le nom de la feuille est obligatoire.',
                      })}
                    />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    className="mb-0.5"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-surface-border pt-4">
            <Button type="button" variant="secondary" onClick={closeDialog}>
              {cancelLabel}
            </Button>

            <Button type="submit" loading={loading}>
              <Upload className="h-4 w-4" />
              {submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}