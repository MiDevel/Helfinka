import { z } from 'zod'

export const entryTypeSchema = z.enum(['BP', 'WEIGHT', 'MED', 'NOTE'])

export type EntryType = z.infer<typeof entryTypeSchema>

export const bpDataSchema = z.object({
  systolic: z.number().int().min(40).max(300),
  diastolic: z.number().int().min(20).max(200),
  heartRate: z.number().int().min(20).max(250),
  context: z.string().trim().max(200).optional().nullable(),
})

export type BpData = z.infer<typeof bpDataSchema>

export const weightUnitSchema = z.enum(['kg', 'lb'])

export type WeightUnit = z.infer<typeof weightUnitSchema>

export const weightDataSchema = z.object({
  value: z.number().min(0).max(1000),
  unit: weightUnitSchema.default('kg'),
})

export type WeightData = z.infer<typeof weightDataSchema>

export const medActionSchema = z.enum(['PRESCRIBED', 'STOPPED'])

export type MedAction = z.infer<typeof medActionSchema>

export const medDataSchema = z.object({
  name: z.string().trim().min(1).max(200),
  dosage: z.string().trim().min(1).max(100),
  frequency: z.string().trim().min(1).max(200),
  action: medActionSchema,
})

export type MedData = z.infer<typeof medDataSchema>

export const noteDataSchema = z.object({
  text: z.string().trim().min(1),
  tags: z.array(z.string().trim().min(1)).default([]),
})

export type NoteData = z.infer<typeof noteDataSchema>

const baseEntryItemSchema = z.object({
  PK: z.string(),
  SK: z.string(),
  Type: entryTypeSchema,
  Data: z.unknown(),
})

export type RawEntryItem = z.infer<typeof baseEntryItemSchema>

export interface BaseEntry {
  pk: string
  sk: string
  type: EntryType
  timestamp: string // ISO UTC
}

export type HealthEntry =
  | (BaseEntry & { type: 'BP'; data: BpData })
  | (BaseEntry & { type: 'WEIGHT'; data: WeightData })
  | (BaseEntry & { type: 'MED'; data: MedData })
  | (BaseEntry & { type: 'NOTE'; data: NoteData })

function parseSk(sk: string): { timestamp: string; type: EntryType } | null {
  const parts = sk.split('#')

  if (parts.length < 3) return null

  const [prefix, timestamp, type] = parts

  if (!prefix.startsWith('HELF')) return null

  if (!timestamp || !type) return null

  if (!entryTypeSchema.options.includes(type as EntryType)) return null

  return { timestamp, type: type as EntryType }
}

export function parseEntryItem(raw: RawEntryItem): HealthEntry | null {
  const base = baseEntryItemSchema.safeParse(raw)

  if (!base.success) return null

  const parsedSk = parseSk(base.data.SK)

  if (!parsedSk) return null

  const common: BaseEntry = {
    pk: base.data.PK,
    sk: base.data.SK,
    type: parsedSk.type,
    timestamp: parsedSk.timestamp,
  }

  switch (parsedSk.type) {
    case 'BP': {
      const result = bpDataSchema.safeParse(base.data.Data)
      if (!result.success) return null
      return { ...common, type: 'BP', data: result.data }
    }
    case 'WEIGHT': {
      const result = weightDataSchema.safeParse(base.data.Data)
      if (!result.success) return null
      return { ...common, type: 'WEIGHT', data: result.data }
    }
    case 'MED': {
      const result = medDataSchema.safeParse(base.data.Data)
      if (!result.success) return null
      return { ...common, type: 'MED', data: result.data }
    }
    case 'NOTE': {
      const result = noteDataSchema.safeParse(base.data.Data)
      if (!result.success) return null
      return { ...common, type: 'NOTE', data: result.data }
    }
    default:
      return null
  }
}
