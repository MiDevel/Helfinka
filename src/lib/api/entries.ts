import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api/client'
import {
  bpDataSchema,
  entryTypeSchema,
  medDataSchema,
  noteDataSchema,
  parseEntryItem,
  type EntryType,
  type HealthEntry,
  type RawEntryItem,
  type BpData,
  type MedData,
  type NoteData,
  type WeightData,
  weightDataSchema,
} from '@/types/entry'

interface CreateEntryBase {
  timestamp: string
  type: EntryType
}

export type CreateEntryInput =
  | (CreateEntryBase & { type: 'BP'; data: BpData })
  | (CreateEntryBase & { type: 'WEIGHT'; data: WeightData })
  | (CreateEntryBase & { type: 'MED'; data: MedData })
  | (CreateEntryBase & { type: 'NOTE'; data: NoteData })

interface EntriesResponse {
  items: RawEntryItem[]
}

function mapItems(response: EntriesResponse): HealthEntry[] {
  return response.items
    .map((item) => parseEntryItem(item))
    .filter((item): item is HealthEntry => item !== null)
}

export async function createEntry(payload: CreateEntryInput): Promise<void> {
  let data: unknown

  switch (payload.type) {
    case 'BP':
      data = bpDataSchema.parse(payload.data)
      break
    case 'WEIGHT':
      data = weightDataSchema.parse(payload.data)
      break
    case 'MED':
      data = medDataSchema.parse(payload.data)
      break
    case 'NOTE':
      data = noteDataSchema.parse(payload.data)
      break
    default:
      throw new Error('Unsupported entry type')
  }

  const body = {
    timestamp: payload.timestamp,
    type: payload.type,
    data,
  }

  await api.post('/helfinka/entries', body)
}

export async function getEntries(params: {
  from: string
  to: string
}): Promise<HealthEntry[]> {
  const response = await api.get<EntriesResponse>('/helfinka/entries', {
    params,
  })

  return mapItems(response.data)
}

export async function getEntriesByType(params: {
  type: EntryType
  from: string
  to: string
}): Promise<HealthEntry[]> {
  const parsedType = entryTypeSchema.parse(params.type)

  const response = await api.get<EntriesResponse>(`/helfinka/stats/${parsedType}`, {
    params: { from: params.from, to: params.to },
  })

  return mapItems(response.data)
}

export async function deleteEntry(params: {
  timestamp: string
  type: EntryType
}): Promise<void> {
  await api.delete('/helfinka/entries', {
    params,
  })
}

export function useCreateEntryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createEntry,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['entries'] })
    },
  })
}

export function useEntriesQuery(options: {
  type: EntryType | 'ALL'
  from: string
  to: string
}) {
  const { type, from, to } = options

  return useQuery({
    queryKey: ['entries', { type, from, to }],
    queryFn: async () => {
      if (type === 'ALL') {
        return getEntries({ from, to })
      }

      return getEntriesByType({ type, from, to })
    },
    enabled: Boolean(from && to),
  })
}

export function useDeleteEntryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteEntry,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['entries'] })
    },
  })
}
