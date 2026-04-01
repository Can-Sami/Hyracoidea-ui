import type { ComponentProps, ComponentType } from 'react'
import {
  Bot,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  Filter,
  Plus,
  RefreshCcw,
  Trash2,
  TreePine,
  TrendingUp,
} from 'lucide-react'

import { AppHeader } from '@/components/layout/AppHeader'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

type Metric = {
  label: string
  value: string
  hint: string
  icon: ComponentType<ComponentProps<'svg'>>
  delta?: string
}

type IntentRow = {
  code: string
  description: string
  status: 'active' | 'inactive'
  utterances: number
}

type SuggestionCard = {
  utterances: number
  text: string
}

const metrics: Metric[] = [
  {
    label: 'Total Intents',
    value: '142',
    hint: 'since last release',
    icon: TreePine,
    delta: '+12',
  },
  {
    label: 'Active Coverage',
    value: '98.4%',
    hint: 'Global intent recognition rate',
    icon: Bot,
  },
  {
    label: 'Total Utterances',
    value: '2.4k',
    hint: 'Training samples across library',
    icon: TrendingUp,
  },
]

const rows: IntentRow[] = [
  {
    code: 'GET_ORDER_STATUS',
    description:
      'Retrieves current delivery and shipping updates for a specific order ID.',
    status: 'active',
    utterances: 425,
  },
  {
    code: 'CANCEL_SUBSCRIPTION',
    description: 'Initiates the cancellation flow for recurring billing plans.',
    status: 'active',
    utterances: 182,
  },
  {
    code: 'LEGACY_FAULT_REPORT',
    description:
      'DEPRECATED: Old fault reporting system. Migrating to TICKETING_NEW.',
    status: 'inactive',
    utterances: 89,
  },
  {
    code: 'AGENT_HANDOFF',
    description:
      'Triggers transition from AI bot to live support representative.',
    status: 'active',
    utterances: 612,
  },
]

const suggestions: SuggestionCard[] = [
  {
    utterances: 32,
    text: 'I want to change my delivery address after shipping',
  },
  {
    utterances: 18,
    text: "Apply promo code from yesterday's email",
  },
]

function MetricCard({ metric }: { metric: Metric }) {
  const Icon = metric.icon

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {metric.label}
        </p>
        <Icon className="text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <p className="text-4xl font-bold tracking-tight">{metric.value}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {metric.delta ? <Badge variant="secondary">{metric.delta}</Badge> : null}
          <span>{metric.hint}</span>
        </div>
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: Pick<IntentRow, 'status'>) {
  return status === 'active' ? (
    <Badge className="uppercase">Active</Badge>
  ) : (
    <Badge variant="secondary" className="uppercase">
      Inactive
    </Badge>
  )
}

export function IntentManagementPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar activePage="intents" />

      <AppHeader />

      <main className="ml-64 flex flex-col gap-8 px-10 pb-10 pt-24">
        <section className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-extrabold tracking-tight">
              Intent Management
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Configure and maintain the semantic library of user intents.
              Changes to active intents require a reindex before deployment.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline">
              <RefreshCcw data-icon="inline-start" />
              Reindex All
            </Button>
            <Button className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
              <Plus data-icon="inline-start" />
              New Intent
            </Button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} metric={metric} />
          ))}
        </section>

        <Card className="border-border/70 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CardTitle className="text-xl">Library Manifest</CardTitle>
              <Badge variant="secondary">142 total</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Filter data-icon="inline-start" />
                Filter
              </Button>
              <Button variant="ghost" size="sm">
                <Download data-icon="inline-start" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Intent Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Utterances</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.code}>
                    <TableCell>
                      <code className="rounded-md bg-muted px-2 py-1 text-xs font-semibold text-primary">
                        {row.code}
                      </code>
                    </TableCell>
                    <TableCell
                      className={cn(
                        'max-w-[420px] truncate',
                        row.status === 'inactive' ? 'italic text-muted-foreground' : '',
                      )}
                      title={row.description}
                    >
                      {row.description}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={row.status} />
                    </TableCell>
                    <TableCell className="text-center font-semibold text-muted-foreground">
                      {row.utterances}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Edit ${row.code}`}
                        >
                          <Edit />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Delete ${row.code}`}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between border-t p-4 text-xs text-muted-foreground">
              <span>Showing 1 to 4 of 142 intents</span>
              <div className="flex items-center gap-1">
                <Button size="icon-xs" variant="outline" disabled aria-label="Previous page">
                  <ChevronLeft />
                </Button>
                <Button size="icon-xs" aria-label="Page 1">
                  1
                </Button>
                <Button size="icon-xs" variant="ghost" aria-label="Page 2">
                  2
                </Button>
                <Button size="icon-xs" variant="ghost" aria-label="Page 3">
                  3
                </Button>
                <span className="px-1">...</span>
                <Button size="icon-xs" variant="ghost" aria-label="Page 29">
                  29
                </Button>
                <Button size="icon-xs" variant="outline" aria-label="Next page">
                  <ChevronRight />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <Card className="border-border/70 shadow-sm lg:col-span-8">
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Bot />
                </div>
                <div>
                  <CardTitle className="text-lg">Intent Suggestion Engine</CardTitle>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Unlabeled Clustering Analysis
                  </p>
                </div>
              </div>
              <Button variant="link" size="sm">
                See all clusters
              </Button>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {suggestions.map((suggestion) => (
                <Card key={suggestion.text} className="border-dashed">
                  <CardContent className="flex flex-col gap-4 p-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">Detection</Badge>
                      <span className="text-xs text-muted-foreground">
                        {suggestion.utterances} utterances
                      </span>
                    </div>
                    <p className="font-medium">"{suggestion.text}"</p>
                    <Button variant="link" size="sm" className="self-end">
                      CREATE INTENT
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground lg:col-span-4">
            <CardHeader>
              <CardTitle className="text-lg">Indexing Health</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider">
                  <span>Semantic Map</span>
                  <span>92%</span>
                </div>
                <div className="h-2 rounded-full bg-white/20">
                  <div className="h-2 w-[92%] rounded-full bg-white" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider">
                  <span>Collection Stale</span>
                  <span>8m</span>
                </div>
                <div className="h-2 rounded-full bg-white/20">
                  <div className="h-2 w-[40%] rounded-full bg-white" />
                </div>
              </div>

              <p className="rounded-lg border border-white/15 bg-white/10 p-3 text-xs leading-relaxed">
                The indexing cluster is currently optimal. Last global reindex
                completed at 14:22 UTC without latency flags.
              </p>

              <Button
                variant="secondary"
                className="mt-2 bg-white text-primary hover:bg-white/90"
              >
                View Model Logs
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
