import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { exportPdf, PdfExportError, type PdfExportPayload } from '@/lib/api/pdf'

export const PDF_EXPORT_KEY = ['pdf-export'] as const

export function usePdfExport() {
  const mutation = useMutation<void, PdfExportError, PdfExportPayload>({
    mutationKey: PDF_EXPORT_KEY,
    mutationFn: exportPdf,
    onSuccess: (_, variables) => {
      toast.success(`${variables.document.numero} exporté en PDF.`)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const isExporting = (type?: PdfExportPayload['type'], id?: number) => {
    if (!mutation.isPending) return false
    if (!type || !id) return mutation.isPending

    return mutation.variables?.type === type && mutation.variables?.document.id === id
  }

  return {
    exportPdf: mutation.mutate,
    exportPdfAsync: mutation.mutateAsync,
    isExporting,
    error: mutation.error,
    isPending: mutation.isPending,
  }
}
