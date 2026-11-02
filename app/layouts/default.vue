<script setup lang="ts">
  const b = bem('app-layout')
</script>

<template>
  <div :class="b()">
    <slot />
    <ConfirmDialog />
    <AppToast />
  </div>
</template>

<style lang="scss" scoped>
  .app-layout {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
  }
</style>
