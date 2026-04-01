import {
  AudioLines,
  Copy,
  FileUp,
  SearchCheck,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { AppHeader } from '@/components/layout/AppHeader'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { post } from '@/lib/api/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

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
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [fullResponse, setFullResponse] = useState<SearchResponse | null>(null)

  const canExecute = query.trim().length > 0 && !isSearching

  const rawJsonPreview = useMemo(
    () =>
      JSON.stringify(
        {
          id: 'inf_92kLp02',
          status: 'success',
          inference_time_ms: 284,
          model_version: 'v4.2-stable',
          prediction: {
            label: 'support_request',
            score: 0.9412,
            tokens_consumed: 22,
          },
          metadata: {
            provider: 'intent-engine-internal',
            region: 'us-east-1',
          },
        },
        null,
        2,
      ),
    [],
  )

  async function onSearchSubmit() {
    const trimmed = query.trim()
    if (!trimmed) return

    setIsSearching(true)
    setSearchError(null)

    try {
      const body: SearchRequest = { query: trimmed, k: 5, language_hint: 'tr' }
      const response = await post<SearchResponse, SearchRequest>(
        '/api/v1/intents/search',
        body,
      )

      setFullResponse(response)
      setSearchResults(
        response.items.map((item) => ({
          intent_code: item.intent_code,
          score: item.score.toFixed(3),
        })),
      )
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Semantic search failed'
      setSearchError(message)
      setSearchResults([])
      setFullResponse(null)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar activePage="test-lab" />

      <AppHeader />

      <main className="ml-64 flex flex-col gap-10 px-10 pb-12 pt-24">
        <header>
          <h2 className="text-4xl font-extrabold tracking-tight">
            Test &amp; Inference Lab
          </h2>
          <p className="mt-2 text-muted-foreground">
            Experimental sandbox for validating semantic understanding and audio
            transcription models.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="flex flex-col gap-6 lg:col-span-7">
            <Card className="border-border/70 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <SearchCheck />
                  </div>
                  <CardTitle className="text-xl">Semantic Search</CardTitle>
                </div>
                <Badge variant="outline">/api/v1/intents/search</Badge>
              </CardHeader>

              <CardContent className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Query Text
                  </label>
                  <div className="flex gap-3">
                    <Input
                      aria-label="Query Text"
                      placeholder="e.g. I want to cancel my subscription"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                    />
                    <Button onClick={onSearchSubmit} disabled={!canExecute}>
                      {isSearching ? 'Running...' : 'Execute'}
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Live Results
                  </h3>
                  {searchError ? (
                    <p className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                      {searchError}
                    </p>
                  ) : null}
                  {searchResults.map((result, index) => (
                    <div
                      key={`${result.intent_code}-${index}`}
                      className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/30 p-4"
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className={`size-2 rounded-full ${index === 0 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        />
                        <p className="text-sm font-bold">{result.intent_code}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-extrabold text-primary">
                          {result.score}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Similarity Score
                        </p>
                      </div>
                    </div>
                  ))}
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
                        <Copy className="size-4" />
                        Copy
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

            <div className="grid grid-cols-2 gap-4">
              <Card className="border-border/70 bg-muted/30">
                <CardHeader className="pb-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Latency
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">124ms</p>
                  <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-1 w-[15%] rounded-full bg-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/70 bg-muted/30">
                <CardHeader className="pb-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Tokens
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">12</p>
                  <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-1 w-[30%] rounded-full bg-primary/80" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:col-span-5">
            <Card className="border-border/70 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <AudioLines />
                  </div>
                  <CardTitle className="text-xl">Audio Inference</CardTitle>
                </div>
                <Badge variant="outline">/api/v1/inference/intent</Badge>
              </CardHeader>

              <CardContent className="flex flex-col gap-6">
                <div className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-10 text-center">
                  <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted text-primary">
                    <FileUp />
                  </div>
                  <p className="text-sm font-bold">Drop .wav file here</p>
                  <p className="text-xs text-muted-foreground">
                    Max size 5MB • PCM Mono 16kHz
                  </p>
                </div>

                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-5">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
                      Predicted Intent
                    </p>
                    <div className="mt-3 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-2xl font-extrabold">support_request</p>
                        <p className="mt-1 text-xs italic text-muted-foreground">
                          &quot;I&apos;m having trouble with the mobile app login.&quot;
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-extrabold text-primary">94%</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Match
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex flex-col gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Candidate Ranking
                  </h3>
                  <div className="flex items-center justify-between border-b py-2 text-xs">
                    <span>technical_glitch</span>
                    <span className="font-bold text-muted-foreground">0.042</span>
                  </div>
                  <div className="flex items-center justify-between border-b py-2 text-xs">
                    <span>forgot_password</span>
                    <span className="font-bold text-muted-foreground">0.015</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
                  Raw API Response
                </CardTitle>
                <Button variant="ghost" size="sm">
                  <Copy data-icon="inline-start" />
                  Copy JSON
                </Button>
              </CardHeader>
              <CardContent>
                <Textarea
                  className="min-h-56 bg-zinc-950 font-mono text-xs text-emerald-400"
                  readOnly
                  value={rawJsonPreview}
                />
              </CardContent>
            </Card>
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-4 border-t pt-8">
          <div className="flex items-center gap-10">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Model Health
              </span>
              <span className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Operational
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Total Daily Runs
              </span>
              <span className="text-xs font-semibold">12,482 calls</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Export Logs
            </Button>
            <Button variant="outline" size="sm">
              Documentation
            </Button>
          </div>
        </footer>
      </main>

      <div className="pointer-events-none fixed bottom-0 right-0 size-96 bg-[radial-gradient(circle_at_bottom_right,hsl(var(--primary)),transparent_70%)] opacity-5" />
    </div>
  )
}

export default TestLabPage
