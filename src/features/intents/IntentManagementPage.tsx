import type { ComponentProps, ComponentType } from 'react'
import { useState } from 'react'
import {
  Bot,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  Filter,
  Plus,
  RefreshCcw,
  Save,
  Trash2,
  TreePine,
  TrendingUp,
} from 'lucide-react'

import { AppHeader } from '@/components/layout/AppHeader'
import { AppSidebar } from '@/components/layout/AppSidebar'
import {
  useCreateIntentMutation,
  useDeleteIntentMutation,
  useIntentsQuery,
  useReindexIntentsMutation,
  useUpdateIntentMutation,
} from '@/lib/api/hooks'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
  id: string
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
  const intentsQuery = useIntentsQuery()
  const reindexMutation = useReindexIntentsMutation()
  const createMutation = useCreateIntentMutation()
  const updateMutation = useUpdateIntentMutation()
  const deleteMutation = useDeleteIntentMutation()
  const [intentCode, setIntentCode] = useState('')
  const [description, setDescription] = useState('')
  const [editingIntentId, setEditingIntentId] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const rows: IntentRow[] = (intentsQuery.data?.items ?? []).map((item) => ({
    id: item.id,
    code: item.intent_code,
    description: item.description,
    status: item.is_active ? 'active' : 'inactive',
    utterances: 0,
  }))

  const isSubmitting = createMutation.isPending || updateMutation.isPending
  const openCreateForm = () => {
    setEditingIntentId(null)
    setIntentCode('')
    setDescription('')
    setIsFormOpen(true)
  }

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
            <Button
              variant="outline"
              onClick={() => {
                reindexMutation.mutate()
              }}
              disabled={reindexMutation.isPending}
            >
              <RefreshCcw data-icon="inline-start" />
              {reindexMutation.isPending ? 'Reindexing...' : 'Reindex All'}
            </Button>
            <Button
              className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground"
              onClick={openCreateForm}
            >
              <Plus data-icon="inline-start" />
              New Intent
            </Button>
          </div>
        </section>
        <div className="flex gap-2">
          <Button
            aria-label="Open create intent form"
            onClick={openCreateForm}
          >
            <Plus data-icon="inline-start" />
            Create Intent
          </Button>
        </div>

        {isFormOpen ? (
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>{editingIntentId ? 'Edit Intent' : 'Create Intent'}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Input
                aria-label="Intent code"
                placeholder="balance_inquiry"
                value={intentCode}
                onChange={(event) => setIntentCode(event.target.value)}
              />
              <Textarea
                aria-label="Intent description"
                placeholder="Customer asks account balance"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  onClick={async () => {
                    const body = {
                      intent_code: intentCode.trim(),
                      description: description.trim(),
                    }
                    if (!body.intent_code || !body.description) return

                    if (editingIntentId) {
                      await updateMutation.mutateAsync({ intentId: editingIntentId, body })
                    } else {
                      await createMutation.mutateAsync(body)
                    }
                    setIsFormOpen(false)
                    setEditingIntentId(null)
                    setIntentCode('')
                    setDescription('')
                  }}
                  disabled={isSubmitting}
                >
                  <Save data-icon="inline-start" />
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsFormOpen(false)
                    setEditingIntentId(null)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} metric={metric} />
          ))}
        </section>

        {intentsQuery.isError || createMutation.isError || updateMutation.isError || deleteMutation.isError ? (
          <p className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            {intentsQuery.error?.message ||
              createMutation.error?.message ||
              updateMutation.error?.message ||
              deleteMutation.error?.message}
          </p>
        ) : null}

        {reindexMutation.isSuccess ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            {reindexMutation.data.reindexed_count} intents reindexed
          </p>
        ) : null}

        <Card className="border-border/70 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CardTitle className="text-xl">Library Manifest</CardTitle>
                <Badge variant="secondary">{rows.length} total</Badge>
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
                    <TableRow key={row.id}>
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
                          onClick={() => {
                            setEditingIntentId(row.id)
                            setIntentCode(row.code)
                            setDescription(row.description)
                            setIsFormOpen(true)
                          }}
                        >
                          <Edit />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Delete ${row.code}`}
                          onClick={() => {
                            void deleteMutation.mutateAsync(row.id)
                          }}
                        >
                          <Trash2 />
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <a href={`/intents/${row.id}/utterances`}>Utterances</a>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between border-t p-4 text-xs text-muted-foreground">
              <span>
                Showing {rows.length === 0 ? 0 : 1} to {rows.length} of {rows.length}{' '}
                intents
              </span>
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
                    <Button
                      variant="link"
                      size="sm"
                      className="self-end"
                      onClick={() => {
                        setEditingIntentId(null)
                        setIntentCode('')
                        setDescription(suggestion.text)
                        setIsFormOpen(true)
                      }}
                    >
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
