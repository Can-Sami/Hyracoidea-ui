import * as client from './client'
import { apiUrl } from './config'
import type {
  HealthResponse,
  InferenceIntentResponse,
  ListUtterancesResponse,
  ListIntentsResponse,
  OverviewIntentDistributionResponse,
  OverviewRecentActivityResponse,
  OverviewSummaryResponse,
  OverviewTimeRange,
  ReadyzResponse,
  ReindexResponse,
  SearchIntentsRequest,
  SearchIntentsResponse,
  IntentItem,
  UpsertIntentRequest,
  UpsertUtteranceRequest,
  UtteranceItem,
} from './schema'

type IntentResponse = Pick<IntentItem, 'id' | 'intent_code'>
type UtteranceResponse = Pick<UtteranceItem, 'id' | 'intent_id'>

export function getHealth() {
  return client.get<HealthResponse>(apiUrl('/api/healthz'))
}

export function getReadyz() {
  return client.get<ReadyzResponse>(apiUrl('/api/readyz'))
}

function toOverviewQuery(range: OverviewTimeRange, limit?: number) {
  const query = new URLSearchParams({
    start_at: range.start_at,
    end_at: range.end_at,
  })
  if (typeof limit === 'number') {
    query.set('limit', String(limit))
  }
  return query.toString()
}

export function getOverviewSummary(range: OverviewTimeRange) {
  return client.get<OverviewSummaryResponse>(
    apiUrl(`/api/v1/overview/summary?${toOverviewQuery(range)}`),
  )
}

export function getOverviewIntentDistribution(range: OverviewTimeRange) {
  return client.get<OverviewIntentDistributionResponse>(
    apiUrl(`/api/v1/overview/intent-distribution?${toOverviewQuery(range)}`),
  )
}

export function getOverviewRecentActivity(range: OverviewTimeRange, limit = 10) {
  return client.get<OverviewRecentActivityResponse>(
    apiUrl(`/api/v1/overview/recent-activity?${toOverviewQuery(range, limit)}`),
  )
}

export function listIntents() {
  return client.get<ListIntentsResponse>(apiUrl('/api/v1/intents'))
}

export function createIntent(body: UpsertIntentRequest) {
  return client.post<IntentResponse, UpsertIntentRequest>(
    apiUrl('/api/v1/intents'),
    body,
  )
}

export function updateIntent(intentId: string, body: UpsertIntentRequest) {
  return client.put<IntentResponse, UpsertIntentRequest>(
    apiUrl(`/api/v1/intents/${intentId}`),
    body,
  )
}

export function deleteIntent(intentId: string) {
  return client.del<{ status: string; id: string }>(
    apiUrl(`/api/v1/intents/${intentId}`),
  )
}

export function listUtterances(intentId: string) {
  return client.get<ListUtterancesResponse>(
    apiUrl(`/api/v1/intents/${intentId}/utterances`),
  )
}

export function createUtterance(intentId: string, body: UpsertUtteranceRequest) {
  return client.post<UtteranceResponse, UpsertUtteranceRequest>(
    apiUrl(`/api/v1/intents/${intentId}/utterances`),
    body,
  )
}

export function updateUtterance(
  intentId: string,
  utteranceId: string,
  body: UpsertUtteranceRequest,
) {
  return client.put<UtteranceResponse, UpsertUtteranceRequest>(
    apiUrl(`/api/v1/intents/${intentId}/utterances/${utteranceId}`),
    body,
  )
}

export function deleteUtterance(intentId: string, utteranceId: string) {
  return client.del<{ status: string; id: string }>(
    apiUrl(`/api/v1/intents/${intentId}/utterances/${utteranceId}`),
  )
}

export function reindexIntents() {
  return client.post<ReindexResponse, Record<string, never>>(
    apiUrl('/api/v1/intents/reindex'),
    {},
  )
}

export function searchIntents(body: SearchIntentsRequest) {
  return client.post<SearchIntentsResponse, SearchIntentsRequest>(
    apiUrl('/api/v1/intents/search'),
    body,
  )
}

export async function inferIntentFromAudio(
  formData: FormData,
): Promise<InferenceIntentResponse> {
  const response = await fetch(apiUrl('/api/v1/inference/intent'), {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const fallback = response.statusText || 'Request failed'
    let message = fallback
    try {
      const payload = (await response.json()) as { error?: { message?: string } }
      message = payload.error?.message ?? fallback
    } catch {
      message = fallback
    }
    throw new Error(message)
  }

  return (await response.json()) as InferenceIntentResponse
}
