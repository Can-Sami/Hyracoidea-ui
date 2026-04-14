import { CalendarDays, Gauge, RefreshCcw, TrendingUp } from 'lucide-react'
import { useMemo, useState } from 'react'

import { AppHeader } from '@/components/layout/AppHeader'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  useOverviewBenchmarkCompareQuery,
  useOverviewStageCostQuery,
  useOverviewStageLatencyQuery,
} from '@/lib/api/hooks'
import type { OverviewStageCostResponse, OverviewStageLatencyResponse } from '@/lib/api/schema'

function toIsoRangeLast24Hours(now: Date) {
  const end = new Date(now)
  const start = new Date(now)
  start.setHours(start.getHours() - 24)
  return {
    start_at: start.toISOString(),
    end_at: end.toISOString(),
  }
}

function toBenchmarkCompareRange(now: Date) {
  const candidateEnd = new Date(now)
  const candidateStart = new Date(now)
  candidateStart.setHours(candidateStart.getHours() - 24)
  const baselineEnd = new Date(candidateStart)
  const baselineStart = new Date(candidateStart)
  baselineStart.setHours(baselineStart.getHours() - 24)

  return {
    baseline_start_at: baselineStart.toISOString(),
    baseline_end_at: baselineEnd.toISOString(),
    candidate_start_at: candidateStart.toISOString(),
    candidate_end_at: candidateEnd.toISOString(),
  }
}

function toLocalDateTimeInputValue(isoValue: string) {
  const date = new Date(isoValue)
  if (Number.isNaN(date.getTime())) return ''
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 16)
}

function toIsoFromLocalDateTimeInput(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString()
}

function formatMs(value: number | null) {
  if (value === null) return '—'
  return `${value.toFixed(1)} ms`
}

function formatUsd(value: number | null) {
  if (value === null) return '—'
  return `$${value.toFixed(4)}`
}

function formatPct(value: number | null) {
  if (value === null) return '—'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

function formatInteger(value: number) {
  return new Intl.NumberFormat().format(value)
}

function widthByMax(value: number, max: number) {
  if (max <= 0) return '0%'
  return `${Math.max(8, Math.round((value / max) * 100))}%`
}

export default function AnalyticsPage() {
  const now = useMemo(() => new Date(), [])
  const initialRange = useMemo(() => toIsoRangeLast24Hours(now), [now])
  const initialCompareRange = useMemo(() => toBenchmarkCompareRange(now), [now])

  const [rangeInputs, setRangeInputs] = useState({
    start_at: toLocalDateTimeInputValue(initialRange.start_at),
    end_at: toLocalDateTimeInputValue(initialRange.end_at),
  })
  const [compareInputs, setCompareInputs] = useState({
    baseline_start_at: toLocalDateTimeInputValue(initialCompareRange.baseline_start_at),
    baseline_end_at: toLocalDateTimeInputValue(initialCompareRange.baseline_end_at),
    candidate_start_at: toLocalDateTimeInputValue(initialCompareRange.candidate_start_at),
    candidate_end_at: toLocalDateTimeInputValue(initialCompareRange.candidate_end_at),
  })

  const stageRange = useMemo(
    () => ({
      start_at: toIsoFromLocalDateTimeInput(rangeInputs.start_at) || initialRange.start_at,
      end_at: toIsoFromLocalDateTimeInput(rangeInputs.end_at) || initialRange.end_at,
    }),
    [initialRange.end_at, initialRange.start_at, rangeInputs.end_at, rangeInputs.start_at],
  )
  const compareRange = useMemo(
    () => ({
      baseline_start_at:
        toIsoFromLocalDateTimeInput(compareInputs.baseline_start_at) ||
        initialCompareRange.baseline_start_at,
      baseline_end_at:
        toIsoFromLocalDateTimeInput(compareInputs.baseline_end_at) ||
        initialCompareRange.baseline_end_at,
      candidate_start_at:
        toIsoFromLocalDateTimeInput(compareInputs.candidate_start_at) ||
        initialCompareRange.candidate_start_at,
      candidate_end_at:
        toIsoFromLocalDateTimeInput(compareInputs.candidate_end_at) ||
        initialCompareRange.candidate_end_at,
    }),
    [
      compareInputs.baseline_end_at,
      compareInputs.baseline_start_at,
      compareInputs.candidate_end_at,
      compareInputs.candidate_start_at,
      initialCompareRange.baseline_end_at,
      initialCompareRange.baseline_start_at,
      initialCompareRange.candidate_end_at,
      initialCompareRange.candidate_start_at,
    ],
  )

  const stageLatencyQuery = useOverviewStageLatencyQuery(stageRange)
  const stageCostQuery = useOverviewStageCostQuery(stageRange)
  const benchmarkCompareQuery = useOverviewBenchmarkCompareQuery(compareRange)

  const hasError =
    stageLatencyQuery.isError || stageCostQuery.isError || benchmarkCompareQuery.isError

  type StageLatencyItem = OverviewStageLatencyResponse['items'][number]
  type StageCostItem = OverviewStageCostResponse['items'][number]

  const slowestStage = useMemo(
    () =>
      (stageLatencyQuery.data?.items ?? []).reduce(
        (current, item) => (item.p95_ms > (current?.p95_ms ?? -1) ? item : current),
        null as null | StageLatencyItem,
      ),
    [stageLatencyQuery.data?.items],
  )

  const mostExpensiveStage = useMemo(
    () =>
      (stageCostQuery.data?.items ?? []).reduce(
        (current, item) =>
          item.cost_per_1k_requests > (current?.cost_per_1k_requests ?? -1) ? item : current,
        null as null | StageCostItem,
      ),
    [stageCostQuery.data?.items],
  )

  const totalErrors = useMemo(
    () =>
      (stageLatencyQuery.data?.items ?? []).reduce((sum, item) => sum + item.error_count, 0),
    [stageLatencyQuery.data?.items],
  )
  const totalCost = useMemo(
    () =>
      (stageCostQuery.data?.items ?? []).reduce((sum, item) => sum + item.total_estimated_cost_usd, 0),
    [stageCostQuery.data?.items],
  )

  const maxLatencyP95 = Math.max(
    0,
    ...(stageLatencyQuery.data?.items ?? []).map((item) => item.p95_ms),
  )
  const maxCostPer1k = Math.max(
    0,
    ...(stageCostQuery.data?.items ?? []).map((item) => item.cost_per_1k_requests),
  )

  return (
    <div className="min-h-screen bg-[hsl(var(--claude-bg))]">
      <AppSidebar activePage="analytics" />
      <AppHeader />

      <main className="ml-64 flex flex-col gap-8 bg-[hsl(var(--claude-bg))] px-6 pb-12 pt-24 lg:px-8">
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-[hsl(var(--claude-muted))]">
              Platform
            </p>
            <h2 className="text-[clamp(1.6rem,2.5vw,2.2rem)] font-semibold tracking-tight text-[hsl(var(--claude-text))]">
              Stage Analytics
            </h2>
            <p className="text-sm text-[hsl(var(--claude-muted))]">
              Stage latency, estimated cost, and benchmark deltas from inference telemetry.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="h-9 border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface))] px-3 text-[hsl(var(--claude-muted))]"
            >
              <CalendarDays data-icon="inline-start" />
              Live from overview telemetry APIs
            </Badge>
            <Button
              variant="outline"
              size="icon"
              aria-label="Refresh analytics"
              className="border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface))] text-[hsl(var(--claude-text))] hover:bg-[hsl(var(--claude-surface-elevated))]"
              onClick={() => {
                void stageLatencyQuery.refetch()
                void stageCostQuery.refetch()
                void benchmarkCompareQuery.refetch()
              }}
            >
              <RefreshCcw />
            </Button>
          </div>
        </section>

        {hasError ? (
          <Alert variant="destructive">
            {stageLatencyQuery.error?.message ??
              stageCostQuery.error?.message ??
              benchmarkCompareQuery.error?.message}
          </Alert>
        ) : null}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface))]">
            <CardHeader className="gap-1 pb-2">
              <CardDescription className="text-xs uppercase tracking-[0.1em] text-[hsl(var(--claude-muted))]">
                Slowest P95 Stage
              </CardDescription>
              <CardTitle className="text-lg text-[hsl(var(--claude-text))]">
                {slowestStage?.stage_name ?? '—'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-[hsl(var(--claude-text))]">
                {formatMs(slowestStage?.p95_ms ?? null)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface))]">
            <CardHeader className="gap-1 pb-2">
              <CardDescription className="text-xs uppercase tracking-[0.1em] text-[hsl(var(--claude-muted))]">
                Highest Cost / 1k
              </CardDescription>
              <CardTitle className="text-lg text-[hsl(var(--claude-text))]">
                {mostExpensiveStage?.stage_name ?? '—'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-[hsl(var(--claude-text))]">
                {formatUsd(mostExpensiveStage?.cost_per_1k_requests ?? null)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface))]">
            <CardHeader className="gap-1 pb-2">
              <CardDescription className="text-xs uppercase tracking-[0.1em] text-[hsl(var(--claude-muted))]">
                Total Stage Errors
              </CardDescription>
              <CardTitle className="text-lg text-[hsl(var(--claude-text))]">Errors</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-[hsl(var(--claude-text))]">
                {formatInteger(totalErrors)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface))]">
            <CardHeader className="gap-1 pb-2">
              <CardDescription className="text-xs uppercase tracking-[0.1em] text-[hsl(var(--claude-muted))]">
                Total Estimated Cost
              </CardDescription>
              <CardTitle className="text-lg text-[hsl(var(--claude-text))]">USD</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-[hsl(var(--claude-text))]">
                {formatUsd(totalCost)}
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card className="border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface))]">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-[hsl(var(--claude-text))]">
                <Gauge className="mr-2 inline size-4" />
                Stage Latency (P95)
              </CardTitle>
              <CardDescription className="text-[hsl(var(--claude-muted))]">
                Adjustable telemetry window
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Input
                  type="datetime-local"
                  value={rangeInputs.start_at}
                  onChange={(event) =>
                    setRangeInputs((current) => ({ ...current, start_at: event.target.value }))
                  }
                  aria-label="Stage range start"
                />
                <Input
                  type="datetime-local"
                  value={rangeInputs.end_at}
                  onChange={(event) =>
                    setRangeInputs((current) => ({ ...current, end_at: event.target.value }))
                  }
                  aria-label="Stage range end"
                />
              </div>

              <div className="space-y-3">
                {(stageLatencyQuery.data?.items ?? []).map((item) => (
                  <div key={item.stage_name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-[hsl(var(--claude-text))]">
                        {item.stage_name}
                      </span>
                      <span className="tabular-nums text-[hsl(var(--claude-muted))]">
                        {formatMs(item.p95_ms)}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[hsl(var(--claude-surface-elevated))]">
                      <div
                        className="h-2 rounded-full bg-[hsl(var(--claude-accent))]"
                        style={{ width: widthByMax(item.p95_ms, maxLatencyP95) }}
                      />
                    </div>
                  </div>
                ))}
                {(stageLatencyQuery.data?.items.length ?? 0) === 0 ? (
                  <p className="text-sm text-[hsl(var(--claude-muted))]">
                    No latency data in this timeframe.
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface))]">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-[hsl(var(--claude-text))]">
                <TrendingUp className="mr-2 inline size-4" />
                Stage Cost (per 1k requests)
              </CardTitle>
              <CardDescription className="text-[hsl(var(--claude-muted))]">
                Estimated stage cost from pricing model
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {(stageCostQuery.data?.items ?? []).map((item) => (
                  <div key={item.stage_name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-[hsl(var(--claude-text))]">
                        {item.stage_name}
                      </span>
                      <span className="tabular-nums text-[hsl(var(--claude-muted))]">
                        {formatUsd(item.cost_per_1k_requests)}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[hsl(var(--claude-surface-elevated))]">
                      <div
                        className="h-2 rounded-full bg-[hsl(var(--claude-accent))]"
                        style={{ width: widthByMax(item.cost_per_1k_requests, maxCostPer1k) }}
                      />
                    </div>
                  </div>
                ))}
                {(stageCostQuery.data?.items.length ?? 0) === 0 ? (
                  <p className="text-sm text-[hsl(var(--claude-muted))]">
                    No cost data in this timeframe.
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card className="border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface))] xl:col-span-2">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-[hsl(var(--claude-text))]">
                Benchmark Comparison (Candidate vs Baseline)
              </CardTitle>
              <CardDescription className="text-[hsl(var(--claude-muted))]">
                Compare p95 latency and cost deltas by stage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                <Input
                  type="datetime-local"
                  value={compareInputs.baseline_start_at}
                  onChange={(event) =>
                    setCompareInputs((current) => ({
                      ...current,
                      baseline_start_at: event.target.value,
                    }))
                  }
                  aria-label="Baseline start"
                />
                <Input
                  type="datetime-local"
                  value={compareInputs.baseline_end_at}
                  onChange={(event) =>
                    setCompareInputs((current) => ({
                      ...current,
                      baseline_end_at: event.target.value,
                    }))
                  }
                  aria-label="Baseline end"
                />
                <Input
                  type="datetime-local"
                  value={compareInputs.candidate_start_at}
                  onChange={(event) =>
                    setCompareInputs((current) => ({
                      ...current,
                      candidate_start_at: event.target.value,
                    }))
                  }
                  aria-label="Candidate start"
                />
                <Input
                  type="datetime-local"
                  value={compareInputs.candidate_end_at}
                  onChange={(event) =>
                    setCompareInputs((current) => ({
                      ...current,
                      candidate_end_at: event.target.value,
                    }))
                  }
                  aria-label="Candidate end"
                />
              </div>

              <div className="space-y-3">
                {(benchmarkCompareQuery.data?.items ?? []).map((item) => (
                  <div
                    key={item.stage_name}
                    className="rounded-lg border border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface-elevated))] p-3"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-semibold uppercase tracking-wide text-[hsl(var(--claude-text))]">
                        {item.stage_name}
                      </span>
                      <span className="text-xs text-[hsl(var(--claude-muted))]">
                        P95 {formatPct(item.p95_delta_pct)} / Cost {formatPct(item.cost_per_1k_delta_pct)}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      <div className="space-y-1">
                        <p className="text-xs text-[hsl(var(--claude-muted))]">P95 delta</p>
                        <div className="h-2 rounded-full bg-[hsl(var(--claude-surface))]">
                          <div
                            className={`h-2 rounded-full ${
                              (item.p95_delta_pct ?? 0) <= 0
                                ? 'bg-emerald-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(8, Math.abs(item.p95_delta_pct ?? 0)))}%` }}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-[hsl(var(--claude-muted))]">Cost delta</p>
                        <div className="h-2 rounded-full bg-[hsl(var(--claude-surface))]">
                          <div
                            className={`h-2 rounded-full ${
                              (item.cost_per_1k_delta_pct ?? 0) <= 0
                                ? 'bg-emerald-500'
                                : 'bg-rose-500'
                            }`}
                            style={{
                              width: `${Math.min(100, Math.max(8, Math.abs(item.cost_per_1k_delta_pct ?? 0)))}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {(benchmarkCompareQuery.data?.items.length ?? 0) === 0 ? (
                  <p className="text-sm text-[hsl(var(--claude-muted))]">
                    No benchmark comparison data for the selected windows.
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card className="overflow-hidden border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface))]">
            <CardHeader>
              <CardTitle className="text-lg text-[hsl(var(--claude-text))]">
                Stage Latency Table
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Stage</TableHead>
                    <TableHead>P50</TableHead>
                    <TableHead>P95</TableHead>
                    <TableHead>Avg</TableHead>
                    <TableHead>Errors</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(stageLatencyQuery.data?.items ?? []).map((item) => (
                    <TableRow key={item.stage_name}>
                      <TableCell className="font-medium uppercase">{item.stage_name}</TableCell>
                      <TableCell>{formatMs(item.p50_ms)}</TableCell>
                      <TableCell>{formatMs(item.p95_ms)}</TableCell>
                      <TableCell>{formatMs(item.avg_ms)}</TableCell>
                      <TableCell>{formatInteger(item.error_count)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface))]">
            <CardHeader>
              <CardTitle className="text-lg text-[hsl(var(--claude-text))]">
                Stage Cost Table
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Stage</TableHead>
                    <TableHead>Requests</TableHead>
                    <TableHead>Total USD</TableHead>
                    <TableHead>USD / 1k</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(stageCostQuery.data?.items ?? []).map((item) => (
                    <TableRow key={item.stage_name}>
                      <TableCell className="font-medium uppercase">{item.stage_name}</TableCell>
                      <TableCell>{formatInteger(item.request_count)}</TableCell>
                      <TableCell>{formatUsd(item.total_estimated_cost_usd)}</TableCell>
                      <TableCell>{formatUsd(item.cost_per_1k_requests)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
