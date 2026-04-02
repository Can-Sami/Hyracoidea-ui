export type HealthResponse = {
  status: string
  request_id: string
}

export type ReadyzResponse = {
  status: string
  service: string
  version: string
  request_id: string
}

export type IntentItem = {
  id: string
  intent_code: string
  description: string
  is_active: boolean
}

export type UpsertIntentRequest = {
  intent_code: string
  description: string
}

export type ListIntentsResponse = {
  items: IntentItem[]
}

export type ReindexResponse = {
  status: string
  reindexed_count: number
}

export type SearchIntentsRequest = {
  query: string
  k: number
  language_hint: string
}

export type SearchIntentsResponse = {
  items: Array<{ intent_code: string; score: number }>
}

export type UtteranceItem = {
  id: string
  intent_id: string
  language_code: string
  text: string
  source: string
}

export type ListUtterancesResponse = {
  items: UtteranceItem[]
}

export type UpsertUtteranceRequest = {
  text: string
  language_code: string
  source: string
}

export type InferenceIntentResponse = {
  request_id: string
  channel_id: string
  intent_code: string
  confidence: number
  match_status: string
  transcript: string
  top_candidates: Array<{ intent_code: string; score: number }>
  processing_ms: number
}

export type OverviewTimeRange = {
  start_at: string
  end_at: string
}

export type OverviewSummaryResponse = {
  total_inferences: number
  avg_confidence: number
  total_inferences_delta_pct: number | null
  avg_confidence_delta_pct: number | null
}

export type OverviewIntentDistributionResponse = {
  items: Array<{
    intent_code: string
    count: number
    percentage: number
  }>
}

export type OverviewRecentActivityResponse = {
  items: Array<{
    timestamp: string
    input_snippet: string
    predicted_intent: string | null
    confidence: number
  }>
}
