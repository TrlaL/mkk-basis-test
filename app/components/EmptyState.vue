<script setup lang="ts">
  defineProps<{
    icon: string
    title: string
    text?: string
  }>()

  const b = bem('empty-state')
</script>

<template>
  <div :class="b()">
    <span :class="b('icon')">
      <UiSvg :name="icon" :size="20" />
    </span>
    <h2 :class="b('title')">{{ title }}</h2>
    <p v-if="text" :class="b('text')">{{ text }}</p>
    <div v-if="$slots.default" :class="b('actions')">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .empty-state {
    align-items: center;
    display: flex;
    flex-direction: column;
    margin: 0 auto;
    max-width: 360px;
    padding: 56px 0;
    text-align: center;

    &__icon {
      align-items: center;
      background: $color-bg-surface;
      border: 1px solid $color-border;
      border-radius: 50%;
      color: $color-text-muted;
      display: flex;
      height: 56px;
      justify-content: center;
      margin-bottom: 20px;
      width: 56px;
    }

    &__title {
      font-size: 20px;
      font-weight: 700;
    }

    &__text {
      color: $color-text-muted;
      margin-top: 6px;
    }

    &__actions {
      margin-top: 20px;
    }
  }
</style>
