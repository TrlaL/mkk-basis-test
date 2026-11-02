import type { Note } from '~/types/note'

const SCHEMA_VERSION = 1
const DRAFT_PREFIX = 'notes:draft:'

export const NOTES_STORAGE_KEY = 'notes:data'

interface StoredData {
  version: number
  notes: Note[]
}

export interface StoredDraft {
  version: number
  note: Note
  baseUpdatedAt: number | null
}

const draftKey = (id: string) => `${DRAFT_PREFIX}${id}`

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Не удалось записать ${key}`, error)
  }
}

function migrate(data: StoredData): StoredData | null {
  if (data.version === SCHEMA_VERSION && Array.isArray(data.notes)) return data
  return null
}

export function loadNotes(): Note[] {
  const data = read<StoredData>(NOTES_STORAGE_KEY)
  return (data && migrate(data))?.notes ?? []
}

export function saveNotes(notes: Note[]): void {
  write(NOTES_STORAGE_KEY, { version: SCHEMA_VERSION, notes } satisfies StoredData)
}

export function loadDraft(id: string): StoredDraft | null {
  const draft = read<StoredDraft>(draftKey(id))
  return draft?.version === SCHEMA_VERSION ? draft : null
}

export function saveDraft(id: string, note: Note, baseUpdatedAt: number | null): void {
  write(draftKey(id), { version: SCHEMA_VERSION, note, baseUpdatedAt } satisfies StoredDraft)
}

export function removeDraft(id: string): void {
  try {
    localStorage.removeItem(draftKey(id))
  } catch {}
}
