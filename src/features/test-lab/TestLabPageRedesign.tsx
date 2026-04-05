import { Copy, LoaderCircle, Sparkles, Upload } from 'lucide-react'
import { useMemo, useRef, useState, type ChangeEvent } from 'react'

import { AppHeader } from '@/components/layout/AppHeader'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import {
  useAudioInferenceMutation,
  useSearchIntentsMutation,
  useSearchIntentsRerankMutation,
} from '@/lib/api/hooks'
import type { InferenceIntentResponse } from '@/lib/api/schema'
import { cn } from '@/lib/utils'

type SearchResult = {
  intent_code: string
  score: string
}

type SearchRequest = {
  query: string
  k: number
  language_hint: string
}

type SearchResponse = {
  items: Array<{ intent_code: string; score: number }>
}

type RerankSearchResult = {
  intent_code: string
  semantic_score: string
  reranker_score: string
}

type RerankSearchRequest = {
  query: string
  k: number
  language_hint: string
}

type RerankSearchResponse = {
  items: Array<{
    intent_code: string
    semantic_score: number
    reranker_score: number
  }>
}

function Surface({
  title,
  description,
  endpoint,
  children,
  className,
}: {
  title: string
  description: string
  endpoint: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        'rounded-3xl border border-[hsl(228_22%_80%/0.7)] bg-[hsl(36_38%_98%)] p-5 shadow-[0_16px_40px_-32px_hsl(229_42%_22%/0.45)] sm:p-7',
        className,
      )}
    >
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-xl">
          <h3 className="text-[clamp(1.1rem,1.5vw,1.35rem)] font-semibold tracking-tight text-[hsl(225_39%_19%)]">
            {title}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-[hsl(226_21%_34%)]">{description}</p>
        </div>
        <Badge
          variant="outline"
          className="border-[hsl(230_22%_74%)] bg-[hsl(42_40%_97%)] font-medium text-[hsl(227_30%_28%)]"
        >
          {endpoint}
        </Badge>
      </header>
      {children}
    </section>
  )
}

function ResultRows({
  items,
  valueKey,
  emptyText,
}: {
  items: Array<Record<string, string>>
  valueKey: string
  emptyText: string
}) {
  if (items.length === 0) {
    return <p className="text-sm text-[hsl(226_20%_42%)]">{emptyText}</p>
  }

  return (
    <div className="divide-y divide-[hsl(230_26%_84%)] rounded-2xl border border-[hsl(230_26%_84%)] bg-[hsl(40_28%_97%)]">
      {items.map((item) => (
        <div
          key={item.intent_code}
          className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 text-sm"
        >
          <span className="truncate font-medium text-[hsl(226_39%_21%)]" title={item.intent_code}>
            {item.intent_code}
          </span>
          <span className="font-semibold tabular-nums text-[hsl(226_24%_34%)]">
            {item[valueKey]}
          </span>
        </div>
      ))}
    </div>
  )
}

export function TestLabPageRedesign() {
  const audioInputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [queryError, setQueryError] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [fullResponse, setFullResponse] = useState<SearchResponse | null>(null)

  const [rerankQuery, setRerankQuery] = useState('')
  const [rerankQueryError, setRerankQueryError] = useState<string | null>(null)
  const [rerankResults, setRerankResults] = useState<RerankSearchResult[]>([])
  const [rerankFullResponse, setRerankFullResponse] = useState<RerankSearchResponse | null>(null)

  const [audioError, setAudioError] = useState<string | null>(null)
  const [lastUploadedFileName, setLastUploadedFileName] = useState<string | null>(null)
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null)
  const [inferenceResponse, setInferenceResponse] = useState<InferenceIntentResponse | null>(null)

  const searchMutation = useSearchIntentsMutation()
  const rerankMutation = useSearchIntentsRerankMutation()
  const audioMutation = useAudioInferenceMutation()

  const searchError = searchMutation.error?.message ?? null
  const rerankError = rerankMutation.error?.message ?? null
  const audioProgress = audioMutation.isPending ? 70 : inferenceResponse ? 100 : 0

  const semanticSortedResults = useMemo(
    () => [...rerankResults].sort((a, b) => Number(b.semantic_score) - Number(a.semantic_score)),
    [rerankResults],
  )

  async function onSearchSubmit() {
    const trimmed = query.trim()
    if (!trimmed) {
      setQueryError('Query text is required.')
      return
    }
    if (trimmed.length > 300) {
      setQueryError('Query text cannot exceed 300 characters.')
      return
    }

    setQueryError(null)

    try {
      const body: SearchRequest = { query: trimmed, k: 5, language_hint: 'tr' }
      const response = await searchMutation.mutateAsync(body)
      setFullResponse(response)
      setSearchResults(
        response.items.map((item) => ({
          intent_code: item.intent_code,
          score: item.score.toFixed(3),
        })),
      )
    } catch {
      setSearchResults([])
      setFullResponse(null)
    }
  }

  async function onRerankSubmit() {
    const trimmed = rerankQuery.trim()
    if (!trimmed) {
      setRerankQueryError('Query text is required.')
      return
    }
    if (trimmed.length > 300) {
      setRerankQueryError('Query text cannot exceed 300 characters.')
      return
    }

    setRerankQueryError(null)

    try {
      const body: RerankSearchRequest = { query: trimmed, k: 5, language_hint: 'tr' }
      const response = await rerankMutation.mutateAsync(body)
      setRerankFullResponse(response)
      setRerankResults(
        response.items.map((item) => ({
          intent_code: item.intent_code,
          semantic_score: item.semantic_score.toFixed(3),
          reranker_score: item.reranker_score.toFixed(3),
        })),
      )
    } catch {
      setRerankResults([])
      setRerankFullResponse(null)
    }
  }

  function onAudioFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setInferenceResponse(null)
    const fileName = file.name.toLowerCase()
    const isWavOrMp3 =
      fileName.endsWith('.wav') ||
      fileName.endsWith('.mp3') ||
      ['audio/wav', 'audio/wave', 'audio/x-wav', 'audio/mpeg', 'audio/mp3'].includes(file.type)

    if (!isWavOrMp3) {
      setAudioError('Only WAV or MP3 files are supported.')
      setSelectedAudioFile(null)
      setLastUploadedFileName(null)
      event.target.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setAudioError('Audio file is too large. Maximum size is 5MB.')
      setSelectedAudioFile(null)
      setLastUploadedFileName(null)
      event.target.value = ''
      return
    }

    setAudioError(null)
    setSelectedAudioFile(file)
    setLastUploadedFileName(file.name)
    event.target.value = ''
  }

  async function onAudioSubmit() {
    if (!selectedAudioFile) {
      setAudioError('Select an audio file first.')
      return
    }

    const formData = new FormData()
    formData.append('audio_file', selectedAudioFile)
    formData.append('language_hint', 'tr')
    formData.append('channel_id', 'test-lab-ui')
    formData.append('request_id', `req-${Date.now()}`)

    setAudioError(null)

    try {
      const response = await audioMutation.mutateAsync(formData)
      setInferenceResponse(response)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Audio inference failed'
      setAudioError(message)
      setInferenceResponse(null)
    }
  }

  return (
    <div className="min-h-screen bg-[hsl(32_26%_96%)] text-[hsl(225_44%_16%)]">
      <AppSidebar activePage="test-lab" />
      <AppHeader />

      <main className="ml-64 px-6 pb-14 pt-24 lg:px-10">
        <section className="mb-8 grid gap-6 border-b border-[hsl(230_22%_82%)] pb-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[hsl(226_24%_36%)]">
              Validation Workspace
            </p>
            <h2 className="mt-3 text-[clamp(2rem,3.4vw,3rem)] font-semibold tracking-tight text-[hsl(227_45%_17%)]">
              Test &amp; Inference Lab
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[hsl(226_21%_34%)]">
              Designed for quick operator decisions. Run semantic retrieval checks, compare reranked
              ordering, and verify voice classification quality in one calm, high-signal workspace.
            </p>
          </div>

          <div className="grid gap-3 self-end rounded-2xl border border-[hsl(228_22%_80%)] bg-[hsl(42_40%_97%)] p-5 text-sm text-[hsl(226_23%_31%)]">
            <div className="flex items-center gap-2 text-[hsl(225_40%_22%)]">
              <Sparkles className="size-4" />
              <p className="font-medium">Operator checklist</p>
            </div>
            <p>1. Validate semantic intent candidates.</p>
            <p>2. Compare rerank movement before release.</p>
            <p>3. Confirm audio confidence and transcript quality.</p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <Surface
            title="Semantic Search"
            description="Evaluate nearest-neighbor intent retrieval for short user utterances."
            endpoint="/api/v1/intents/search"
          >
            <div className="space-y-4">
              <div className="grid gap-2">
                <label
                  htmlFor="semantic-query"
                  className="text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(226_23%_36%)]"
                >
                  Search query
                </label>
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                  <Input
                    id="semantic-query"
                    aria-label="Query Text"
                    placeholder="e.g. I want to cancel my subscription"
                    value={query}
                    maxLength={300}
                    onChange={(event) => {
                      setQuery(event.target.value)
                      if (queryError) setQueryError(null)
                    }}
                    className="h-11 border-[hsl(228_22%_80%)] bg-[hsl(36_40%_98%)]"
                  />
                  <Button
                    onClick={onSearchSubmit}
                    disabled={searchMutation.isPending}
                    className="h-11 px-5"
                  >
                    {searchMutation.isPending ? 'Running...' : 'Execute'}
                  </Button>
                </div>
                {queryError ? (
                  <p className="text-sm text-destructive">{queryError}</p>
                ) : (
                  <p className="text-xs text-[hsl(226_20%_44%)]">
                    Up to 300 characters. Supports multilingual input.
                  </p>
                )}
              </div>

              {searchError ? <Alert variant="destructive">{searchError}</Alert> : null}

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(226_23%_36%)]">
                  Results
                </p>
                <ResultRows
                  items={searchResults}
                  valueKey="score"
                  emptyText="Run a query to see top intent matches."
                />
              </div>

              {fullResponse ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(226_23%_36%)]">
                      Full JSON Response
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(fullResponse, null, 2))
                      }}
                    >
                      <Copy data-icon="inline-start" />
                      Copy JSON
                    </Button>
                  </div>
                  <Textarea
                    readOnly
                    value={JSON.stringify(fullResponse, null, 2)}
                    className="min-h-[180px] rounded-xl border-[hsl(228_22%_80%)] bg-[hsl(38_28%_97%)] font-mono text-xs"
                  />
                </div>
              ) : null}
            </div>
          </Surface>

          <Surface
            title="Semantic Search + Rerank"
            description="Inspect semantic candidates and compare reranker ordering side by side."
            endpoint="/api/v1/intents/search/rerank"
          >
            <div className="space-y-4">
              <div className="grid gap-2">
                <label
                  htmlFor="rerank-query"
                  className="text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(226_23%_36%)]"
                >
                  Search query
                </label>
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                  <Input
                    id="rerank-query"
                    aria-label="Rerank Query Text"
                    placeholder="e.g. faturami odemek istiyorum"
                    value={rerankQuery}
                    maxLength={300}
                    onChange={(event) => {
                      setRerankQuery(event.target.value)
                      if (rerankQueryError) setRerankQueryError(null)
                    }}
                    className="h-11 border-[hsl(228_22%_80%)] bg-[hsl(36_40%_98%)]"
                  />
                  <Button
                    onClick={onRerankSubmit}
                    disabled={rerankMutation.isPending}
                    className="h-11 px-5"
                  >
                    {rerankMutation.isPending ? 'Running...' : 'Execute Rerank'}
                  </Button>
                </div>
                {rerankQueryError ? (
                  <p className="text-sm text-destructive">{rerankQueryError}</p>
                ) : (
                  <p className="text-xs text-[hsl(226_20%_44%)]">
                    Up to 300 characters, routed through two-stage reranking.
                  </p>
                )}
              </div>

              {rerankError ? <Alert variant="destructive">{rerankError}</Alert> : null}

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(226_23%_36%)]">
                    Semantic Top-K
                  </p>
                  <ResultRows
                    items={semanticSortedResults}
                    valueKey="semantic_score"
                    emptyText="Run a query to compare rankings."
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(226_23%_36%)]">
                    Reranked Output
                  </p>
                  <ResultRows
                    items={rerankResults}
                    valueKey="reranker_score"
                    emptyText="Reranked list appears after execution."
                  />
                </div>
              </div>

              {rerankFullResponse ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(226_23%_36%)]">
                      Full JSON Response
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(rerankFullResponse, null, 2))
                      }}
                    >
                      <Copy data-icon="inline-start" />
                      Copy JSON
                    </Button>
                  </div>
                  <Textarea
                    readOnly
                    value={JSON.stringify(rerankFullResponse, null, 2)}
                    className="min-h-[180px] rounded-xl border-[hsl(228_22%_80%)] bg-[hsl(38_28%_97%)] font-mono text-xs"
                  />
                </div>
              ) : null}
            </div>
          </Surface>

          <Surface
            title="Audio Inference"
            description="Upload recorded utterances and review transcript quality, confidence, and candidate ranking."
            endpoint="/api/v1/inference/intent"
            className="xl:col-span-2"
          >
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(300px,0.52fr)]">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <label
                    htmlFor="audio-upload"
                    className="text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(226_23%_36%)]"
                  >
                    Audio file
                  </label>
                  <Input
                    id="audio-upload"
                    ref={audioInputRef}
                    className="sr-only"
                    type="file"
                    accept=".wav,.mp3,audio/wav,audio/x-wav,audio/mpeg,audio/mp3"
                    disabled={audioMutation.isPending}
                    onChange={onAudioFileChange}
                  />
                  <div
                    className={cn(
                      'flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[hsl(230_26%_84%)] bg-[hsl(40_28%_97%)] p-4',
                      audioError && 'border-destructive/50',
                    )}
                  >
                    <div>
                      <p className="text-sm font-medium text-[hsl(225_37%_22%)]">
                        {lastUploadedFileName ?? 'No file selected yet.'}
                      </p>
                      <p className="text-xs text-[hsl(226_20%_44%)]">WAV or MP3, max size 5MB.</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        audioInputRef.current?.click()
                      }}
                      disabled={audioMutation.isPending}
                    >
                      <Upload data-icon="inline-start" />
                      Choose Audio
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    onClick={onAudioSubmit}
                    disabled={audioMutation.isPending || !selectedAudioFile}
                    className="h-11 min-w-28 px-6"
                  >
                    {audioMutation.isPending ? 'Sending...' : 'Send'}
                  </Button>
                  {audioMutation.isPending ? (
                    <p className="inline-flex items-center gap-1.5 text-sm text-[hsl(226_22%_36%)]">
                      <LoaderCircle className="size-4 animate-spin" />
                      Processing request
                    </p>
                  ) : null}
                </div>

                {audioError ? <Alert variant="destructive">{audioError}</Alert> : null}
                {inferenceResponse ? (
                  <Alert variant="success">Analyzed in {inferenceResponse.processing_ms} ms.</Alert>
                ) : null}
                <Progress value={audioProgress} aria-label="Audio inference progress" className="h-2" />

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(226_23%_36%)]">
                    Candidate Ranking
                  </p>
                  {inferenceResponse ? (
                    <div className="divide-y divide-[hsl(230_26%_84%)] rounded-2xl border border-[hsl(230_26%_84%)] bg-[hsl(40_28%_97%)]">
                      {inferenceResponse.top_candidates.map((candidate) => (
                        <div
                          key={candidate.intent_code}
                          className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 text-sm"
                        >
                          <span className="truncate text-[hsl(225_34%_22%)]">
                            {candidate.intent_code}
                          </span>
                          <span className="font-semibold tabular-nums text-[hsl(226_24%_34%)]">
                            {candidate.score.toFixed(3)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Alert>Candidate ranking appears after audio analysis completes.</Alert>
                  )}
                </div>
              </div>

              <aside className="rounded-2xl border border-[hsl(228_22%_80%)] bg-[hsl(42_40%_97%)] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(226_23%_36%)]">
                  Predicted Intent
                </p>
                <p className="mt-3 break-words text-2xl font-semibold text-[hsl(225_44%_18%)]">
                  {inferenceResponse?.intent_code ?? 'No result yet'}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[hsl(226_20%_40%)]" dir="auto">
                  {inferenceResponse?.transcript
                    ? `"${inferenceResponse.transcript}"`
                    : 'Upload a WAV or MP3 file to see transcript.'}
                </p>
                <p className="mt-5 text-sm font-semibold text-[hsl(225_39%_20%)]">
                  {inferenceResponse
                    ? `${Math.round(inferenceResponse.confidence * 100)}% confidence`
                    : 'Inference confidence will appear here'}
                </p>
              </aside>
            </div>
          </Surface>
        </section>
      </main>
    </div>
  )
}

export default TestLabPageRedesign
