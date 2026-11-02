<script lang="ts">
  const files = import.meta.glob<string>('~/assets/icons/*.svg', {
    query: '?raw',
    import: 'default',
    eager: true,
  })

  const icons: Record<string, string> = Object.fromEntries(
    Object.entries(files).map(([path, svg]) => [path.split('/').pop()!.replace('.svg', ''), svg])
  )
</script>

<script setup lang="ts">
  const { name, size = 16 } = defineProps<{
    name: string
    size?: number | string
  }>()

  const b = bem('ui-svg')
</script>

<template>
  <span
    :class="b()"
    :style="{ width: unit(size), height: unit(size) }"
    v-html="icons[name]"
  />
</template>

<style lang="scss" scoped>
  .ui-svg {
    display: inline-flex;
    flex-shrink: 0;

    :deep(svg) {
      width: 100%;
      height: 100%;
    }
  }
</style>
