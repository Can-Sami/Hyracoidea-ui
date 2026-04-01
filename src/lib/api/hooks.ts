import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createIntent,
  createUtterance,
  deleteIntent,
  deleteUtterance,
  getHealth,
  getReadyz,
  inferIntentFromAudio,
  listIntents,
  listUtterances,
  reindexIntents,
  searchIntents,
  updateIntent,
  updateUtterance,
} from './services'
import type {
  SearchIntentsRequest,
  UpsertIntentRequest,
  UpsertUtteranceRequest,
} from './schema'

const queryKeys = {
  health: ['health'] as const,
  readyz: ['readyz'] as const,
  intents: ['intents'] as const,
  utterances: (intentId: string) => ['utterances', intentId] as const,
}

export function useHealthQuery() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: getHealth,
  })
}

export function useReadyzQuery() {
  return useQuery({
    queryKey: queryKeys.readyz,
    queryFn: getReadyz,
  })
}

export function useIntentsQuery() {
  return useQuery({
    queryKey: queryKeys.intents,
    queryFn: listIntents,
  })
}

export function useReindexIntentsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: reindexIntents,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.intents })
    },
  })
}

export function useCreateIntentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: UpsertIntentRequest) => createIntent(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.intents })
    },
  })
}

export function useUpdateIntentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ intentId, body }: { intentId: string; body: UpsertIntentRequest }) =>
      updateIntent(intentId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.intents })
    },
  })
}

export function useDeleteIntentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (intentId: string) => deleteIntent(intentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.intents })
    },
  })
}

export function useUtterancesQuery(intentId: string) {
  return useQuery({
    queryKey: queryKeys.utterances(intentId),
    queryFn: () => listUtterances(intentId),
    enabled: intentId.length > 0,
  })
}

export function useCreateUtteranceMutation(intentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: UpsertUtteranceRequest) => createUtterance(intentId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.utterances(intentId) })
    },
  })
}

export function useUpdateUtteranceMutation(intentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      utteranceId,
      body,
    }: {
      utteranceId: string
      body: UpsertUtteranceRequest
    }) => updateUtterance(intentId, utteranceId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.utterances(intentId) })
    },
  })
}

export function useDeleteUtteranceMutation(intentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (utteranceId: string) => deleteUtterance(intentId, utteranceId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.utterances(intentId) })
    },
  })
}

export function useSearchIntentsMutation() {
  return useMutation({
    mutationFn: (body: SearchIntentsRequest) => searchIntents(body),
  })
}

export function useAudioInferenceMutation() {
  return useMutation({
    mutationFn: (formData: FormData) => inferIntentFromAudio(formData),
  })
}
