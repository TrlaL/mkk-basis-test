import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick } from 'vue'
import type { EffectScope } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { useNotesStore } from '~/stores/notes'
import { useNoteEditor } from '~/composables/useNoteEditor'
import { loadDraft } from '~/utils/storage'

let scope: EffectScope

function setup(id = 'n1') {
  scope = effectScope()
  return scope.run(() => useNoteEditor(id))!
}

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
  vi.useFakeTimers()

  useNotesStore().upsert({
    id: 'n1',
    title: 'Покупки',
    todos: [
      { id: 't1', text: 'Молоко', done: false },
      { id: 't2', text: 'Хлеб', done: false },
    ],
    createdAt: 0,
    updatedAt: 0,
  })
})

afterEach(() => {
  scope?.stop()
  vi.useRealTimers()
})

describe('история: ввод текста', () => {
  it('непрерывный ввод в одно поле — одна запись', () => {
    const editor = setup()

    editor.setTitle('П')
    editor.setTitle('По')
    editor.setTitle('Подарки')
    editor.undo()

    expect(editor.draft.value.title).toBe('Покупки')
    expect(editor.canUndo.value).toBe(false)
  })

  it('пауза ввода фиксирует запись, следующий ввод — новая запись', () => {
    const editor = setup()

    editor.setTitle('Покупки на')
    vi.advanceTimersByTime(800)
    editor.setTitle('Покупки на неделю')

    editor.undo()
    expect(editor.draft.value.title).toBe('Покупки на')
    editor.undo()
    expect(editor.draft.value.title).toBe('Покупки')
  })

  it('blur (commitText) фиксирует ввод сразу', () => {
    const editor = setup()

    editor.setTodoText('t1', 'Молоко 2 л')
    editor.commitText()
    editor.setTodoText('t1', 'Молоко 1 л')

    editor.undo()
    expect(editor.draft.value.todos[0]?.text).toBe('Молоко 2 л')
  })

  it('переход в другое поле фиксирует предыдущее', () => {
    const editor = setup()

    editor.setTodoText('t1', 'Кефир')
    editor.setTodoText('t2', 'Батон')

    editor.undo()
    expect(editor.draft.value.todos[1]?.text).toBe('Хлеб')
    expect(editor.draft.value.todos[0]?.text).toBe('Кефир')

    editor.undo()
    expect(editor.draft.value.todos[0]?.text).toBe('Молоко')
  })

  it('ввод без фактического изменения не попадает в историю', () => {
    const editor = setup()

    editor.setTitle('Покупки!')
    editor.setTitle('Покупки')
    editor.commitText()

    expect(editor.canUndo.value).toBe(false)
  })
})

describe('история: атомарные действия', () => {
  it('отметка, добавление и удаление — отдельные записи', () => {
    const editor = setup()

    editor.toggleTodo('t1')
    const newId = editor.addTodo()
    editor.removeTodo('t2')

    expect(editor.draft.value.todos.map((todo) => todo.id)).toEqual(['t1', newId])

    editor.undo()
    expect(editor.draft.value.todos.map((todo) => todo.id)).toEqual(['t1', 't2', newId])
    editor.undo()
    expect(editor.draft.value.todos.map((todo) => todo.id)).toEqual(['t1', 't2'])
    editor.undo()
    expect(editor.draft.value.todos[0]?.done).toBe(false)
  })

  it('redo повторяет отменённое', () => {
    const editor = setup()

    editor.toggleTodo('t1')
    editor.undo()
    editor.redo()

    expect(editor.draft.value.todos[0]?.done).toBe(true)
  })

  it('новое изменение после undo очищает redo', () => {
    const editor = setup()

    editor.toggleTodo('t1')
    editor.undo()
    editor.toggleTodo('t2')

    expect(editor.canRedo.value).toBe(false)
  })

  it('addTodo с индексом вставляет пункт после текущего', () => {
    const editor = setup()

    const newId = editor.addTodo(1)

    expect(editor.draft.value.todos.map((todo) => todo.id)).toEqual(['t1', newId, 't2'])
  })
})

describe('сессия редактирования', () => {
  it('изменения не попадают в стор до сохранения', () => {
    const editor = setup()

    editor.setTitle('Другое')

    expect(useNotesStore().getById('n1')?.title).toBe('Покупки')
    expect(editor.isDirty.value).toBe(true)
  })

  it('save сохраняет, отбрасывает пустые пункты и сбрасывает историю', () => {
    const editor = setup()

    editor.setTitle('  Продукты  ')
    editor.addTodo()

    editor.save()

    const saved = useNotesStore().getById('n1')
    expect(saved?.title).toBe('Продукты')
    expect(saved?.todos).toHaveLength(2)
    expect(editor.canUndo.value).toBe(false)
    expect(editor.isDirty.value).toBe(false)
  })

  it('cancel возвращает исходную заметку и сбрасывает историю', () => {
    const editor = setup()

    editor.toggleTodo('t1')
    editor.setTitle('Другое')
    editor.cancel()

    expect(editor.draft.value.title).toBe('Покупки')
    expect(editor.draft.value.todos[0]?.done).toBe(false)
    expect(editor.canUndo.value).toBe(false)
  })

  it('новая заметка после сохранения появляется в сторе', () => {
    const editor = setup('new')

    editor.setTitle('Новая')
    const saved = editor.save()

    expect(editor.isNew.value).toBe(false)
    expect(useNotesStore().getById(saved.id)?.title).toBe('Новая')
  })
})

describe('черновик', () => {
  it('сохраняется после паузы, пока есть несохранённые изменения', async () => {
    const editor = setup()

    editor.toggleTodo('t1')
    await nextTick()
    expect(loadDraft('n1')).toBeNull()

    vi.advanceTimersByTime(500)
    expect(loadDraft('n1')?.note.todos[0]?.done).toBe(true)
  })

  it('удаляется после сохранения', async () => {
    const editor = setup()

    editor.toggleTodo('t1')
    await nextTick()
    vi.advanceTimersByTime(500)
    editor.save()
    await nextTick()

    expect(loadDraft('n1')).toBeNull()
  })

  it('предлагается при следующем открытии и восстанавливается', async () => {
    const first = setup()
    first.setTitle('Несохранённое')
    await nextTick()
    vi.advanceTimersByTime(500)
    scope.stop()

    const second = setup()
    expect(second.storedDraft.value).not.toBeNull()

    second.restoreDraft()
    expect(second.draft.value.title).toBe('Несохранённое')
    expect(second.isDirty.value).toBe(true)
  })
})

describe('edge-cases', () => {
  it('несуществующая заметка — notFound', () => {
    const editor = setup('missing')

    expect(editor.notFound).toBe(true)
  })

  it('удаление заметки в другой вкладке — isDeleted, сохранение создаёт её заново', () => {
    const editor = setup()
    const store = useNotesStore()

    store.remove('n1')
    expect(editor.isDeleted.value).toBe(true)

    editor.save()
    expect(store.getById('n1')).toBeDefined()
    expect(editor.isDeleted.value).toBe(false)
  })
})
