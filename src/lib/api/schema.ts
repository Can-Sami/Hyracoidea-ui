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

export type SearchIntentsRerankResponse = {
  items: Array<{
    intent_code: string
    semantic_score: number
    reranker_score: number
  }>
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

export type OverviewStageLatencyResponse = {
  items: Array<{
    stage_name: string
    request_count: number
    error_count: number
    p50_ms: number
    p95_ms: number
    avg_ms: number
  }>
}

export type OverviewStageCostResponse = {
  items: Array<{
    stage_name: string
    request_count: number
    total_estimated_cost_usd: number
    cost_per_1k_requests: number
  }>
}

export type OverviewBenchmarkCompareRange = {
  baseline_start_at: string
  baseline_end_at: string
  candidate_start_at: string
  candidate_end_at: string
}

export type OverviewBenchmarkCompareResponse = {
  items: Array<{
    stage_name: string
    baseline_p95_ms: number
    candidate_p95_ms: number
    p95_delta_pct: number | null
    baseline_cost_per_1k_requests: number
    candidate_cost_per_1k_requests: number
    cost_per_1k_delta_pct: number | null
  }>
}
