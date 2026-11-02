import type { Note } from '~/types/note'
import type { NoteCommand } from '~/utils/history'

const snapshot = (note?: Note) => JSON.stringify({ title: note?.title ?? '', todos: note?.todos ?? [] })

export function useNoteEditor(id: string) {
  const store = useNotesStore()
  const draftId = id

  const noteId = ref<string | null>(id === 'new' ? null : id)
  const isNew = computed(() => noteId.value === null)

  const original = computed(() => (noteId.value ? store.getById(noteId.value) : undefined))
  const notFound = !isNew.value && !original.value
  const isDeleted = computed(() => !isNew.value && !notFound && !original.value)

  const draft = ref<Note>(original.value ? cloneNote(original.value) : createNote())
  const history = createHistory<NoteCommand>()
  const isDirty = computed(() => snapshot(draft.value) !== snapshot(original.value))

  function run(command: NoteCommand): void {
    commitText()
    applyCommand(draft.value, command, 'redo')
    history.push(command)
  }

  function toggleTodo(todoId: string): void {
    run({ type: 'toggle', id: todoId })
  }

  function addTodo(index = draft.value.todos.length): string {
    const item = createTodo()
    run({ type: 'add', item, index })
    return item.id
  }

  function removeTodo(todoId: string): void {
    const index = draft.value.todos.findIndex((todo) => todo.id === todoId)
    const todo = draft.value.todos[index]
    if (todo) run({ type: 'remove', item: { ...todo }, index })
  }

  let pending: { todoId: string | null; from: string } | null = null
  const commitLater = debounce(commitText, 800)

  function getText(todoId: string | null): string | undefined {
    if (todoId === null) return draft.value.title
    return draft.value.todos.find((todo) => todo.id === todoId)?.text
  }

  function editText(todoId: string | null, value: string): void {
    if (pending && pending.todoId !== todoId) commitText()
    if (!pending) pending = { todoId, from: getText(todoId) ?? '' }

    if (todoId === null) draft.value.title = value
    else {
      const todo = draft.value.todos.find((item) => item.id === todoId)
      if (todo) todo.text = value
    }

    commitLater()
  }

  function commitText(): void {
    commitLater.cancel()
    if (!pending) return

    const { todoId, from } = pending
    const to = getText(todoId)
    pending = null

    if (to === undefined || to === from) return
    history.push(todoId === null ? { type: 'title', from, to } : { type: 'text', id: todoId, from, to })
  }

  const setTitle = (value: string) => editText(null, value)
  const setTodoText = (todoId: string, value: string) => editText(todoId, value)

  function undo(): void {
    commitText()
    const command = history.undo()
    if (command) applyCommand(draft.value, command, 'undo')
  }

  function redo(): void {
    commitText()
    const command = history.redo()
    if (command) applyCommand(draft.value, command, 'redo')
  }

  const saveDraftLater = debounce(() => saveDraft(draftId, draft.value, original.value?.updatedAt ?? null), 500)

  watch(draft, () => {
    if (isDirty.value) saveDraftLater()
    else {
      saveDraftLater.cancel()
      removeDraft(draftId)
    }
  }, { deep: true })

  const storedDraft = ref(notFound ? null : loadDraft(draftId))
  const isDraftOutdated = computed(() => storedDraft.value?.baseUpdatedAt !== (original.value?.updatedAt ?? null))

  function restoreDraft(): void {
    if (!storedDraft.value) return
    draft.value = storedDraft.value.note
    storedDraft.value = null
    history.clear()
  }

  function discardDraft(): void {
    storedDraft.value = null
    removeDraft(draftId)
  }

  function dropDraft(): void {
    pending = null
    commitLater.cancel()
    saveDraftLater.cancel()
    removeDraft(draftId)
  }

  const flushDraft = () => saveDraftLater.flush()
  window.addEventListener('pagehide', flushDraft)
  onScopeDispose(() => {
    window.removeEventListener('pagehide', flushDraft)
    commitLater.cancel()
    flushDraft()
  })

  function save(): Note {
    commitText()
    const note = cloneNote(draft.value)
    note.title = note.title.trim()
    note.todos = note.todos.filter((todo) => todo.text.trim() !== '')
    const saved = store.upsert(note)
    dropDraft()
    noteId.value = saved.id
    draft.value = cloneNote(saved)
    history.clear()
    return saved
  }

  function cancel(): void {
    dropDraft()
    draft.value = original.value ? cloneNote(original.value) : createNote()
    history.clear()
  }

  function remove(): void {
    dropDraft()
    store.remove(draft.value.id)
  }

  return {
    draft: readonly(draft),
    isNew,
    notFound,
    isDeleted,
    isDirty,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    storedDraft: readonly(storedDraft),
    isDraftOutdated,

    setTitle,
    setTodoText,
    commitText,
    toggleTodo,
    addTodo,
    removeTodo,
    undo,
    redo,
    save,
    cancel,
    remove,
    restoreDraft,
    discardDraft,
  }
}
