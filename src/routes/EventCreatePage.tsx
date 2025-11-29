import type { FormEvent } from 'react'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { useCreateEntryMutation } from '@/lib/api/entries'
import { nowLocalForDateTimeInput, localDateTimeInputToUtcIso } from '@/lib/dateTime'
import { loadNoteTagsHistory, saveNoteTagsHistory } from '@/lib/noteTags'
import type { EntryType } from '@/types/entry'
import { entryTypeSchema } from '@/types/entry'
import { NoteTagsField } from '@/components/entries/NoteTagsField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

type SupportedEntryType = EntryType

function getInitialType(raw: string | null): SupportedEntryType {
  const parsed = entryTypeSchema.safeParse(raw)

  if (parsed.success) {
    return parsed.data
  }

  return 'BP'
}

function getTitle(type: SupportedEntryType): string {
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
      return 'New entry'
  }
}

function EventCreatePage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const initialType = getInitialType(searchParams.get('type'))

  const [type, setType] = useState<SupportedEntryType>(initialType)
  const [timestampLocal, setTimestampLocal] = useState(nowLocalForDateTimeInput)

  const [bpSystolic, setBpSystolic] = useState('')
  const [bpDiastolic, setBpDiastolic] = useState('')
  const [bpHeartRate, setBpHeartRate] = useState('')
  const [bpContext, setBpContext] = useState('')

  const [weightValue, setWeightValue] = useState('')
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg')

  const [medName, setMedName] = useState('')
  const [medDosage, setMedDosage] = useState('')
  const [medFrequency, setMedFrequency] = useState('')
  const [medAction, setMedAction] = useState<'PRESCRIBED' | 'STOPPED'>('PRESCRIBED')

  const [noteText, setNoteText] = useState('')
  const [noteTags, setNoteTags] = useState<string[]>([])

  const { mutateAsync, isPending } = useCreateEntryMutation()

  const handleTypeChange = (next: SupportedEntryType) => {
    setType(next)
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('type', next)
    setSearchParams(nextParams)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const timestamp = localDateTimeInputToUtcIso(timestampLocal)

    if (!timestamp) return

    let data: unknown

    if (type === 'BP') {
      data = {
        systolic: Number(bpSystolic),
        diastolic: Number(bpDiastolic),
        heartRate: Number(bpHeartRate),
        context: bpContext || undefined,
      }
    } else if (type === 'WEIGHT') {
      data = {
        value: Number(weightValue),
        unit: weightUnit,
      }
    } else if (type === 'MED') {
      data = {
        name: medName,
        dosage: medDosage,
        frequency: medFrequency,
        action: medAction,
      }
    } else {
      data = {
        text: noteText,
        tags: noteTags,
      }
    }

    await mutateAsync({
      timestamp,
      type,
      // The API helper re-validates per type with Zod
      data: data as never,
    })

    if (type === 'NOTE') {
      const existing = loadNoteTagsHistory()
      const combined = [...existing, ...noteTags]
      saveNoteTagsHistory(combined)
    }

    navigate('/')
  }

  const handleCancel = () => {
    navigate('/')
  }

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{getTitle(type)}</h1>
        <p className="text-sm text-muted-foreground">
          Choose a type and record a single health entry.
        </p>
      </div>

      <Card>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={type === 'BP' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTypeChange('BP')}
            >
              Blood pressure
            </Button>
            <Button
              type="button"
              variant={type === 'WEIGHT' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTypeChange('WEIGHT')}
            >
              Weight
            </Button>
            <Button
              type="button"
              variant={type === 'MED' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTypeChange('MED')}
            >
              Medication
            </Button>
            <Button
              type="button"
              variant={type === 'NOTE' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTypeChange('NOTE')}
            >
              Note
            </Button>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="timestamp" className="text-sm font-medium">
                Date and time
              </label>
              <Input
                id="timestamp"
                type="datetime-local"
                value={timestampLocal}
                onChange={(event) => setTimestampLocal(event.target.value)}
                required
              />
            </div>

            {type === 'BP' && (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1">
                  <label htmlFor="systolic" className="text-sm font-medium">
                    Systolic
                  </label>
                  <Input
                    id="systolic"
                    type="number"
                    inputMode="numeric"
                    min={40}
                    max={300}
                    value={bpSystolic}
                    onChange={(event) => setBpSystolic(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="diastolic" className="text-sm font-medium">
                    Diastolic
                  </label>
                  <Input
                    id="diastolic"
                    type="number"
                    inputMode="numeric"
                    min={20}
                    max={200}
                    value={bpDiastolic}
                    onChange={(event) => setBpDiastolic(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="heartRate" className="text-sm font-medium">
                    Heart rate
                  </label>
                  <Input
                    id="heartRate"
                    type="number"
                    inputMode="numeric"
                    min={20}
                    max={250}
                    value={bpHeartRate}
                    onChange={(event) => setBpHeartRate(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1 md:col-span-3">
                  <label htmlFor="context" className="text-sm font-medium">
                    Context (optional)
                  </label>
                  <Input
                    id="context"
                    type="text"
                    value={bpContext}
                    onChange={(event) => setBpContext(event.target.value)}
                    placeholder="e.g. Right arm, sitting"
                  />
                </div>
              </div>
            )}

            {type === 'WEIGHT' && (
              <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
                <div className="space-y-1">
                  <label htmlFor="weightValue" className="text-sm font-medium">
                    Weight
                  </label>
                  <Input
                    id="weightValue"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    max={1000}
                    step="0.1"
                    value={weightValue}
                    onChange={(event) => setWeightValue(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="weightUnit" className="text-sm font-medium">
                    Unit
                  </label>
                  <select
                    id="weightUnit"
                    value={weightUnit}
                    onChange={(event) => setWeightUnit(event.target.value as 'kg' | 'lb')}
                    className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm"
                  >
                    <option value="kg">kg</option>
                    <option value="lb">lb</option>
                  </select>
                </div>
              </div>
            )}

            {type === 'MED' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="medName" className="text-sm font-medium">
                    Name
                  </label>
                  <Input
                    id="medName"
                    type="text"
                    value={medName}
                    onChange={(event) => setMedName(event.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <label htmlFor="medDosage" className="text-sm font-medium">
                      Dosage
                    </label>
                    <Input
                      id="medDosage"
                      type="text"
                      value={medDosage}
                      onChange={(event) => setMedDosage(event.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="medFrequency" className="text-sm font-medium">
                      Frequency
                    </label>
                    <Input
                      id="medFrequency"
                      type="text"
                      value={medFrequency}
                      onChange={(event) => setMedFrequency(event.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label htmlFor="medAction" className="text-sm font-medium">
                    Action
                  </label>
                  <select
                    id="medAction"
                    value={medAction}
                    onChange={(event) => setMedAction(event.target.value as 'PRESCRIBED' | 'STOPPED')}
                    className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm"
                  >
                    <option value="PRESCRIBED">Prescribed</option>
                    <option value="STOPPED">Stopped</option>
                  </select>
                </div>
              </div>
            )}

            {type === 'NOTE' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="noteText" className="text-sm font-medium">
                    Note
                  </label>
                  <Textarea
                    id="noteText"
                    rows={4}
                    value={noteText}
                    onChange={(event) => setNoteText(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Tags</label>
                  <NoteTagsField value={noteTags} onChange={setNoteTags} />
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Submit'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </section>
  )
}

export default EventCreatePage
