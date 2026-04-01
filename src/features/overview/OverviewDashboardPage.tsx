import { Activity, CalendarDays, CircleCheckBig, RefreshCcw } from 'lucide-react'

import { AppHeader } from '@/components/layout/AppHeader'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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

type InferenceRow = {
  timestamp: string
  input: string
  intent: string
  confidence: number
}

type Distribution = {
  label: string
  value: number
}

const inferenceRows: InferenceRow[] = [
  {
    timestamp: '14:20:45.02',
    input: 'I need to reset my password',
    intent: 'auth_reset',
    confidence: 0.98,
  },
  {
    timestamp: '14:20:42.88',
    input: 'Check delivery status',
    intent: 'order_track',
    confidence: 0.94,
  },
  {
    timestamp: '14:20:38.15',
    input: 'Can I change my address?',
    intent: 'user_update',
    confidence: 0.81,
  },
  {
    timestamp: '14:20:30.50',
    input: 'Talk to human',
    intent: 'escalate_rep',
    confidence: 0.99,
  },
  {
    timestamp: '14:20:25.12',
    input: 'Refund policy for orders',
    intent: 'policy_query',
    confidence: 0.89,
  },
]

const distributions: Distribution[] = [
  { label: 'Order Tracking', value: 42 },
  { label: 'Auth & Login', value: 28 },
  { label: 'Billing Inquiries', value: 15 },
  { label: 'Returns', value: 10 },
  { label: 'Technical Support', value: 5 },
]

function confidenceBarClass(confidence: number) {
  if (confidence >= 0.9) return 'bg-emerald-500'
  if (confidence >= 0.8) return 'bg-amber-500'
  return 'bg-primary'
}

export function OverviewDashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar activePage="overview" />

      <AppHeader />

      <main className="ml-64 flex flex-col gap-8 px-8 pb-10 pt-24">
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">
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
            <Button variant="outline" size="icon" aria-label="Refresh dashboard">
              <RefreshCcw />
            </Button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Inferences
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-end gap-2">
                <p className="text-3xl font-bold">1.28M</p>
                <Badge variant="secondary">+12%</Badge>
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
                <p className="text-3xl font-bold">94.2%</p>
                <Badge variant="outline">-0.4%</Badge>
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
                <p className="text-xs text-muted-foreground">Uptime: 99.98%</p>
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
                <p className="text-xs text-muted-foreground">Latency: 42ms</p>
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
                    {inferenceRows.map((row) => (
                      <TableRow key={`${row.timestamp}-${row.intent}`}>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {row.timestamp}
                        </TableCell>
                        <TableCell className="max-w-[250px] truncate" title={row.input}>
                          {row.input}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="uppercase">
                            {row.intent}
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
                {distributions.map((entry, index) => (
                  <div key={entry.label} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide">
                      <span>{entry.label}</span>
                      <span className="text-muted-foreground">{entry.value}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{
                          width: `${entry.value}%`,
                          opacity: `${Math.max(0.2, 1 - index * 0.18)}`,
                        }}
                      />
                    </div>
                  </div>
                ))}
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
