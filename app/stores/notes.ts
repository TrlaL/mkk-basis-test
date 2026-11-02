import type { Note } from '~/types/note'

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<Note[]>(loadNotes())

  const sortedNotes = computed(() => [...notes.value].sort((a, b) => b.updatedAt - a.updatedAt))

  function getById(id: string): Note | undefined {
    return notes.value.find((note) => note.id === id)
  }

  function upsert(note: Note): Note {
    const saved: Note = { ...structuredClone(toRaw(note)), updatedAt: Date.now() }
    const index = notes.value.findIndex((item) => item.id === note.id)

    if (index === -1) notes.value.push(saved)
    else notes.value[index] = saved

    return saved
  }

  function remove(id: string): void {
    notes.value = notes.value.filter((note) => note.id !== id)
    removeDraft(id)
  }

  const persist = debounce(() => saveNotes(notes.value), 300)
  let skipPersist = false

  watch(notes, () => {
    if (skipPersist) {
      skipPersist = false
      return
    }
    persist()
  }, { deep: true })

  function reload(): void {
    persist.cancel()
    skipPersist = true
    notes.value = loadNotes()
  }

  return {
    notes,
    sortedNotes,
    getById,
    upsert,
    remove,
    reload,
    flush: persist.flush,
  }
})
