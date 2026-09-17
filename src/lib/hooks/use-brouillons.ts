import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { brouillonsApi } from '@/lib/api/brouillons'
import type {
  BrouillonDocument,
  BrouillonModule,
} from '@/lib/brouillons.types'

export const BROUILLONS_KEY = ['brouillons'] as const

export function useBrouillons<TPayload>(
  module: BrouillonModule,
  enabled = true,
) {
  return useQuery({
    queryKey: [...BROUILLONS_KEY, module],
    queryFn: () => brouillonsApi.list<TPayload>(module),
    enabled,
    staleTime: 15_000,
  })
}

export function useCreateBrouillon<TPayload>() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      module,
      payload,
      idempotencyKey,
    }: {
      module: BrouillonModule
      payload: TPayload
      idempotencyKey: string
    }) => brouillonsApi.create(module, payload, idempotencyKey),

    onSuccess: (brouillon) => {
      queryClient.invalidateQueries({
        queryKey: [...BROUILLONS_KEY, brouillon.module],
      })
    },
  })
}

export function useUpdateBrouillon<TPayload>() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      uuid,
      payload,
      version,
      idempotencyKey,
    }: {
      uuid: string
      payload: TPayload
      version: number
      idempotencyKey: string
    }) => brouillonsApi.update(uuid, payload, version, idempotencyKey),

    onSuccess: (brouillon: BrouillonDocument<TPayload>) => {
      queryClient.invalidateQueries({
        queryKey: [...BROUILLONS_KEY, brouillon.module],
      })
    },
  })
}

export function useDeleteBrouillon() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (uuid: string) => brouillonsApi.delete(uuid),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: BROUILLONS_KEY,
      })
    },
  })
}

export function useFinaliserBrouillon<TDocument>() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      uuid,
      idempotencyKey,
    }: {
      uuid: string
      idempotencyKey: string
    }) => brouillonsApi.finaliser<TDocument>(uuid, idempotencyKey),

    onSuccess: () => {
      queryClient.invalidateQueries()
    },
  })
}