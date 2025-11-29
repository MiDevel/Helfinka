const STORAGE_KEY = 'helfinka_note_tags'

const SEEDED_TAGS = [
  'HEADACHE',
  'NAUSEA',
  'DIZZINESS',
  'CHEST_PAIN',
  'SHORTNESS_OF_BREATH',
  'FATIGUE',
  'FEVER',
  'COUGH',
  'GI_ISSUE',
  'INSOMNIA',
  'LOW_MOOD',
  'ANXIETY',
  'STRESS',
  'ALLERGY',
  'EXERCISE',
  'DIET',
  'MEDICATION_SIDE_EFFECT',
]

export function loadNoteTagsHistory(): string[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)

    if (!raw) return []

    const parsed = JSON.parse(raw) as unknown

    if (!Array.isArray(parsed)) return []

    return parsed
      .map((value) => (typeof value === 'string' ? value.trim().toUpperCase() : null))
      .filter((value): value is string => Boolean(value))
  } catch {
    return []
  }
}

export function saveNoteTagsHistory(tags: string[]): void {
  if (typeof window === 'undefined') return

  try {
    const normalized = tags
      .map((value) => value.trim().toUpperCase())
      .filter((value) => value.length > 0)

    const unique = Array.from(new Set(normalized))

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(unique))
  } catch {
    // Ignore storage errors
  }
}

export function getSuggestedTags(selected: string[]): string[] {
  const history = loadNoteTagsHistory()
  const selectedSet = new Set(selected.map((value) => value.trim().toUpperCase()))

  const combined = [...history, ...SEEDED_TAGS]

  const result: string[] = []

  for (const tag of combined) {
    const normalized = tag.trim().toUpperCase()

    if (!normalized || selectedSet.has(normalized)) continue

    if (!result.includes(normalized)) {
      result.push(normalized)
    }
  }

  return result
}
