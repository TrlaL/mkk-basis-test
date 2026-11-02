<script setup lang="ts">
  import type { TodoItem } from '~/types/note'

  const { todo } = defineProps<{ todo: Readonly<TodoItem> }>()

  const emit = defineEmits<{
    toggle: []
    input: [value: string]
    commit: []
    enter: []
    remove: []
    removeEmpty: []
  }>()

  function onEnter(event: KeyboardEvent): void {
    if (event.isComposing) return
    event.preventDefault()
    emit('enter')
  }

  function onBackspace(event: KeyboardEvent): void {
    if (todo.text !== '') return
    event.preventDefault()
    emit('removeEmpty')
  }

  const b = bem('todo-item')
</script>

<template>
  <li :class="b({ done: todo.done })">
    <UiCheckbox
      :checked="todo.done"
      :label="todo.text ? `Выполнено: ${todo.text}` : 'Выполнено'"
      @change="emit('toggle')"
    />
    <input
      :class="b('input')"
      :value="todo.text"
      :data-todo-id="todo.id"
      type="text"
      placeholder="Пункт списка"
      aria-label="Текст пункта"
      maxlength="500"
      @input="emit('input', ($event.target as HTMLInputElement).value)"
      @blur="emit('commit')"
      @keydown.enter="onEnter"
      @keydown.backspace="onBackspace"
    >
    <UiButton
      :class="b('remove')"
      variant="ghost"
      size="sm"
      icon="close"
      aria-label="Удалить пункт"
      title="Удалить пункт"
      @click="emit('remove')"
    />
  </li>
</template>

<style lang="scss" scoped>
  .todo-item {
    align-items: center;
    border-radius: $radius;
    display: flex;
    gap: 14px;
    min-height: 52px;
    padding: 0 6px 0 16px;
    transition: background $transition, box-shadow $transition;

    &:hover {
      background: $color-bg-surface;
    }

    &:focus-within {
      background: $color-bg-surface;
      box-shadow: 0 0 0 1px $color-border;
    }

    &__input {
      background: transparent;
      border: 0;
      flex: 1;
      font-size: 17px;
      min-width: 0;
      padding: 14px 0;

      &::placeholder {
        color: $color-text-placeholder;
      }

      &:focus {
        outline: none;
      }
    }

    &--done &__input {
      color: $color-text-subtle;
      text-decoration: line-through;
    }

    &__remove {
      opacity: 0;
    }

    &:hover &__remove,
    &:focus-within &__remove {
      opacity: 1;
    }

    @media (hover: none) {
      &__remove {
        opacity: 1;
      }
    }
  }
</style>
