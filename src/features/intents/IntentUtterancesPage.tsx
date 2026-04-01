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

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar activePage="intents" />
      <AppHeader />

      <main className="ml-64 flex flex-col gap-8 px-10 pb-10 pt-24">
        <section className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Utterance Management</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage utterances for intent <code>{intentId}</code>.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              void navigate({ to: '/intents' })
            }}
          >
            <ArrowLeft data-icon="inline-start" />
            Back to intents
          </Button>
        </section>

        {(utterancesQuery.isError || createMutation.isError || updateMutation.isError || deleteMutation.isError) ? (
          <p className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            {utterancesQuery.error?.message ||
              createMutation.error?.message ||
              updateMutation.error?.message ||
              deleteMutation.error?.message}
          </p>
        ) : null}

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Add Utterance</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Textarea
              aria-label="Utterance text"
              placeholder="Enter utterance text"
              value={newText}
              onChange={(event) => setNewText(event.target.value)}
            />
            <div className="flex flex-wrap gap-3">
              <Input
                aria-label="Language code"
                value={newLanguageCode}
                onChange={(event) => setNewLanguageCode(event.target.value)}
                placeholder="tr"
              />
              <Input
                aria-label="Source"
                value={newSource}
                onChange={(event) => setNewSource(event.target.value)}
                placeholder="manual"
              />
            </div>
            <Button
              onClick={async () => {
                if (!newText.trim()) return
                await createMutation.mutateAsync({
                  text: newText.trim(),
                  language_code: newLanguageCode.trim() || 'tr',
                  source: newSource.trim() || 'manual',
                })
                setNewText('')
              }}
              disabled={createMutation.isPending}
            >
              <Plus data-icon="inline-start" />
              {createMutation.isPending ? 'Adding...' : 'Add utterance'}
            </Button>
          </CardContent>
        </Card>

        <section className="grid grid-cols-1 gap-4">
          {(utterancesQuery.data?.items ?? []).map((utterance) => (
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

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="text-sm">
          <Badge variant="outline">{utteranceId}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Textarea value={text} onChange={(event) => setText(event.target.value)} />
        <div className="flex flex-wrap gap-3">
          <Input value={languageCode} onChange={(event) => setLanguageCode(event.target.value)} />
          <Input value={source} onChange={(event) => setSource(event.target.value)} />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={isBusy}
            onClick={() =>
              onSave({
                text: text.trim(),
                language_code: languageCode.trim() || 'tr',
                source: source.trim() || 'manual',
              })
            }
          >
            <Save data-icon="inline-start" />
            Save
          </Button>
          <Button variant="destructive" disabled={isBusy} onClick={() => onDelete()}>
            <Trash2 data-icon="inline-start" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default IntentUtterancesPage
