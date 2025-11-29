import { useMemo, useState } from 'react'

import { useDeleteEntryMutation, useEntriesQuery } from '@/lib/api/entries'
import {
  getPresetRange,
  localDateToUtcEndOfDayIso,
  localDateToUtcStartOfDayIso,
  type DatePreset,
} from '@/lib/dateTime'
import type { EntryType, HealthEntry } from '@/types/entry'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

type TypeFilter = EntryType | 'ALL'

function formatLocalDateTime(iso: string): string {
  const date = new Date(iso)

  return date.toLocaleString()
}

function getInitialDates() {
  const { from, to } = getPresetRange('7d')

  return { from, to }
}

function getTypeLabel(type: EntryType): string {
  switch (type) {
    case 'BP':
      return 'Blood pressure'
    case 'WEIGHT':
      return 'Weight'
    case 'MED':
      return 'Medication'
    case 'NOTE':
      return 'Note'
    default:
      return type
  }
}

function getEntrySummary(entry: HealthEntry): string {
  switch (entry.type) {
    case 'BP': {
      const { systolic, diastolic, heartRate } = entry.data
      return `${systolic}/${diastolic} (${heartRate} bpm)`
    }
    case 'WEIGHT': {
      const { value, unit } = entry.data
      return `${value} ${unit}`
    }
    case 'MED': {
      const { name, dosage, action } = entry.data
      return `${name} – ${dosage} (${action})`
    }
    case 'NOTE': {
      const text = entry.data.text
      if (text.length <= 60) return text
      return `${text.slice(0, 57)}...`
    }
    default:
      return ''
  }
}

function EventsListPage() {
  const [type, setType] = useState<TypeFilter>('ALL')
  const [{ from, to }, setDates] = useState(getInitialDates)
  const [preset, setPreset] = useState<DatePreset | 'custom'>('7d')
  const [selected, setSelected] = useState<HealthEntry | null>(null)

  const fromUtc = from ? localDateToUtcStartOfDayIso(from) : ''
  const toUtc = to ? localDateToUtcEndOfDayIso(to) : ''

  const { data, isLoading, isError } = useEntriesQuery({
    type,
    from: fromUtc,
    to: toUtc,
  })

  const entries = useMemo(() => data ?? [], [data])

  const { mutateAsync: deleteEntry, isPending: isDeleting } = useDeleteEntryMutation()

  const handlePresetChange = (next: DatePreset | 'custom') => {
    setPreset(next)

    if (next !== 'custom') {
      const range = getPresetRange(next)
      setDates(range)
    }
  }

  const handleFromChange = (value: string) => {
    setPreset('custom')
    setDates((current) => ({ ...current, from: value }))
  }

  const handleToChange = (value: string) => {
    setPreset('custom')
    setDates((current) => ({ ...current, to: value }))
  }

  const handleDeleteConfirmed = async () => {
    if (!selected) return

    // eslint-disable-next-line no-alert
    const ok = window.confirm('Delete this entry? This cannot be undone.')

    if (!ok) return

    await deleteEntry({ timestamp: selected.timestamp, type: selected.type })
    setSelected(null)
  }

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
        <p className="text-sm text-muted-foreground">
          Filter your health diary by type and date range, then view or delete individual entries.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Filters</CardTitle>
          <CardDescription>Select the type and time period you want to review.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
            <div className="space-y-1">
              <label htmlFor="type" className="text-sm font-medium">
                Type
              </label>
              <select
                id="type"
                value={type}
                onChange={(event) => setType(event.target.value as TypeFilter)}
                className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm"
              >
                <option value="ALL">All</option>
                <option value="BP">Blood pressure</option>
                <option value="WEIGHT">Weight</option>
                <option value="MED">Medication</option>
                <option value="NOTE">Note</option>
              </select>
            </div>

            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
              <div className="space-y-1">
                <label htmlFor="from" className="text-sm font-medium">
                  From
                </label>
                <Input
                  id="from"
                  type="date"
                  value={from}
                  max={to || undefined}
                  onChange={(event) => handleFromChange(event.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="to" className="text-sm font-medium">
                  To
                </label>
                <Input
                  id="to"
                  type="date"
                  value={to}
                  min={from || undefined}
                  onChange={(event) => handleToChange(event.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="preset" className="text-sm font-medium">
                  Quick range
                </label>
                <select
                  id="preset"
                  value={preset}
                  onChange={(event) => handlePresetChange(event.target.value as DatePreset | 'custom')}
                  className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm"
                >
                  <option value="3d">Last 3 days</option>
                  <option value="7d">Last 7 days</option>
                  <option value="14d">Last 2 weeks</option>
                  <option value="28d">Last 4 weeks</option>
                  <option value="3m">Last 3 months</option>
                  <option value="12m">Last 12 months</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {isLoading && <p className="text-sm text-muted-foreground">Loading events…</p>}
        {isError && !isLoading && (
          <p className="text-sm text-destructive">Failed to load events. Please try again.</p>
        )}

        {!isLoading && !isError && entries.length === 0 && (
          <p className="text-sm text-muted-foreground">No events found for this period.</p>
        )}

        {entries.length > 0 && (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {entries.map((entry) => (
              <Card key={entry.sk} className="flex flex-col justify-between">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-sm font-semibold flex items-center justify-between gap-2">
                    <span>{getTypeLabel(entry.type)}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatLocalDateTime(entry.timestamp)}
                    </span>
                  </CardTitle>
                  <CardDescription>{getEntrySummary(entry)}</CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-end px-6 pb-4">
                  <Button type="button" variant="outline" size="sm" onClick={() => setSelected(entry)}>
                    View
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{getTypeLabel(selected.type)}</DialogTitle>
                <DialogDescription>
                  {formatLocalDateTime(selected.timestamp)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2 text-sm">
                {selected.type === 'BP' && (
                  <>
                    <p>
                      <span className="font-medium">Systolic:</span> {selected.data.systolic}
                    </p>
                    <p>
                      <span className="font-medium">Diastolic:</span> {selected.data.diastolic}
                    </p>
                    <p>
                      <span className="font-medium">Heart rate:</span> {selected.data.heartRate} bpm
                    </p>
                    {selected.data.context && (
                      <p>
                        <span className="font-medium">Context:</span> {selected.data.context}
                      </p>
                    )}
                  </>
                )}

                {selected.type === 'WEIGHT' && (
                  <p>
                    <span className="font-medium">Weight:</span> {selected.data.value} {selected.data.unit}
                  </p>
                )}

                {selected.type === 'MED' && (
                  <>
                    <p>
                      <span className="font-medium">Name:</span> {selected.data.name}
                    </p>
                    <p>
                      <span className="font-medium">Dosage:</span> {selected.data.dosage}
                    </p>
                    <p>
                      <span className="font-medium">Frequency:</span> {selected.data.frequency}
                    </p>
                    <p>
                      <span className="font-medium">Action:</span> {selected.data.action}
                    </p>
                  </>
                )}

                {selected.type === 'NOTE' && (
                  <>
                    <p className="whitespace-pre-wrap">{selected.data.text}</p>
                    {selected.data.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {selected.data.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-secondary text-secondary-foreground inline-flex items-center rounded-full px-2 py-0.5 text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setSelected(null)} disabled={isDeleting}>
                  Close
                </Button>
                <Button type="button" variant="destructive" onClick={handleDeleteConfirmed} disabled={isDeleting}>
                  {isDeleting ? 'Deleting…' : 'Delete entry'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}

export default EventsListPage
