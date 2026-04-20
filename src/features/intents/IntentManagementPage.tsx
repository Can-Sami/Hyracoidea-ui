import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Edit,
  Ellipsis,
  MessageSquareText,
  Plus,
  RefreshCcw,
  Save,
  Trash2,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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

type IntentRow = {
  id: string
  code: string
  description: string
  status: 'active' | 'inactive'
}

function StatusBadge({ status }: Pick<IntentRow, 'status'>) {
  const isActive = status === 'active'
  return (
    <Badge
      variant={isActive ? 'outline' : 'secondary'}
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.08em]',
        isActive
          ? 'border-[hsl(var(--claude-accent)/0.55)] bg-[hsl(var(--claude-accent-soft))] text-[hsl(var(--claude-text))]'
          : 'border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface-elevated))] text-[hsl(var(--claude-muted))]',
      )}
    >
      {isActive ? 'Active' : 'Inactive'}
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
  const [formError, setFormError] = useState<string | null>(null)
  const [editingIntentId, setEditingIntentId] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const rows: IntentRow[] = (intentsQuery.data?.items ?? []).map((item) => ({
    id: item.id,
    code: item.intent_code,
    description: item.description,
    status: item.is_active ? 'active' : 'inactive',
  }))
  const activeCount = rows.filter((row) => row.status === 'active').length
  const inactiveCount = rows.length - activeCount

  const isSubmitting = createMutation.isPending || updateMutation.isPending
  const openCreateForm = () => {
    setEditingIntentId(null)
    setIntentCode('')
    setDescription('')
    setFormError(null)
    setIsFormOpen(true)
  }
  const closeForm = () => {
    setIsFormOpen(false)
    setEditingIntentId(null)
    setFormError(null)
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--claude-bg))] text-[hsl(var(--claude-text))]">
      <AppSidebar activePage="intents" />

      <AppHeader />

      <main className="ml-64 flex min-h-screen flex-col gap-8 bg-[hsl(var(--claude-bg))] px-6 pb-12 pt-24 lg:px-8">
        <section className="flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-[hsl(var(--claude-muted))]">
              Intent Library
            </p>
            <h2 className="mt-1 text-[clamp(1.75rem,2.5vw,2.3rem)] font-semibold tracking-tight text-[hsl(var(--claude-text))]">
              Intent Management
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[hsl(var(--claude-muted))]">
              Add, update, and review the intents your model can route.
              Reindex after changing active intents so new behavior is available.
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
            <Button aria-label="Open create intent form" onClick={openCreateForm}>
              <Plus data-icon="inline-start" />
              New Intent
            </Button>
          </div>
        </section>

        <Dialog
          open={isFormOpen}
          onOpenChange={(open) => {
            if (!open && !isSubmitting) {
              closeForm()
            }
          }}
        >
          <DialogContent className="max-w-xl border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface))] p-0 text-[hsl(var(--claude-text))]">
            <DialogHeader className="gap-2 border-b border-[hsl(var(--claude-border))] px-6 pb-5 pt-6 text-left">
              <DialogTitle>{editingIntentId ? 'Edit Intent' : 'Create Intent'}</DialogTitle>
              <DialogDescription className="text-[hsl(var(--claude-muted))]">
                Define the routing key and a clear description so operators can scan the
                library quickly.
              </DialogDescription>
            </DialogHeader>

            <div className="px-6 py-5">
              <FieldGroup className="gap-4">
                {formError ? (
                  <Alert variant="destructive" className="px-3 py-2">
                    {formError}
                  </Alert>
                ) : null}

                <Field data-invalid={!!formError}>
                  <FieldLabel htmlFor="intent-code">Intent code</FieldLabel>
                  <Input
                    id="intent-code"
                    aria-label="Intent code"
                    aria-invalid={!!formError}
                    placeholder="e.g. balance_inquiry"
                    value={intentCode}
                    maxLength={80}
                    className="border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface-elevated))] text-[hsl(var(--claude-text))] placeholder:text-[hsl(var(--claude-muted))]"
                    onChange={(event) => {
                      setIntentCode(event.target.value)
                      if (formError) setFormError(null)
                    }}
                  />
                </Field>

                <Field data-invalid={!!formError}>
                  <FieldLabel htmlFor="intent-description">Intent description</FieldLabel>
                  <Textarea
                    id="intent-description"
                    aria-label="Intent description"
                    aria-invalid={!!formError}
                    placeholder="Describe when this intent should be selected"
                    value={description}
                    maxLength={300}
                    className="min-h-28 border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface-elevated))] text-[hsl(var(--claude-text))] placeholder:text-[hsl(var(--claude-muted))]"
                    onChange={(event) => {
                      setDescription(event.target.value)
                      if (formError) setFormError(null)
                    }}
                  />
                  <FieldDescription>
                    Intent code supports letters, numbers, underscores, and hyphens.
                    Description supports up to 300 characters.
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </div>

            <DialogFooter className="gap-2 border-t border-[hsl(var(--claude-border))] px-6 pb-6 pt-4 sm:justify-end">
              <Button variant="outline" onClick={closeForm} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  const body = {
                    intent_code: intentCode.trim(),
                    description: description.trim(),
                  }
                  if (!body.intent_code || !body.description) {
                    setFormError('Both intent code and description are required.')
                    return
                  }
                  if (body.intent_code.length > 80 || body.description.length > 300) {
                    setFormError('Please shorten values to fit the allowed lengths.')
                    return
                  }
                  if (!/^[\p{L}\p{N}_-]+$/u.test(body.intent_code)) {
                    setFormError(
                      'Intent code can only contain letters, numbers, underscores, and hyphens.',
                    )
                    return
                  }

                  try {
                    if (editingIntentId) {
                      await updateMutation.mutateAsync({ intentId: editingIntentId, body })
                    } else {
                      await createMutation.mutateAsync(body)
                    }
                  } catch (error) {
                    setFormError(
                      error instanceof Error ? error.message : 'Failed to save intent.',
                    )
                    return
                  }

                  closeForm()
                  setIntentCode('')
                  setDescription('')
                }}
                disabled={isSubmitting}
              >
                <Save data-icon="inline-start" />
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {intentsQuery.isError || createMutation.isError || updateMutation.isError || deleteMutation.isError ? (
          <Alert variant="destructive">
            {intentsQuery.error?.message ||
              createMutation.error?.message ||
              updateMutation.error?.message ||
              deleteMutation.error?.message}
            <Button
              variant="link"
              size="sm"
              className="ml-2 h-auto p-0 text-destructive"
              onClick={() => {
                void intentsQuery.refetch()
              }}
            >
              Retry
            </Button>
          </Alert>
        ) : null}

        {reindexMutation.isSuccess ? (
          <Alert variant="success">
            {reindexMutation.data.reindexed_count} intents reindexed
          </Alert>
        ) : null}

        <Card className="overflow-hidden border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface))]">
          <CardHeader className="border-b border-[hsl(var(--claude-border))] px-6 pb-5 pt-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-[1.15rem] tracking-tight text-[hsl(var(--claude-text))]">
                  Intent Manifest
                </CardTitle>
                <CardDescription className="max-w-xl text-xs uppercase tracking-[0.08em] text-[hsl(var(--claude-muted))]">
                  Refined routing inventory for model operations
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium">
                <span className="inline-flex items-center rounded-full border border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface-elevated))] px-3 py-1 text-[hsl(var(--claude-text))]">
                  {rows.length} total
                </span>
                <span className="inline-flex items-center rounded-full border border-[hsl(var(--claude-accent)/0.5)] bg-[hsl(var(--claude-accent-soft))] px-3 py-1 text-[hsl(var(--claude-text))]">
                  {activeCount} active
                </span>
                <span className="inline-flex items-center rounded-full border border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface-elevated))] px-3 py-1 text-[hsl(var(--claude-muted))]">
                  {inactiveCount} inactive
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative bg-[hsl(var(--claude-surface))]">
              <Table
                className="bg-[hsl(var(--claude-surface))]"
                containerClassName="rounded-t-none border-[hsl(var(--claude-accent-soft))] bg-[hsl(var(--claude-accent-soft))]"
              >
                <TableHeader>
                  <TableRow className="cursor-default bg-[hsl(var(--claude-accent-soft))] hover:!bg-[hsl(var(--claude-accent-soft))] transition-none">
                    <TableHead className="h-12 px-6 text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--claude-text))]">
                      Intent Code
                    </TableHead>
                    <TableHead className="h-12 text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--claude-text))]">
                      Description
                    </TableHead>
                    <TableHead className="h-12 w-[168px] text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--claude-text))]">
                      Status
                    </TableHead>
                    <TableHead className="h-12 w-[100px] pr-6 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--claude-text))]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell
                        colSpan={4}
                        className="px-6 py-16 text-center text-sm text-[hsl(var(--claude-muted))]"
                      >
                        No intents found. Create a new intent to get started.
                      </TableCell>
                    </TableRow>
                  ) : null}
                  {rows.map((row, index) => (
                    <TableRow
                      key={row.id}
                      className={cn(
                        'group border-b border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface))] transition-colors hover:bg-[hsl(var(--claude-surface-elevated))]',
                        index % 2 === 1 ? 'bg-[hsl(var(--claude-surface-elevated))]' : '',
                        row.status === 'inactive' ? 'opacity-85' : '',
                      )}
                    >
                      <TableCell className="px-6 py-4">
                        <div className="flex min-w-0 flex-col gap-1.5">
                          <span
                            className={cn(
                              'inline-flex max-w-fit items-center rounded-md border px-2.5 py-1 text-[12px] font-semibold tracking-[0.01em]',
                              row.status === 'inactive'
                                ? 'border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface-elevated))] text-[hsl(var(--claude-muted))]'
                                : 'border-[hsl(var(--claude-accent)/0.45)] bg-[hsl(var(--claude-accent-soft))] text-[hsl(var(--claude-text))]',
                            )}
                            title={row.code}
                          >
                            {row.code}
                          </span>
                          <span className="truncate text-[10px] uppercase tracking-[0.12em] text-[hsl(var(--claude-muted))]">
                            Intent #{index + 1} • ID {row.id}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell
                        className={cn(
                          'max-w-[620px] py-4 text-sm leading-relaxed text-[hsl(var(--claude-text))]',
                          row.status === 'inactive' ? 'text-[hsl(var(--claude-muted))]' : '',
                        )}
                        title={row.description}
                      >
                        <span className="block break-words">{row.description}</span>
                      </TableCell>
                      <TableCell className="py-4">
                        <StatusBadge status={row.status} />
                      </TableCell>
                      <TableCell className="py-4 pr-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Open actions for ${row.code}`}
                              className="border border-transparent text-[hsl(var(--claude-text))] transition-colors group-hover:border-[hsl(var(--claude-border))] group-hover:bg-[hsl(var(--claude-surface-elevated))]"
                            >
                              <Ellipsis />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuGroup>
                              <DropdownMenuItem
                                onSelect={(event) => {
                                  event.preventDefault()
                                  setEditingIntentId(row.id)
                                  setIntentCode(row.code)
                                  setDescription(row.description)
                                  setFormError(null)
                                  setIsFormOpen(true)
                                }}
                              >
                                <Edit />
                                Edit intent
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link
                                  to="/intents/$intentId/utterances"
                                  params={{ intentId: row.id }}
                                >
                                  <MessageSquareText />
                                  Manage utterances
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={(event) => {
                                  event.preventDefault()
                                  if (
                                    !window.confirm(
                                      `Delete intent "${row.code}"? This action cannot be undone.`,
                                    )
                                  ) {
                                    return
                                  }
                                  void deleteMutation.mutateAsync(row.id)
                                }}
                                disabled={deleteMutation.isPending}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 />
                                Delete intent
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="border-t border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface-elevated))] px-6 py-3 text-xs text-[hsl(var(--claude-muted))]">
              Showing {rows.length} {rows.length === 1 ? 'intent' : 'intents'} • {activeCount} active • {inactiveCount} inactive
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
