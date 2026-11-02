import type { Note, TodoItem } from '~/types/note'

export type NoteCommand =
  | { type: 'title'; from: string; to: string }
  | { type: 'text'; id: string; from: string; to: string }
  | { type: 'toggle'; id: string }
  | { type: 'add'; item: TodoItem; index: number }
  | { type: 'remove'; item: TodoItem; index: number }

export function applyCommand(note: Note, command: NoteCommand, direction: 'undo' | 'redo'): void {
  const isRedo = direction === 'redo'
  const find = (id: string) => note.todos.find((todo) => todo.id === id)
  const insert = (item: TodoItem, index: number) => note.todos.splice(index, 0, { ...item })
  const removeById = (id: string) => (note.todos = note.todos.filter((todo) => todo.id !== id))

  switch (command.type) {
    case 'title':
      note.title = isRedo ? command.to : command.from
      break
    case 'text': {
      const todo = find(command.id)
      if (todo) todo.text = isRedo ? command.to : command.from
      break
    }
    case 'toggle': {
      const todo = find(command.id)
      if (todo) todo.done = !todo.done
      break
    }
    case 'add':
      if (isRedo) insert(command.item, command.index)
      else removeById(command.item.id)
      break
    case 'remove':
      if (isRedo) removeById(command.item.id)
      else insert(command.item, command.index)
      break
  }
}

export function createHistory<T>(limit = 50) {
  const past = shallowRef<T[]>([])
  const future = shallowRef<T[]>([])

  return {
    canUndo: computed(() => past.value.length > 0),
    canRedo: computed(() => future.value.length > 0),

    push(command: T): void {
      past.value = [...past.value, command].slice(-limit)
      future.value = []
    },

    undo(): T | undefined {
      const command = past.value.at(-1)
      if (command === undefined) return
      past.value = past.value.slice(0, -1)
      future.value = [...future.value, command]
      return command
    },

    redo(): T | undefined {
      const command = future.value.at(-1)
      if (command === undefined) return
      future.value = future.value.slice(0, -1)
      past.value = [...past.value, command]
      return command
    },

    clear(): void {
      past.value = []
      future.value = []
    },
  }
}
