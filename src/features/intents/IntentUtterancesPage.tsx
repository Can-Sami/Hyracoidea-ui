import { useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react'

import { AppHeader } from '@/components/layout/AppHeader'
import { AppSidebar } from '@/components/layout/AppSidebar'
import {
  useCreateUtteranceMutation,
  useDeleteUtteranceMutation,
  useUpdateUtteranceMutation,
  useUtterancesQuery,
} from '@/lib/api/hooks'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export function IntentUtterancesPage() {
  const navigate = useNavigate()
  const { intentId } = useParams({ from: '/intents/$intentId/utterances' })
  const utterancesQuery = useUtterancesQuery(intentId)
  const createMutation = useCreateUtteranceMutation(intentId)
  const updateMutation = useUpdateUtteranceMutation(intentId)
  const deleteMutation = useDeleteUtteranceMutation(intentId)

  const [newText, setNewText] = useState('')
  const [newLanguageCode, setNewLanguageCode] = useState('tr')
  const [newSource, setNewSource] = useState('manual')
  const [createError, setCreateError] = useState<string | null>(null)

  const items = utterancesQuery.data?.items ?? []

  return (
    <div className="min-h-screen bg-[hsl(var(--claude-bg))] text-[hsl(var(--claude-text))]">
      <AppSidebar activePage="intents" />
      <AppHeader />

      <main className="ml-64 flex min-h-screen flex-col gap-10 bg-[hsl(var(--claude-bg))] px-6 pb-12 pt-24 lg:px-10">
        <section className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <h2 className="text-[clamp(1.6rem,2.4vw,2.15rem)] font-semibold tracking-tight text-[hsl(var(--claude-text))]">
              Utterance Management
            </h2>
            <p className="mt-2 text-sm text-[hsl(var(--claude-muted))]">
              Add and edit training phrases for intent <code>{intentId}</code>.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              void navigate({ to: '/intents' })
            }}
          >
              <ArrowLeft data-icon="inline-start" />
              Back to intent list
            </Button>
        </section>

        {(utterancesQuery.isError || createMutation.isError || updateMutation.isError || deleteMutation.isError) ? (
          <Alert variant="destructive">
            {utterancesQuery.error?.message ||
              createMutation.error?.message ||
              updateMutation.error?.message ||
              deleteMutation.error?.message}
          </Alert>
        ) : null}

        <Card className="max-w-4xl border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface))] shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-[hsl(var(--claude-text))]">Add Utterance</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {createError ? (
              <Alert variant="destructive" className="px-3 py-2">
                {createError}
              </Alert>
            ) : null}
            <Textarea
              aria-label="Utterance text"
              placeholder="e.g. I need help resetting my password"
              value={newText}
              maxLength={500}
               className="min-h-28 border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface-elevated))] text-[hsl(var(--claude-text))] placeholder:text-[hsl(var(--claude-muted))]"
              onChange={(event) => {
                setNewText(event.target.value)
                if (createError) setCreateError(null)
              }}
            />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Input
                aria-label="Language code"
                value={newLanguageCode}
                maxLength={12}
                className="border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface-elevated))] text-[hsl(var(--claude-text))] placeholder:text-[hsl(var(--claude-muted))]"
                onChange={(event) => {
                  setNewLanguageCode(event.target.value)
                  if (createError) setCreateError(null)
                }}
                placeholder="tr"
              />
              <Input
                aria-label="Source"
                value={newSource}
                maxLength={60}
                className="border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface-elevated))] text-[hsl(var(--claude-text))] placeholder:text-[hsl(var(--claude-muted))]"
                onChange={(event) => {
                  setNewSource(event.target.value)
                  if (createError) setCreateError(null)
                }}
                placeholder="manual"
              />
            </div>
            <p className="text-xs text-[hsl(var(--claude-muted))]">
              Text: up to 500 characters. Language code: up to 12 characters (example: tr, en-US). Source: up to 60 characters.
            </p>
            <Button
              onClick={async () => {
                const trimmedText = newText.trim()
                const languageCode = newLanguageCode.trim() || 'tr'
                const source = newSource.trim() || 'manual'

                if (!trimmedText) {
                  setCreateError('Utterance text is required.')
                  return
                }
                if (trimmedText.length > 500 || languageCode.length > 12 || source.length > 60) {
                  setCreateError('Please shorten values to fit the allowed lengths.')
                  return
                }
                if (!/^[A-Za-z-]+$/.test(languageCode)) {
                  setCreateError('Language code can only include letters and hyphens (e.g. tr, en-US).')
                  return
                }

                try {
                  await createMutation.mutateAsync({
                    text: trimmedText,
                    language_code: languageCode,
                    source,
                  })
                } catch (error) {
                  setCreateError(
                    error instanceof Error ? error.message : 'Failed to add utterance.',
                  )
                  return
                }
                setNewText('')
                setCreateError(null)
              }}
              disabled={createMutation.isPending}
            >
              <Plus data-icon="inline-start" />
              {createMutation.isPending ? 'Adding utterance...' : 'Add utterance'}
            </Button>
          </CardContent>
        </Card>

        <section className="grid grid-cols-1 gap-5">
          {items.length === 0 && !utterancesQuery.isError ? (
            <Card className="border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface))] shadow-sm">
              <CardContent className="py-10 text-center text-sm text-[hsl(var(--claude-muted))]">
                No utterances yet. Add the first utterance above.
              </CardContent>
            </Card>
          ) : null}
          {items.map((utterance) => (
            <UtteranceCard
              key={utterance.id}
              utteranceId={utterance.id}
              initialText={utterance.text}
              initialLanguageCode={utterance.language_code}
              initialSource={utterance.source}
              onSave={async (body) => {
                await updateMutation.mutateAsync({ utteranceId: utterance.id, body })
              }}
              onDelete={async () => {
                await deleteMutation.mutateAsync(utterance.id)
              }}
              isBusy={updateMutation.isPending || deleteMutation.isPending}
            />
          ))}
        </section>
      </main>
    </div>
  )
}

function UtteranceCard({
  utteranceId,
  initialText,
  initialLanguageCode,
  initialSource,
  onSave,
  onDelete,
  isBusy,
}: {
  utteranceId: string
  initialText: string
  initialLanguageCode: string
  initialSource: string
  onSave: (body: { text: string; language_code: string; source: string }) => Promise<void>
  onDelete: () => Promise<void>
  isBusy: boolean
}) {
  const [text, setText] = useState(initialText)
  const [languageCode, setLanguageCode] = useState(initialLanguageCode)
  const [source, setSource] = useState(initialSource)
  const [cardError, setCardError] = useState<string | null>(null)

  return (
    <Card className="border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface))] shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="text-sm">
          <Badge
            variant="outline"
            className="max-w-full truncate border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface-elevated))] text-[hsl(var(--claude-text))]"
            title={utteranceId}
          >
            {utteranceId}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {cardError ? (
          <Alert variant="destructive" className="px-3 py-2">
            {cardError}
          </Alert>
        ) : null}
        <Textarea
          aria-label={`Utterance text for ${utteranceId}`}
          value={text}
          maxLength={500}
          className="min-h-24 border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface-elevated))] text-[hsl(var(--claude-text))] placeholder:text-[hsl(var(--claude-muted))]"
          onChange={(event) => {
            setText(event.target.value)
            if (cardError) setCardError(null)
          }}
        />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Input
              aria-label={`Language code for ${utteranceId}`}
              value={languageCode}
              maxLength={12}
              className="border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface-elevated))] text-[hsl(var(--claude-text))] placeholder:text-[hsl(var(--claude-muted))]"
              onChange={(event) => {
                setLanguageCode(event.target.value)
                if (cardError) setCardError(null)
            }}
          />
            <Input
              aria-label={`Source for ${utteranceId}`}
              value={source}
              maxLength={60}
              className="border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface-elevated))] text-[hsl(var(--claude-text))] placeholder:text-[hsl(var(--claude-muted))]"
              onChange={(event) => {
                setSource(event.target.value)
                if (cardError) setCardError(null)
            }}
          />
        </div>
        <div className="flex flex-wrap gap-2.5 pt-1">
          <Button
            variant="outline"
            disabled={isBusy}
            onClick={async () => {
              const trimmedText = text.trim()
              const trimmedLanguageCode = languageCode.trim() || 'tr'
              const trimmedSource = source.trim() || 'manual'

              if (!trimmedText) {
                setCardError('Utterance text is required.')
                return
              }
              if (
                trimmedText.length > 500 ||
                trimmedLanguageCode.length > 12 ||
                trimmedSource.length > 60
              ) {
                setCardError('Please shorten values to fit the allowed lengths.')
                return
              }
              if (!/^[A-Za-z-]+$/.test(trimmedLanguageCode)) {
                setCardError('Language code can only include letters and hyphens.')
                return
              }

              try {
                await onSave({
                  text: trimmedText,
                  language_code: trimmedLanguageCode,
                  source: trimmedSource,
                })
              } catch (error) {
                setCardError(
                  error instanceof Error ? error.message : 'Failed to save utterance.',
                )
                return
              }
              setCardError(null)
            }}
          >
            <Save data-icon="inline-start" />
            Save
          </Button>
          <Button
            variant="destructive"
            disabled={isBusy}
            onClick={() => {
              if (!window.confirm('Delete this utterance? This action cannot be undone.')) return
              void onDelete()
            }}
          >
            <Trash2 data-icon="inline-start" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default IntentUtterancesPage
