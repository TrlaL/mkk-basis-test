<script setup lang="ts">
  const b = bem('app-content')
</script>

<template>
  <main :class="b()">
    <slot />
  </main>
</template>

<style lang="scss" scoped>
  .app-content {
    display: flex;
    flex: 1;
    flex-direction: column;
    margin: 0 auto;
    max-width: $container-width;
    padding: 48px $container-padding 64px;
    width: 100%;

    @include mobile {
      padding: 24px $container-padding-sm 48px;
    }
  }
</style>
