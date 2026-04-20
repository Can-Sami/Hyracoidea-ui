import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createIntent,
  createUtterance,
  deleteIntent,
  deleteUtterance,
  getHealth,
  getOverviewIntentDistribution,
  getOverviewBenchmarkCompare,
  getOverviewRecentActivity,
  getOverviewStageCost,
  getOverviewStageLatency,
  getOverviewSummary,
  getReadyz,
  inferIntentFromAudio,
  listIntents,
  listUtterances,
  reindexIntents,
  searchIntents,
  searchIntentsRerank,
  updateIntent,
  updateUtterance,
} from './services'
import type {
  OverviewTimeRange,
  OverviewBenchmarkCompareRange,
  SearchIntentsRequest,
  UpsertIntentRequest,
  UpsertUtteranceRequest,
} from './schema'

const queryKeys = {
  health: ['health'] as const,
  readyz: ['readyz'] as const,
  overviewSummary: (range: OverviewTimeRange) => ['overview', 'summary', range] as const,
  overviewIntentDistribution: (range: OverviewTimeRange) =>
    ['overview', 'intent-distribution', range] as const,
  overviewRecentActivity: (range: OverviewTimeRange, limit: number) =>
    ['overview', 'recent-activity', range, limit] as const,
  overviewStageLatency: (range: OverviewTimeRange) =>
    ['overview', 'stage-latency', range] as const,
  overviewStageCost: (range: OverviewTimeRange) => ['overview', 'stage-cost', range] as const,
  overviewBenchmarkCompare: (range: OverviewBenchmarkCompareRange) =>
    ['overview', 'benchmark-compare', range] as const,
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

export function useOverviewSummaryQuery(range: OverviewTimeRange) {
  return useQuery({
    queryKey: queryKeys.overviewSummary(range),
    queryFn: () => getOverviewSummary(range),
  })
}

export function useOverviewIntentDistributionQuery(range: OverviewTimeRange) {
  return useQuery({
    queryKey: queryKeys.overviewIntentDistribution(range),
    queryFn: () => getOverviewIntentDistribution(range),
  })
}

export function useOverviewRecentActivityQuery(range: OverviewTimeRange, limit = 10) {
  return useQuery({
    queryKey: queryKeys.overviewRecentActivity(range, limit),
    queryFn: () => getOverviewRecentActivity(range, limit),
  })
}

export function useOverviewStageLatencyQuery(range: OverviewTimeRange) {
  return useQuery({
    queryKey: queryKeys.overviewStageLatency(range),
    queryFn: () => getOverviewStageLatency(range),
  })
}

export function useOverviewStageCostQuery(range: OverviewTimeRange) {
  return useQuery({
    queryKey: queryKeys.overviewStageCost(range),
    queryFn: () => getOverviewStageCost(range),
  })
}

export function useOverviewBenchmarkCompareQuery(range: OverviewBenchmarkCompareRange) {
  return useQuery({
    queryKey: queryKeys.overviewBenchmarkCompare(range),
    queryFn: () => getOverviewBenchmarkCompare(range),
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

export function useSearchIntentsRerankMutation() {
  return useMutation({
    mutationFn: (body: SearchIntentsRequest) => searchIntentsRerank(body),
  })
}

export function useAudioInferenceMutation() {
  return useMutation({
    mutationFn: (formData: FormData) => inferIntentFromAudio(formData),
  })
}
