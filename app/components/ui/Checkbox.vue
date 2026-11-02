<script setup lang="ts">
  const { size = 'md' } = defineProps<{
    checked: boolean
    disabled?: boolean
    size?: 'sm' | 'md'
    label?: string
  }>()

  defineEmits<{ change: [] }>()

  const b = bem('ui-checkbox')
</script>

<template>
  <span :class="b({ checked, disabled, size })">
    <input
      :class="b('input')"
      type="checkbox"
      :checked="checked"
      :disabled="disabled"
      :aria-label="label"
      @change="$emit('change')"
    >
    <span :class="b('box')" aria-hidden="true">
      <UiSvg v-if="checked" name="check" :size="size === 'sm' ? 10 : 12" />
    </span>
  </span>
</template>

<style lang="scss" scoped>
  .ui-checkbox {
    display: inline-flex;
    flex-shrink: 0;
    position: relative;

    &--size-sm {
      height: 18px;
      width: 18px;
    }

    &--size-md {
      height: 22px;
      width: 22px;
    }

    &__input {
      cursor: pointer;
      height: 100%;
      inset: 0;
      margin: 0;
      opacity: 0;
      position: absolute;
      width: 100%;
    }

    &__box {
      align-items: center;
      border: 1.5px solid $color-border-strong;
      border-radius: 50%;
      color: $color-text-inverse;
      display: flex;
      height: 100%;
      justify-content: center;
      pointer-events: none;
      transition: background $transition, border-color $transition;
      width: 100%;
    }

    &__input:hover + &__box {
      border-color: $color-text;
    }

    &__input:focus-visible + &__box {
      @include focus-ring;
    }

    &--checked &__box {
      background: $color-primary;
      border-color: $color-primary;
    }

    &--disabled &__input {
      cursor: default;
    }

    &--disabled &__input:hover + &__box {
      border-color: $color-border-strong;
    }

    &--disabled.ui-checkbox--checked &__input:hover + &__box {
      border-color: $color-primary;
    }
  }
</style>
