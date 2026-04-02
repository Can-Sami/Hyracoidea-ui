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
        <section className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-2xl">
            <h2 className="text-[clamp(1.6rem,2.4vw,2.15rem)] font-semibold tracking-tight">
              Intent Management
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Add, update, and review the intents your model can route.
              Reindex after changing active intents so new behavior is available.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
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

        <Card className="border-border/70 shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between gap-3 px-6 pb-4 pt-5">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <CardTitle className="text-xl">Library Manifest</CardTitle>
                <Badge variant="outline">{rows.length} total</Badge>
              </div>
              <CardDescription>
                Active intents remain visually prominent, while inactive intents are
                de-emphasized for faster scanning.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge>{activeCount} active</Badge>
              <Badge variant="secondary">{inactiveCount} inactive</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="sticky top-0 bg-card/95 backdrop-blur-sm">
                <TableRow>
                  <TableHead>Intent Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[140px]">Status</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-12 text-center text-muted-foreground">
                      No intents found. Create a new intent to get started.
                    </TableCell>
                  </TableRow>
                ) : null}
                {rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className={cn(
                      row.status === 'inactive' ? 'bg-muted/15 text-muted-foreground' : '',
                    )}
                  >
                    <TableCell>
                      <div className="flex max-w-[260px] flex-col gap-1">
                        <code
                          className={cn(
                            'inline-block truncate rounded-lg bg-secondary px-2.5 py-1 text-xs font-semibold text-primary',
                            row.status === 'inactive' ? 'bg-muted text-muted-foreground' : '',
                          )}
                          title={row.code}
                        >
                          {row.code}
                        </code>
                        <span className="truncate text-xs text-muted-foreground">{row.id}</span>
                      </div>
                    </TableCell>
                    <TableCell
                      className={cn(
                        'max-w-[540px] text-sm leading-relaxed',
                        row.status === 'inactive' ? 'text-muted-foreground' : '',
                      )}
                      title={row.description}
                    >
                      {row.description}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={row.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Open actions for ${row.code}`}
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
            <div className="border-t px-4 py-3 text-xs text-muted-foreground">
              Showing {rows.length} {rows.length === 1 ? 'intent' : 'intents'} •
              {' '}
              {activeCount} active • {inactiveCount} inactive
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
