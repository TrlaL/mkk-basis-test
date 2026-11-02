import type { Note, TodoItem } from '~/types/note'

export function createId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function createNote(): Note {
  const now = Date.now()
  return { id: createId(), title: '', todos: [], createdAt: now, updatedAt: now }
}

export function createTodo(): TodoItem {
  return { id: createId(), text: '', done: false }
}

export function cloneNote(note: Note): Note {
  return structuredClone(toRaw(note))
}
