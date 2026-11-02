<script setup lang="ts">
  type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-ghost'
  type ButtonSize = 'sm' | 'md'

  const {
    variant = 'primary',
    size = 'md',
    icon,
    to,
  } = defineProps<{
    variant?: ButtonVariant
    size?: ButtonSize
    icon?: string
    to?: string
  }>()

  const slots = defineSlots<{ default?: () => unknown }>()
  const NuxtLink = resolveComponent('NuxtLink')

  const b = bem('ui-button')
</script>

<template>
  <component
    :is="to ? NuxtLink : 'button'"
    :to="to"
    :type="to ? undefined : 'button'"
    :class="b({ variant, size, 'icon-only': !slots.default })"
  >
    <UiSvg v-if="icon" :name="icon" :size="18" />
    <slot />
  </component>
</template>

<style lang="scss" scoped>
  .ui-button {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: $radius-pill;
    cursor: pointer;
    display: inline-flex;
    flex-shrink: 0;
    font-weight: 600;
    gap: 8px;
    justify-content: center;
    line-height: 1;
    transition: background $transition, border-color $transition, color $transition, opacity $transition;
    user-select: none;
    white-space: nowrap;

    &:disabled {
      cursor: not-allowed;
      opacity: $opacity-disabled;
    }

    &--size-sm {
      font-size: 14px;
      height: 36px;
      padding: 0 14px;
    }

    &--size-md {
      font-size: 15px;
      height: 44px;
      padding: 0 20px;
    }

    &--icon-only {
      padding: 0;

      &.ui-button--size-sm {
        width: 36px;
      }

      &.ui-button--size-md {
        width: 44px;
      }
    }

    &--variant-primary {
      background: $color-primary;
      color: $color-text-inverse;

      &:hover:not(:disabled) {
        background: $color-primary-hover;
      }
    }

    &--variant-secondary {
      background: $color-bg-surface;
      border-color: $color-border;
      color: $color-text;

      &:hover:not(:disabled) {
        border-color: $color-border-dashed;
        background: $color-bg-subtle;
      }
    }

    &--variant-ghost {
      color: $color-text-muted;

      &:hover:not(:disabled) {
        background: $color-bg-hover;
        color: $color-text;
      }
    }

    &--variant-danger {
      background: $color-danger;
      color: $color-text-inverse;

      &:hover:not(:disabled) {
        background: $color-danger-hover;
      }
    }

    &--variant-danger-ghost {
      color: $color-danger-text;

      &:hover:not(:disabled) {
        background: $color-danger-subtle;
      }
    }
  }
</style>
