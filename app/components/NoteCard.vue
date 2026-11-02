<script setup lang="ts">
  import type { Note } from '~/types/note'

  const PREVIEW_LIMIT = 3

  const { note } = defineProps<{ note: Note }>()
  defineEmits<{ delete: [] }>()

  const link = computed(() => `/notes/${note.id}`)
  const title = computed(() => note.title || 'Без названия')
  const preview = computed(() => note.todos.slice(0, PREVIEW_LIMIT))
  const hiddenCount = computed(() => note.todos.length - preview.value.length)

  const b = bem('note-card')
</script>

<template>
  <article :class="b()">
    <h2 :class="b('title', { empty: !note.title })">
      <NuxtLink :to="link" :class="b('link')">{{ title }}</NuxtLink>
    </h2>

    <ul v-if="note.todos.length" :class="b('todos')">
      <li v-for="todo in preview" :key="todo.id" :class="b('todo', { done: todo.done })">
        <UiCheckbox :checked="todo.done" size="sm" disabled aria-hidden="true" />
        <span :class="b('todo-text')">
          {{ todo.text }}
          <span v-if="todo.done" class="visually-hidden">(выполнено)</span>
        </span>
      </li>
      <li v-if="hiddenCount > 0" :class="b('more')">
        и ещё {{ hiddenCount }}
      </li>
    </ul>
    <p v-else :class="b('placeholder')">Нет пунктов</p>

    <footer :class="b('actions')">
      <UiButton
        :to="link"
        variant="ghost"
        size="sm"
        icon="pencil"
        :aria-label="`Изменить «${title}»`"
        title="Изменить"
      />
      <UiButton
        variant="ghost"
        size="sm"
        icon="trash"
        :aria-label="`Удалить «${title}»`"
        title="Удалить"
        @click="$emit('delete')"
      />
    </footer>
  </article>
</template>

<style lang="scss" scoped>
  .note-card {
    background: $color-bg-surface;
    border: 1px solid $color-border;
    border-radius: $radius-lg;
    display: flex;
    flex-direction: column;
    gap: 14px;
    height: 100%;
    min-height: 240px;
    padding: 22px 22px 16px;
    position: relative;
    transition: box-shadow $transition, border-color $transition;

    &:hover {
      border-color: $color-border-dashed;
      box-shadow: $shadow-card-hover;
    }

    &__title {
      font-size: 20px;
      font-weight: 700;
      line-height: 1.3;
      overflow-wrap: anywhere;

      &--empty {
        color: $color-text-subtle;
      }
    }

    &__link {
      &::after {
        border-radius: $radius-lg;
        content: '';
        inset: 0;
        position: absolute;
      }

      &:focus-visible {
        outline: none;

        &::after {
          @include focus-ring;
        }
      }
    }

    &__todos {
      display: flex;
      flex-direction: column;
      gap: 8px;
      list-style: none;
      margin: 0;
      padding: 0;
    }

    &__todo {
      align-items: center;
      color: $color-text-secondary;
      display: flex;
      gap: 10px;
      line-height: 20px;

      &--done {
        color: $color-text-subtle;
        text-decoration: line-through;
      }
    }

    &__todo-text {
      @include truncate;
      min-width: 0;
    }

    &__more,
    &__placeholder {
      color: $color-text-subtle;
      font-size: 14px;
    }

    &__more {
      padding-left: 28px;
    }

    &__actions {
      display: flex;
      gap: 2px;
      justify-content: flex-end;
      margin: auto -8px 0 0;
      position: relative;
      z-index: 1;
    }
  }
</style>
