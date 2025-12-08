import { useMemo, useState } from 'react'
import { Eye } from 'lucide-react'

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

type TypeFilter = EntryType | 'ALL'

function formatLocalDate(iso: string): string {
  return new Date(iso).toLocaleDateString()
}

function formatLocalDateTime(iso: string): string {
  return new Date(iso).toLocaleString()
}

function getInitialDates() {
  const { from, to } = getPresetRange('7d')

  return { from, to }
}

function getTypeLabel(type: EntryType, short = false): string {
  switch (type) {
    case 'BP':
      return short ? 'BP' : 'Blood pressure'
    case 'WEIGHT':
      return short ? 'Wt' : 'Weight'
    case 'MED':
      return short ? 'Med' : 'Medication'
    case 'NOTE':
      return short ? 'Note' : 'Note'
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

  const selectClass =
    'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm'

  return (
    <section className="space-y-3">
      {/* Filters row */}
      <div className="flex flex-wrap gap-2">
        <select
          id="preset"
          value={preset}
          onChange={(event) => handlePresetChange(event.target.value as DatePreset | 'custom')}
          className={`${selectClass} flex-1 min-w-[120px]`}
          aria-label="Date range"
        >
          <option value="3d">Last 3 days</option>
          <option value="7d">Last 7 days</option>
          <option value="14d">Last 2 weeks</option>
          <option value="28d">Last 4 weeks</option>
          <option value="3m">Last 3 months</option>
          <option value="12m">Last 12 months</option>
          <option value="custom">Custom</option>
        </select>

        <select
          id="type"
          value={type}
          onChange={(event) => setType(event.target.value as TypeFilter)}
          className={`${selectClass} flex-1 min-w-[120px]`}
          aria-label="Event type"
        >
          <option value="ALL">All types</option>
          <option value="BP">Blood pressure</option>
          <option value="WEIGHT">Weight</option>
          <option value="MED">Medication</option>
          <option value="NOTE">Note</option>
        </select>
      </div>

      {/* Custom date range - only shown when 'custom' is selected */}
      {preset === 'custom' && (
        <div className="flex gap-2">
          <Input
            id="from"
            type="date"
            value={from}
            max={to || undefined}
            onChange={(event) => handleFromChange(event.target.value)}
            className="flex-1"
            aria-label="From date"
          />
          <Input
            id="to"
            type="date"
            value={to}
            min={from || undefined}
            onChange={(event) => handleToChange(event.target.value)}
            className="flex-1"
            aria-label="To date"
          />
        </div>
      )}

      {/* Status messages */}
      {isLoading && <p className="text-sm text-muted-foreground py-4">Loading events…</p>}
      {isError && !isLoading && (
        <p className="text-sm text-destructive py-4">Failed to load events. Please try again.</p>
      )}
      {!isLoading && !isError && entries.length === 0 && (
        <p className="text-sm text-muted-foreground py-4">No events found for this period.</p>
      )}

      {/* Table view */}
      {entries.length > 0 && (
        <div className="border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="border-b">
                <th className="text-left px-3 py-2 font-medium">Date</th>
                <th className="text-left px-3 py-2 font-medium hidden md:table-cell">Type</th>
                <th className="text-left px-3 py-2 font-medium">Summary</th>
                <th className="w-10 px-2 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.sk} className="border-b last:border-b-0 hover:bg-muted/30">
                  <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                    <span className="md:hidden">{formatLocalDate(entry.timestamp)}</span>
                    <span className="hidden md:inline">{formatLocalDateTime(entry.timestamp)}</span>
                  </td>
                  <td className="px-3 py-2 hidden md:table-cell">
                    <span className="text-muted-foreground">{getTypeLabel(entry.type)}</span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="md:hidden text-muted-foreground">[{getTypeLabel(entry.type, true)}]</span>{' '}
                    {getEntrySummary(entry)}
                  </td>
                  <td className="px-2 py-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setSelected(entry)}
                      aria-label="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
