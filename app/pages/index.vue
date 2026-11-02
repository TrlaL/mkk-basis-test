<script setup lang="ts">
  import type { Note } from '~/types/note'

  useHead({ title: 'Заметки' })

  const store = useNotesStore()
  const confirm = useConfirm()
  const toast = useToast()

  async function onDelete(note: Note): Promise<void> {
    const confirmed = await confirm({
      title: 'Удалить заметку?',
      message: `«${note.title || 'Без названия'}» и все её пункты будут удалены без возможности восстановления.`,
      confirmText: 'Удалить',
      danger: true,
      icon: 'trash',
    })
    if (!confirmed) return

    store.remove(note.id)
    toast.show('Заметка удалена')
  }

  const b = bem('notes-page')
</script>

<template>
  <AppContent>
    <div :class="b('heading')">
      <h1 :class="b('title')">Заметки</h1>
      <UiButton to="/notes/new" icon="plus">Новая заметка</UiButton>
    </div>

    <EmptyState
      v-if="!store.notes.length"
      icon="square-check"
      title="Заметок пока нет"
      text="Создайте первую заметку — с названием и списком задач."
    >
      <UiButton to="/notes/new" icon="plus">Создать заметку</UiButton>
    </EmptyState>

    <TransitionGroup v-else tag="ul" name="notes-page-grid" :class="b('grid')">
      <li v-for="note in store.sortedNotes" :key="note.id">
        <NoteCard :note="note" @delete="onDelete(note)" />
      </li>
      <li key="new">
        <NuxtLink to="/notes/new" :class="b('new')">
          <span :class="b('new-icon')">
            <UiSvg name="plus" :size="18" />
          </span>
          Новая заметка
        </NuxtLink>
      </li>
    </TransitionGroup>
  </AppContent>
</template>

<style lang="scss" scoped>
  .notes-page {
    &__heading {
      align-items: flex-end;
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      justify-content: space-between;
      margin-bottom: 36px;

      @include mobile {
        align-items: center;
        margin-bottom: 24px;
      }
    }

    &__title {
      font-size: 44px;
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1;

      @include mobile {
        font-size: 32px;
      }
    }

    &__grid {
      display: grid;
      gap: 20px;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      list-style: none;
      margin: 0;
      padding: 0;

      @include mobile {
        gap: 12px;
        grid-template-columns: minmax(0, 1fr);
      }
    }

    &__new {
      align-items: center;
      border: 2px dashed $color-border-dashed;
      border-radius: $radius-lg;
      color: $color-text-muted;
      display: flex;
      flex-direction: column;
      font-weight: 600;
      gap: 10px;
      height: 100%;
      justify-content: center;
      min-height: 240px;
      transition: border-color $transition, color $transition;

      &:hover {
        border-color: $color-border-strong;
        color: $color-text;
      }

      &:focus-visible {
        outline-offset: 2px;
      }

      @include mobile {
        min-height: 120px;
      }
    }

    &__new-icon {
      align-items: center;
      background: $color-bg-surface;
      border: 1px solid $color-border;
      border-radius: 50%;
      display: flex;
      height: 44px;
      justify-content: center;
      width: 44px;
    }
  }

  .notes-page-grid-enter-active,
  .notes-page-grid-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
  }

  .notes-page-grid-enter-from,
  .notes-page-grid-leave-to {
    opacity: 0;
    transform: scale(0.97);
  }
</style>
