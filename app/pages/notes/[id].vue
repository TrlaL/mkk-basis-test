<script setup lang="ts">
  definePageMeta({ key: (route) => route.fullPath })

  const route = useRoute()
  const editor = useNoteEditor(String(route.params.id))
  const { draft, isNew, notFound, isDeleted, isDirty, canUndo, canRedo, storedDraft, isDraftOutdated } = editor

  const confirm = useConfirm()
  const toast = useToast()
  const titleInput = useTemplateRef<HTMLInputElement>('titleInput')

  useUndoHotkeys(editor.undo, editor.redo)

  useHead({
    title: () => {
      if (notFound) return 'Заметка не найдена'
      return draft.value.title || (isNew.value ? 'Новая заметка' : 'Без названия')
    },
  })

  const isBlank = computed(() => !draft.value.title.trim() && draft.value.todos.every((todo) => !todo.text.trim()))
  const canSave = computed(() => isDirty.value && !(isNew.value && isBlank.value))

  let isLeaving = false

  function leave(): void {
    isLeaving = true
    navigateTo('/')
  }

  async function onSave(): Promise<void> {
    if (!canSave.value) return

    const wasNew = isNew.value
    const saved = editor.save()
    toast.show(wasNew ? 'Заметка создана' : 'Изменения сохранены')

    if (wasNew) await navigateTo(`/notes/${saved.id}`, { replace: true })
  }

  async function onCancel(): Promise<void> {
    if (isDirty.value) {
      const confirmed = await confirm({
        title: 'Отменить редактирование?',
        message: 'Все несохранённые изменения будут потеряны.',
        confirmText: 'Отменить изменения',
        cancelText: 'Продолжить',
        danger: true,
      })
      if (!confirmed) return
    }

    editor.cancel()
    leave()
  }

  async function onRemove(): Promise<void> {
    const confirmed = await confirm({
      title: 'Удалить заметку?',
      message: 'Заметка и все её пункты будут удалены без возможности восстановления.',
      confirmText: 'Удалить',
      danger: true,
      icon: 'trash',
    })
    if (!confirmed) return

    isLeaving = true
    editor.remove()
    toast.show('Заметка удалена')
    leave()
  }

  onBeforeRouteLeave(async () => {
    if (isLeaving || !isDirty.value) return true

    const confirmed = await confirm({
      title: 'Уйти без сохранения?',
      message: 'Несохранённые изменения будут потеряны.',
      confirmText: 'Уйти',
      cancelText: 'Остаться',
      danger: true,
    })
    if (confirmed) editor.cancel()
    return confirmed
  })

  async function focusTodo(todoId: string | undefined): Promise<void> {
    await nextTick()
    const input = todoId ? document.querySelector<HTMLInputElement>(`[data-todo-id="${todoId}"]`) : null
    ;(input ?? titleInput.value)?.focus()
  }

  function addTodo(index?: number): void {
    focusTodo(editor.addTodo(index))
  }

  function removeTodo(index: number): void {
    const todos = draft.value.todos
    const todo = todos[index]
    if (!todo) return

    const neighbour = todos[index - 1] ?? todos[index + 1]
    editor.removeTodo(todo.id)
    focusTodo(neighbour?.id)
  }

  function onTitleEnter(event: KeyboardEvent): void {
    if (event.isComposing) return
    event.preventDefault()

    const first = draft.value.todos[0]
    if (first) focusTodo(first.id)
    else addTodo()
  }

  onMounted(async () => {
    if (!storedDraft.value) {
      if (isNew.value) titleInput.value?.focus()
      return
    }

    let message = 'В прошлый раз изменения в этой заметке не были сохранены.'
    if (isNew.value) message = 'В прошлый раз вы начали создавать заметку, но не сохранили её.'
    else if (isDraftOutdated.value) message = 'Найдены несохранённые изменения, но заметка с тех пор менялась. При сохранении черновик заменит текущую версию.'

    const confirmed = await confirm({
      title: 'Восстановить черновик?',
      message,
      confirmText: 'Восстановить',
      cancelText: 'Удалить черновик',
      icon: 'restore',
    })

    if (confirmed) editor.restoreDraft()
    else editor.discardDraft()
  })

  watch(isDeleted, async (deleted) => {
    if (!deleted || isLeaving) return

    const confirmed = await confirm({
      title: 'Заметка удалена',
      message: 'Эту заметку удалили в другой вкладке. Можно сохранить её как новую или вернуться к списку.',
      confirmText: 'Сохранить как новую',
      cancelText: 'К списку заметок',
      icon: 'alert',
    })

    if (confirmed) {
      editor.save()
      toast.show('Заметка восстановлена')
    } else {
      editor.cancel()
      leave()
    }
  })

  const b = bem('note-page')
</script>

<template>
  <div :class="b()">
    <div :class="b('toolbar')">
      <div :class="b('toolbar-inner')">
        <NuxtLink to="/" :class="b('back')">
          <UiSvg name="chevron-left" :size="18" />
          Все заметки
        </NuxtLink>

        <template v-if="!notFound">
          <div :class="b('history')" role="group" aria-label="История изменений">
            <UiButton
              variant="ghost"
              icon="undo"
              aria-label="Отменить изменение"
              title="Отменить изменение (Ctrl+Z)"
              :disabled="!canUndo"
              @click="editor.undo()"
            />
            <UiButton
              variant="ghost"
              icon="redo"
              aria-label="Повторить изменение"
              title="Повторить изменение (Ctrl+Shift+Z)"
              :disabled="!canRedo"
              @click="editor.redo()"
            />
          </div>

          <div :class="b('actions')">
            <UiButton v-if="!isNew" variant="danger-ghost" @click="onRemove">Удалить</UiButton>
            <UiButton variant="secondary" @click="onCancel">Отменить</UiButton>
            <UiButton :disabled="!canSave" @click="onSave">Сохранить</UiButton>
          </div>
        </template>
      </div>
    </div>

    <AppContent>
      <EmptyState
        v-if="notFound"
        icon="alert"
        title="Заметка не найдена"
        text="Возможно, её удалили или ссылка указана неверно."
      >
        <UiButton to="/">К списку заметок</UiButton>
      </EmptyState>

      <template v-else>
        <article :class="b('sheet')">
          <input
            ref="titleInput"
            :class="b('title')"
            :value="draft.title"
            type="text"
            placeholder="Без названия"
            aria-label="Название заметки"
            maxlength="200"
            @input="editor.setTitle(($event.target as HTMLInputElement).value)"
            @blur="editor.commitText()"
            @keydown.enter="onTitleEnter"
          >

          <TransitionGroup
            v-if="draft.todos.length"
            tag="ul"
            name="note-page-todo"
            :class="b('todos')"
            aria-label="Список задач"
          >
            <TodoItem
              v-for="(todo, index) in draft.todos"
              :key="todo.id"
              :todo="todo"
              @toggle="editor.toggleTodo(todo.id)"
              @input="editor.setTodoText(todo.id, $event)"
              @commit="editor.commitText()"
              @enter="addTodo(index + 1)"
              @remove="removeTodo(index)"
              @remove-empty="removeTodo(index)"
            />
          </TransitionGroup>

          <button :class="b('add')" type="button" @click="addTodo()">
            <UiSvg name="plus" :size="18" />
            Добавить пункт
          </button>
        </article>

        <p :class="b('hint')">Пустые пункты удаляются при сохранении</p>
      </template>
    </AppContent>
  </div>
</template>

<style lang="scss" scoped>
  .note-page {
    @include page-root;

    &__toolbar {
      background: $color-bg-page;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    &__toolbar-inner {
      align-items: center;
      display: flex;
      flex-wrap: wrap;
      gap: 12px 16px;
      justify-content: space-between;
      margin: 0 auto;
      max-width: $container-width;
      padding: 20px $container-padding;

      @include mobile {
        padding: 12px $container-padding-sm;
      }
    }

    &__back {
      align-items: center;
      border-radius: $radius-sm;
      color: $color-text-secondary;
      display: inline-flex;
      font-weight: 600;
      gap: 6px;
      min-height: 44px;

      &:hover {
        color: $color-text;
      }
    }

    &__history {
      background: $color-bg-surface;
      border: 1px solid $color-border;
      border-radius: $radius-pill;
      display: flex;
      gap: 2px;
      padding: 3px;

      :deep(.ui-button) {
        height: 38px;
        width: 38px;
      }
    }

    &__actions {
      display: flex;
      gap: 8px;
    }

    @include mobile {
      &__actions {
        width: 100%;

        > * {
          flex: 1;
        }
      }
    }

    &__sheet {
      background: $color-bg-surface;
      border: 1px solid $color-border;
      border-radius: $radius-xl;
      margin: 0 auto;
      max-width: $sheet-width;
      padding: 40px 40px 28px;
      width: 100%;

      @include mobile {
        border-radius: $radius-lg;
        padding: 24px 16px 16px;
      }
    }

    &__title {
      background: transparent;
      border: 0;
      border-radius: $radius-sm;
      font-size: 36px;
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1.25;
      padding: 0;
      width: 100%;

      &::placeholder {
        color: $color-text-placeholder;
      }

      &:focus {
        outline: none;
      }

      @include mobile {
        font-size: 28px;
        padding: 0 8px;
      }
    }

    &__todos {
      background: $color-bg-subtle;
      border: 1px solid $color-bg-page;
      border-radius: 18px;
      list-style: none;
      margin: 24px 0 0;
      padding: 6px;
    }

    &__add {
      align-items: center;
      background: none;
      border: 0;
      border-radius: $radius;
      color: $color-text-muted;
      cursor: pointer;
      display: flex;
      font-size: 17px;
      font-weight: 600;
      gap: 14px;
      margin-top: 6px;
      min-height: 52px;
      padding: 0 16px;
      text-align: left;
      transition: background $transition, color $transition;
      width: 100%;

      &:hover {
        background: $color-bg-subtle;
        color: $color-text;
      }
    }

    &__hint {
      color: $color-text-subtle;
      font-size: 13px;
      margin-top: 16px;
      text-align: center;
    }
  }

  .note-page-todo-enter-active,
  .note-page-todo-leave-active {
    transition: opacity 0.15s ease;
  }

  .note-page-todo-enter-from,
  .note-page-todo-leave-to {
    opacity: 0;
  }
</style>
