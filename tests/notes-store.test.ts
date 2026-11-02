import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import type { Note } from '~/types/note'
import { useNotesStore } from '~/stores/notes'
import { NOTES_STORAGE_KEY, loadDraft, saveDraft } from '~/utils/storage'

function makeNote(id: string, updatedAt = 0): Note {
  return { id, title: `Заметка ${id}`, todos: [], createdAt: 0, updatedAt }
}

function readStorage(): unknown {
  return JSON.parse(localStorage.getItem(NOTES_STORAGE_KEY) ?? 'null')
}

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('загрузка', () => {
  it('читает заметки текущей версии схемы', () => {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify({ version: 1, notes: [makeNote('a')] }))

    const store = useNotesStore()

    expect(store.notes.map((note) => note.id)).toEqual(['a'])
  })

  it('не падает на битом JSON и неизвестной версии', () => {
    localStorage.setItem(NOTES_STORAGE_KEY, '{ не json')
    expect(useNotesStore().notes).toEqual([])

    setActivePinia(createPinia())
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify({ version: 999, notes: [makeNote('a')] }))
    expect(useNotesStore().notes).toEqual([])
  })
})

describe('изменение заметок', () => {
  it('upsert добавляет новую заметку и заменяет существующую', () => {
    const store = useNotesStore()

    store.upsert(makeNote('a'))
    store.upsert({ ...makeNote('a'), title: 'Новое название' })

    expect(store.notes).toHaveLength(1)
    expect(store.getById('a')?.title).toBe('Новое название')
  })

  it('upsert проставляет updatedAt и хранит собственную копию', () => {
    vi.setSystemTime(1000)
    const store = useNotesStore()
    const note = makeNote('a')

    store.upsert(note)
    note.title = 'Изменено снаружи'

    expect(store.getById('a')?.updatedAt).toBe(1000)
    expect(store.getById('a')?.title).toBe('Заметка a')
  })

  it('remove удаляет заметку вместе с черновиком', () => {
    const store = useNotesStore()
    store.upsert(makeNote('a'))
    saveDraft('a', makeNote('a'), 0)

    store.remove('a')

    expect(store.getById('a')).toBeUndefined()
    expect(loadDraft('a')).toBeNull()
  })

  it('sortedNotes — свежие сверху', () => {
    const store = useNotesStore()
    vi.setSystemTime(1)
    store.upsert(makeNote('old'))
    vi.setSystemTime(2)
    store.upsert(makeNote('new'))

    expect(store.sortedNotes.map((note) => note.id)).toEqual(['new', 'old'])
  })
})

describe('синхронизация с localStorage', () => {
  it('пишет не на каждое изменение, а один раз после паузы', async () => {
    const setItem = vi.spyOn(localStorage, 'setItem')
    const store = useNotesStore()

    store.upsert(makeNote('a'))
    await nextTick()
    store.upsert(makeNote('b'))
    await nextTick()
    store.upsert(makeNote('c'))
    await nextTick()

    expect(setItem).not.toHaveBeenCalled()

    vi.advanceTimersByTime(300)

    expect(setItem).toHaveBeenCalledTimes(1)
    expect(readStorage()).toMatchObject({ version: 1, notes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] })
  })

  it('flush записывает отложенные изменения сразу', async () => {
    const store = useNotesStore()

    store.upsert(makeNote('a'))
    await nextTick()
    store.flush()

    expect(readStorage()).toMatchObject({ version: 1, notes: [{ id: 'a' }] })
  })

  it('reload подхватывает данные другой вкладки и не пишет их обратно', async () => {
    const store = useNotesStore()
    const setItem = vi.spyOn(localStorage, 'setItem')
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify({ version: 1, notes: [makeNote('from-tab')] }))
    setItem.mockClear()

    store.reload()
    await nextTick()
    vi.advanceTimersByTime(1000)

    expect(store.notes.map((note) => note.id)).toEqual(['from-tab'])
    expect(setItem).not.toHaveBeenCalled()
  })
})
