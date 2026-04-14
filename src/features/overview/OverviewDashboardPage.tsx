import { Activity, CalendarDays, CircleCheckBig, RefreshCcw } from 'lucide-react'
import { useMemo } from 'react'

import { AppHeader } from '@/components/layout/AppHeader'
import { AppSidebar } from '@/components/layout/AppSidebar'
import {
  useHealthQuery,
  useOverviewIntentDistributionQuery,
  useOverviewRecentActivityQuery,
  useOverviewSummaryQuery,
  useReadyzQuery,
} from '@/lib/api/hooks'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

function toPercent(value: number) {
  return `${Math.round(value * 100)}%`
}

function formatDelta(value: number | null) {
  if (value === null) return '—'
  const direction = value > 0 ? '+' : ''
  return `${direction}${value.toFixed(2)}%`
}

function toIsoRangeLast24Hours(now: Date) {
  const end = new Date(now)
  const start = new Date(now)
  start.setHours(start.getHours() - 24)
  return {
    start_at: start.toISOString(),
    end_at: end.toISOString(),
  }
}

export function OverviewDashboardPage() {
  const timeframe = useMemo(() => toIsoRangeLast24Hours(new Date()), [])
  const healthQuery = useHealthQuery()
  const readyzQuery = useReadyzQuery()
  const summaryQuery = useOverviewSummaryQuery(timeframe)
  const distributionQuery = useOverviewIntentDistributionQuery(timeframe)
  const recentActivityQuery = useOverviewRecentActivityQuery(timeframe, 10)

  const hasOverviewError =
    summaryQuery.isError || distributionQuery.isError || recentActivityQuery.isError

  return (
    <div className="min-h-screen bg-[hsl(var(--claude-bg))]">
      <AppSidebar activePage="overview" />

      <AppHeader />

      <main className="ml-64 flex flex-col gap-8 bg-[hsl(var(--claude-bg))] px-6 pb-12 pt-24 lg:px-8">
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-[hsl(var(--claude-muted))]">
              Platform
            </p>
            <h2 className="text-[clamp(1.6rem,2.5vw,2.2rem)] font-semibold tracking-tight text-[hsl(var(--claude-text))]">
              Overview Dashboard
            </h2>
            <p className="text-sm text-[hsl(var(--claude-muted))]">
              System status and intent performance metrics for the last 24 hours.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface))] text-[hsl(var(--claude-text))] hover:bg-[hsl(var(--claude-surface-elevated))]"
            >
              <CalendarDays data-icon="inline-start" />
              Last 24 Hours
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Refresh dashboard"
              className="border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface))] text-[hsl(var(--claude-text))] hover:bg-[hsl(var(--claude-surface-elevated))]"
              onClick={() => {
                void healthQuery.refetch()
                void readyzQuery.refetch()
                void summaryQuery.refetch()
                void distributionQuery.refetch()
                void recentActivityQuery.refetch()
              }}
            >
              <RefreshCcw />
            </Button>
          </div>
        </section>

        {healthQuery.isError || readyzQuery.isError ? (
          <Alert variant="destructive">
            {healthQuery.error?.message ?? readyzQuery.error?.message}
          </Alert>
        ) : null}
        {hasOverviewError ? (
          <Alert variant="destructive">
            {summaryQuery.error?.message ??
              distributionQuery.error?.message ??
              recentActivityQuery.error?.message}
          </Alert>
        ) : null}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface))]">
            <CardHeader className="gap-1 pb-3">
              <CardDescription className="text-xs font-medium uppercase tracking-[0.1em] text-[hsl(var(--claude-muted))]">
                Total Inferences
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-end gap-2">
                <CardTitle className="text-3xl font-semibold text-[hsl(var(--claude-text))]">
                  {summaryQuery.data?.total_inferences ?? '—'}
                </CardTitle>
                {summaryQuery.data ? (
                  <Badge
                    variant="secondary"
                    className="border-[hsl(var(--claude-accent)/0.5)] bg-[hsl(var(--claude-accent-soft))] text-[hsl(var(--claude-text))]"
                  >
                    {formatDelta(summaryQuery.data.total_inferences_delta_pct)}
                  </Badge>
                ) : null}
              </div>
              <div className="h-1.5 w-full rounded-full bg-[hsl(var(--claude-surface-elevated))]">
                <div
                  className="h-1.5 rounded-full bg-[hsl(var(--claude-accent))]"
                  style={{ width: '75%' }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface))]">
            <CardHeader className="gap-1 pb-3">
              <CardDescription className="text-xs font-medium uppercase tracking-[0.1em] text-[hsl(var(--claude-muted))]">
                Avg. Confidence
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-end gap-2">
                <CardTitle className="text-3xl font-semibold text-[hsl(var(--claude-text))]">
                  {summaryQuery.data ? toPercent(summaryQuery.data.avg_confidence) : '—'}
                </CardTitle>
                {summaryQuery.data ? (
                  <Badge
                    variant="outline"
                    className="border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface-elevated))] text-[hsl(var(--claude-muted))]"
                  >
                    {formatDelta(summaryQuery.data.avg_confidence_delta_pct)}
                  </Badge>
                ) : null}
              </div>
              <div className="grid h-8 grid-cols-5 items-end gap-1">
                <div className="h-1/2 rounded-t bg-[hsl(var(--claude-accent-soft))]" />
                <div className="h-3/4 rounded-t bg-[hsl(var(--claude-accent-soft))]" />
                <div className="h-full rounded-t bg-[hsl(var(--claude-accent-soft))]" />
                <div className="h-4/5 rounded-t bg-[hsl(var(--claude-accent))]" />
                <div className="h-2/3 rounded-t bg-[hsl(var(--claude-accent-soft))]" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface))]">
            <CardHeader className="gap-1 pb-3">
              <CardDescription className="text-xs font-medium uppercase tracking-[0.1em] text-[hsl(var(--claude-muted))]">
                /api/healthz
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-[hsl(var(--claude-accent-soft))] text-[hsl(var(--claude-accent))]">
                <CircleCheckBig />
              </div>
              <div>
                <p className="text-sm font-semibold text-[hsl(var(--claude-text))]">Operational</p>
                <p className="text-xs text-[hsl(var(--claude-muted))]">
                  {healthQuery.data?.status ?? 'unknown'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface))]">
            <CardHeader className="gap-1 pb-3">
              <CardDescription className="text-xs font-medium uppercase tracking-[0.1em] text-[hsl(var(--claude-muted))]">
                /api/readyz
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-[hsl(var(--claude-accent-soft))] text-[hsl(var(--claude-accent))]">
                <Activity />
              </div>
              <div>
                <p className="text-sm font-semibold text-[hsl(var(--claude-text))]">Ready</p>
                <p className="text-xs text-[hsl(var(--claude-muted))]">
                  {readyzQuery.data?.service ?? 'unknown service'}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="flex flex-col gap-4 lg:col-span-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[hsl(var(--claude-text))]">Recent Inference Activity</h3>
              <Button variant="link" size="sm">
                View All Logs
              </Button>
            </div>

            <Card className="overflow-hidden border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface))]">
              <CardContent className="p-0">
                <Table
                  className="bg-[hsl(var(--claude-surface))]"
                  containerClassName="border-[hsl(var(--claude-accent-soft))] bg-[hsl(var(--claude-accent-soft))]"
                >
                  <TableHeader>
                    <TableRow className="cursor-default bg-[hsl(var(--claude-accent-soft))] hover:!bg-[hsl(var(--claude-accent-soft))] transition-none">
                      <TableHead className="text-[hsl(var(--claude-text))]">Timestamp</TableHead>
                      <TableHead className="text-[hsl(var(--claude-text))]">Input Snippet</TableHead>
                      <TableHead className="text-[hsl(var(--claude-text))]">Predicted Intent</TableHead>
                      <TableHead className="text-[hsl(var(--claude-text))]">Confidence</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(recentActivityQuery.data?.items ?? []).map((row) => (
                      <TableRow
                        key={`${row.timestamp}-${row.input_snippet}`}
                        className="border-b border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface))] hover:bg-[hsl(var(--claude-surface-elevated))]"
                      >
                        <TableCell className="font-mono text-xs text-[hsl(var(--claude-muted))]">
                          {row.timestamp}
                        </TableCell>
                        <TableCell className="max-w-[250px] truncate text-[hsl(var(--claude-text))]" title={row.input_snippet}>
                          {row.input_snippet}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="uppercase border-[hsl(var(--claude-accent)/0.5)] bg-[hsl(var(--claude-accent-soft))] text-[hsl(var(--claude-text))]"
                          >
                            {row.predicted_intent ?? 'unmatched'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold tabular-nums text-[hsl(var(--claude-text))]">
                              {row.confidence.toFixed(2)}
                            </span>
                            <div className="h-1.5 w-20 rounded-full bg-[hsl(var(--claude-surface-elevated))]">
                              <div
                                className="h-1.5 rounded-full bg-[hsl(var(--claude-accent))]"
                                style={{ width: `${Math.round(row.confidence * 100)}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(recentActivityQuery.data?.items.length ?? 0) === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-8 text-center text-sm text-[hsl(var(--claude-muted))]">
                          No recent activity in the selected timeframe.
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <aside className="flex flex-col gap-4 lg:col-span-1">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[hsl(var(--claude-text))]">Intent Distribution</h3>
            </div>
            <Card className="border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface))]">
              <CardContent className="flex flex-col gap-5 p-6">
                {(distributionQuery.data?.items ?? []).map((entry, index) => (
                  <div key={entry.intent_code} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide">
                      <span className="text-[hsl(var(--claude-text))]">{entry.intent_code}</span>
                      <span className="text-[hsl(var(--claude-muted))]">{entry.percentage.toFixed(2)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[hsl(var(--claude-surface-elevated))]">
                      <div
                        className="h-2 rounded-full bg-[hsl(var(--claude-accent))]"
                        style={{
                          width: `${entry.percentage}%`,
                          opacity: `${Math.max(0.4, 1 - index * 0.12)}`,
                        }}
                      />
                    </div>
                  </div>
                ))}
                {(distributionQuery.data?.items.length ?? 0) === 0 ? (
                  <p className="text-sm text-[hsl(var(--claude-muted))]">
                    No distribution data in the selected timeframe.
                  </p>
                ) : null}
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface-elevated))] text-[hsl(var(--claude-text))] hover:bg-[hsl(var(--claude-accent-soft))]"
                >
                  View Detailed Metrics
                </Button>
              </CardContent>
            </Card>
          </aside>
        </section>
      </main>
    </div>
  )
}
