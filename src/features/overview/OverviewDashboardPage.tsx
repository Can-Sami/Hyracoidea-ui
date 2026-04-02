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
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

function confidenceBarClass(confidence: number) {
  if (confidence >= 0.9) return 'bg-emerald-500'
  if (confidence >= 0.8) return 'bg-amber-500'
  return 'bg-primary'
}

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
    <div className="min-h-screen bg-background">
      <AppSidebar activePage="overview" />

      <AppHeader />

      <main className="ml-64 flex flex-col gap-10 px-6 pb-12 pt-24 lg:px-10">
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-[clamp(1.6rem,2.5vw,2.2rem)] font-semibold tracking-tight">
              Overview Dashboard
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              System status and intent performance metrics for the last 24 hours.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <CalendarDays data-icon="inline-start" />
              Last 24 Hours
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Refresh dashboard"
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

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Inferences
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-end gap-2">
                <p className="text-3xl font-semibold">
                  {summaryQuery.data?.total_inferences ?? '—'}
                </p>
                {summaryQuery.data ? (
                  <Badge variant="secondary">
                    {formatDelta(summaryQuery.data.total_inferences_delta_pct)}
                  </Badge>
                ) : null}
              </div>
              <Progress value={75} className="h-1.5" />
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Avg. Confidence
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-end gap-2">
                <p className="text-3xl font-bold">
                  {summaryQuery.data ? toPercent(summaryQuery.data.avg_confidence) : '—'}
                </p>
                {summaryQuery.data ? (
                  <Badge variant="outline">
                    {formatDelta(summaryQuery.data.avg_confidence_delta_pct)}
                  </Badge>
                ) : null}
              </div>
              <div className="grid h-8 grid-cols-5 items-end gap-1">
                <div className="h-1/2 rounded-t bg-primary/20" />
                <div className="h-3/4 rounded-t bg-primary/20" />
                <div className="h-full rounded-t bg-primary/20" />
                <div className="h-4/5 rounded-t bg-primary" />
                <div className="h-2/3 rounded-t bg-primary/20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                /api/healthz
              </p>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CircleCheckBig />
              </div>
              <div>
                <p className="text-sm font-bold">Operational</p>
                <p className="text-xs text-muted-foreground">
                  {healthQuery.data?.status ?? 'unknown'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                /api/readyz
              </p>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Activity />
              </div>
              <div>
                <p className="text-sm font-bold">Ready</p>
                <p className="text-xs text-muted-foreground">
                  {readyzQuery.data?.service ?? 'unknown service'}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="space-y-4 lg:col-span-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Recent Inference Activity</h3>
              <Button variant="link" size="sm">
                View All Logs
              </Button>
            </div>

            <Card className="border-border/70 shadow-sm">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Input Snippet</TableHead>
                      <TableHead>Predicted Intent</TableHead>
                      <TableHead>Confidence</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(recentActivityQuery.data?.items ?? []).map((row) => (
                      <TableRow key={`${row.timestamp}-${row.input_snippet}`}>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {row.timestamp}
                        </TableCell>
                        <TableCell className="max-w-[250px] truncate" title={row.input_snippet}>
                          {row.input_snippet}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="uppercase">
                            {row.predicted_intent ?? 'unmatched'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{row.confidence.toFixed(2)}</span>
                            <div className="h-1 w-12 rounded-full bg-muted">
                              <div
                                className={cn(
                                  'h-1 rounded-full',
                                  confidenceBarClass(row.confidence),
                                )}
                                style={{ width: `${Math.round(row.confidence * 100)}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(recentActivityQuery.data?.items.length ?? 0) === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                          No recent activity in the selected timeframe.
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-4 lg:col-span-1">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Intent Distribution</h3>
            </div>
            <Card className="border-border/70 shadow-sm">
              <CardContent className="flex flex-col gap-5 p-6">
                {(distributionQuery.data?.items ?? []).map((entry, index) => (
                  <div key={entry.intent_code} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide">
                      <span>{entry.intent_code}</span>
                      <span className="text-muted-foreground">{entry.percentage.toFixed(2)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{
                          width: `${entry.percentage}%`,
                          opacity: `${Math.max(0.2, 1 - index * 0.18)}`,
                        }}
                      />
                    </div>
                  </div>
                ))}
                {(distributionQuery.data?.items.length ?? 0) === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No distribution data in the selected timeframe.
                  </p>
                ) : null}
                <Button variant="outline" size="sm" className="mt-3">
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
