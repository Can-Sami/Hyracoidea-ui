import { useState } from 'react'
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
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.08em]',
        isActive
          ? 'border-emerald-300/70 bg-emerald-100/70 text-emerald-900 dark:border-emerald-700/70 dark:bg-emerald-900/35 dark:text-emerald-200'
          : 'border-border/70 bg-muted/70 text-muted-foreground',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'size-1.5 rounded-full',
          isActive ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-muted-foreground/70',
        )}
      />
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
    <div className="min-h-screen bg-background">
      <AppSidebar activePage="intents" />

      <AppHeader />

      <main className="ml-64 flex flex-col gap-10 px-6 pb-12 pt-24 lg:px-10">
        <section className="flex flex-wrap items-end justify-between gap-5 border-b border-border/70 pb-7">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/75">
              Intent Library
            </p>
            <h2 className="mt-1 text-[clamp(1.75rem,2.5vw,2.3rem)] font-semibold tracking-tight">
              Intent Management
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Add, update, and review the intents your model can route.
              Reindex after changing active intents so new behavior is available.
            </p>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl border border-primary/15 bg-gradient-to-r from-primary/[0.04] to-accent/[0.08] p-2 shadow-sm">
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
          <DialogContent className="max-w-xl rounded-2xl border-border/70 bg-card p-0 shadow-[0_14px_44px_-28px_hsl(var(--foreground)/0.45)]">
            <DialogHeader className="gap-2 border-b border-border/60 px-6 pb-5 pt-6 text-left">
              <DialogTitle>{editingIntentId ? 'Edit Intent' : 'Create Intent'}</DialogTitle>
              <DialogDescription>
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
                    className="min-h-28"
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

            <DialogFooter className="gap-2 border-t border-border/60 px-6 pb-6 pt-4 sm:justify-end">
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

        <Card className="overflow-hidden border-border/70 bg-gradient-to-b from-accent/[0.08] via-card to-card shadow-[0_14px_36px_-30px_hsl(var(--foreground)/0.55)]">
          <CardHeader className="border-b border-primary/10 px-6 pb-5 pt-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-[1.15rem] tracking-tight text-foreground/95">
                  Intent Manifest
                </CardTitle>
                <CardDescription className="max-w-xl text-xs uppercase tracking-[0.08em] text-primary/70">
                  Refined routing inventory for model operations
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium">
                <span className="inline-flex items-center rounded-full border border-primary/15 bg-background/90 px-3 py-1 text-foreground/85">
                  {rows.length} total
                </span>
                <span className="inline-flex items-center rounded-full border border-emerald-300/70 bg-emerald-100/70 px-3 py-1 text-emerald-900 dark:border-emerald-700/70 dark:bg-emerald-900/35 dark:text-emerald-200">
                  {activeCount} active
                </span>
                <span className="inline-flex items-center rounded-full border border-accent/35 bg-accent/35 px-3 py-1 text-accent-foreground/75">
                  {inactiveCount} inactive
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-primary/[0.08] via-primary/[0.03] to-transparent" />
              <Table>
                <TableHeader>
                  <TableRow className="bg-transparent hover:bg-transparent">
                    <TableHead className="sticky top-0 z-10 h-12 px-6 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary/75 backdrop-blur supports-[backdrop-filter]:bg-card/88">
                      Intent Code
                    </TableHead>
                    <TableHead className="sticky top-0 z-10 h-12 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary/75 backdrop-blur supports-[backdrop-filter]:bg-card/88">
                      Description
                    </TableHead>
                    <TableHead className="sticky top-0 z-10 h-12 w-[168px] text-[10px] font-semibold uppercase tracking-[0.14em] text-primary/75 backdrop-blur supports-[backdrop-filter]:bg-card/88">
                      Status
                    </TableHead>
                    <TableHead className="sticky top-0 z-10 h-12 w-[100px] pr-6 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-primary/75 backdrop-blur supports-[backdrop-filter]:bg-card/88">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell
                        colSpan={4}
                        className="px-6 py-16 text-center text-sm text-muted-foreground"
                      >
                        No intents found. Create a new intent to get started.
                      </TableCell>
                    </TableRow>
                  ) : null}
                  {rows.map((row, index) => (
                    <TableRow
                      key={row.id}
                      className={cn(
                        'group border-b border-border/55 bg-transparent transition-all hover:bg-gradient-to-r hover:from-primary/[0.05] hover:to-accent/[0.05]',
                        index % 2 === 1 ? 'bg-secondary/[0.18]' : '',
                        row.status === 'inactive' ? 'opacity-85' : '',
                      )}
                    >
                      <TableCell className="px-6 py-4">
                        <div className="flex max-w-[300px] items-start gap-3">
                          <span
                            aria-hidden
                            className={cn(
                              'mt-2 size-2 rounded-full ring-4 ring-background',
                              row.status === 'active' ? 'bg-emerald-500' : 'bg-muted-foreground/60',
                            )}
                          />
                          <div className="flex min-w-0 flex-col gap-1.5">
                            <span
                              className={cn(
                                'inline-flex max-w-fit items-center rounded-md border px-2.5 py-1 text-[12px] font-semibold tracking-[0.01em] shadow-sm',
                                row.status === 'inactive'
                                  ? 'border-accent/35 bg-accent/25 text-accent-foreground/80'
                                  : 'border-primary/25 bg-primary/[0.12] text-primary/95',
                              )}
                              title={row.code}
                            >
                              {row.code}
                            </span>
                            <span className="truncate text-[10px] uppercase tracking-[0.12em] text-muted-foreground/85">
                              Intent #{index + 1} • ID {row.id}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell
                        className={cn(
                          'max-w-[620px] py-4 text-sm leading-relaxed text-foreground/92',
                          row.status === 'inactive' ? 'text-muted-foreground' : '',
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
                              className="border border-transparent transition-all group-hover:border-border/70 group-hover:bg-card"
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
                                <a href={`/intents/${row.id}/utterances`}>
                                  <MessageSquareText />
                                  Manage utterances
                                </a>
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
            <div className="border-t border-primary/10 bg-gradient-to-r from-primary/[0.05] via-accent/[0.05] to-primary/[0.03] px-6 py-3 text-xs text-muted-foreground">
              Showing {rows.length} {rows.length === 1 ? 'intent' : 'intents'} • {activeCount} active • {inactiveCount} inactive
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
