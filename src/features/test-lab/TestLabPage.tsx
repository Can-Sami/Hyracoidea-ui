import {
  Copy,
  LoaderCircle,
  Upload,
} from 'lucide-react'
import { useRef, useState, type ChangeEvent } from 'react'

import { AppHeader } from '@/components/layout/AppHeader'
import { AppSidebar } from '@/components/layout/AppSidebar'
import {
  useAudioInferenceMutation,
  useSearchIntentsMutation,
} from '@/lib/api/hooks'
import type { InferenceIntentResponse } from '@/lib/api/schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
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

export function TestLabPage() {
  const audioInputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [queryError, setQueryError] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [fullResponse, setFullResponse] = useState<SearchResponse | null>(null)
  const [audioError, setAudioError] = useState<string | null>(null)
  const [lastUploadedFileName, setLastUploadedFileName] = useState<string | null>(null)
  const [inferenceResponse, setInferenceResponse] =
    useState<InferenceIntentResponse | null>(null)

  const searchMutation = useSearchIntentsMutation()
  const audioMutation = useAudioInferenceMutation()
  const isSearching = searchMutation.isPending
  const searchError = searchMutation.error?.message ?? null

  const canExecute = !isSearching

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

  async function onAudioFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setInferenceResponse(null)
    const fileName = file.name.toLowerCase()
    const isWav =
      fileName.endsWith('.wav') ||
      ['audio/wav', 'audio/wave', 'audio/x-wav'].includes(file.type)
    if (!isWav) {
      setAudioError('Only WAV files are supported.')
      event.target.value = ''
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setAudioError('Audio file is too large. Maximum size is 5MB.')
      event.target.value = ''
      return
    }

    const formData = new FormData()
    formData.append('audio_file', file)
    formData.append('language_hint', 'tr')
    formData.append('channel_id', 'test-lab-ui')
    formData.append('request_id', `req-${Date.now()}`)

    setAudioError(null)
    setLastUploadedFileName(file.name)

    try {
      const response = await audioMutation.mutateAsync(formData)
      setInferenceResponse(response)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Audio inference failed'
      setAudioError(message)
      setInferenceResponse(null)
    } finally {
      event.target.value = ''
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar activePage="test-lab" />

      <AppHeader />

      <main className="ml-64 flex flex-col gap-10 px-6 pb-12 pt-24 lg:px-10">
        <header>
          <h2 className="text-[clamp(1.75rem,2.7vw,2.4rem)] font-semibold tracking-tight">
            Test &amp; Inference Lab
          </h2>
          <p className="mt-2 text-muted-foreground">
            Validate text search and audio intent inference before promoting model changes.
          </p>
        </header>

        <section className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <Card className="border-border/70 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle className="text-xl">Semantic Search</CardTitle>
              <Badge variant="outline">/api/v1/intents/search</Badge>
            </CardHeader>

            <CardContent className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Search query
                </label>
                <div className="flex flex-wrap gap-3">
                  <Input
                    aria-label="Query Text"
                    placeholder="e.g. I want to cancel my subscription"
                    value={query}
                    maxLength={300}
                    onChange={(event) => {
                      setQuery(event.target.value)
                      if (queryError) setQueryError(null)
                    }}
                  />
                  <Button className="min-w-28" onClick={onSearchSubmit} disabled={!canExecute}>
                    {isSearching ? 'Running...' : 'Execute'}
                  </Button>
                </div>
                {queryError ? (
                  <p className="text-sm text-destructive">{queryError}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Up to 300 characters. You can use emoji and multilingual text.
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Results
                </h3>
                {searchError ? (
                  <Alert variant="destructive" className="px-3 py-2">
                    {searchError}
                    <Button
                      variant="link"
                      size="sm"
                      className="ml-2 h-auto p-0 text-destructive"
                      onClick={() => {
                        void onSearchSubmit()
                      }}
                    >
                      Retry
                    </Button>
                  </Alert>
                ) : null}
                {searchResults.length === 0 && !searchError ? (
                  <p className="text-sm text-muted-foreground">Run a query to see top intent matches.</p>
                ) : null}
                <div className="flex flex-col gap-0.5">
                  {searchResults.map((result) => (
                  <div
                    key={result.intent_code}
                    className="flex items-center justify-between border-b border-border/70 py-2.5 text-sm"
                  >
                    <span
                      className="max-w-[70%] truncate font-medium"
                      title={result.intent_code}
                    >
                      {result.intent_code}
                    </span>
                    <span className="font-semibold text-muted-foreground">{result.score}</span>
                  </div>
                  ))}
                </div>
              </div>

              {fullResponse ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Full JSON Response
                    </h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          JSON.stringify(fullResponse, null, 2),
                        )
                      }}
                    >
                      <Copy data-icon="inline-start" />
                      Copy JSON
                    </Button>
                  </div>
                  <Textarea
                    readOnly
                    value={JSON.stringify(fullResponse, null, 2)}
                    className="min-h-[200px] font-mono text-xs"
                  />
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle className="text-xl">Audio Inference</CardTitle>
              <Badge variant="outline">/api/v1/inference/intent</Badge>
            </CardHeader>

            <CardContent className="flex flex-col gap-6">
              <FieldGroup>
                <Field data-invalid={audioError ? true : undefined}>
                  <FieldLabel htmlFor="audio-upload">Audio file</FieldLabel>
                  <FieldDescription>WAV only, max size 5MB.</FieldDescription>
                  <Input
                    id="audio-upload"
                    ref={audioInputRef}
                    className="sr-only"
                    type="file"
                    accept=".wav,audio/wav,audio/x-wav"
                    aria-invalid={audioError ? true : undefined}
                    disabled={audioMutation.isPending}
                    onChange={onAudioFileChange}
                  />
                  <div
                    className={cn(
                      'flex flex-wrap items-center gap-3 rounded-lg border border-border/70 bg-background p-3',
                      audioError && 'border-destructive/40',
                    )}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        audioInputRef.current?.click()
                      }}
                      disabled={audioMutation.isPending}
                    >
                      <Upload data-icon="inline-start" />
                      Choose WAV
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      {lastUploadedFileName ?? 'No file selected yet.'}
                    </p>
                  </div>
                </Field>
              </FieldGroup>

              {audioMutation.isPending ? (
                <Alert className="flex items-center gap-2 px-3 py-2">
                  <LoaderCircle className="animate-spin text-muted-foreground" />
                  Analyzing audio inference...
                </Alert>
              ) : null}
              {inferenceResponse ? (
                <Alert variant="success" className="px-3 py-2">
                  Analyzed in {inferenceResponse.processing_ms} ms.
                </Alert>
              ) : null}
              {audioError ? (
                <Alert variant="destructive" className="px-3 py-2">
                  {audioError}
                </Alert>
              ) : null}
              <Progress
                value={audioMutation.isPending ? 66 : inferenceResponse ? 100 : 0}
                aria-label="Audio inference progress"
              />

              <div className="rounded-lg border border-border/70 bg-muted/30 p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Predicted Intent
                </p>
                <p className="mt-2 text-xl font-semibold">
                  {inferenceResponse?.intent_code ?? 'No result yet'}
                </p>
                <p
                  className="mt-1 break-words text-xs text-muted-foreground"
                  dir="auto"
                >
                  {inferenceResponse?.transcript
                    ? `"${inferenceResponse.transcript}"`
                    : 'Upload a WAV file to see transcript.'}
                </p>
                <p className="mt-3 text-sm font-semibold">
                  {inferenceResponse
                    ? `${Math.round(inferenceResponse.confidence * 100)}% confidence`
                    : 'Inference confidence will appear here'}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Candidate Ranking
                </h3>
                {inferenceResponse ? (
                  <div className="flex flex-col gap-0.5">
                    {inferenceResponse.top_candidates.map((candidate) => (
                    <div
                      key={candidate.intent_code}
                      className="flex items-center justify-between border-b border-border/70 py-2.5 text-xs"
                    >
                      <span>{candidate.intent_code}</span>
                      <span className="font-bold text-muted-foreground">
                        {candidate.score.toFixed(3)}
                      </span>
                    </div>
                    ))}
                  </div>
                ) : (
                  <Alert className="px-3 py-2">
                    Candidate ranking appears after audio analysis completes.
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}

export default TestLabPage
