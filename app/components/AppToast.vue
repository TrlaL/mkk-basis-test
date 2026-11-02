<script setup lang="ts">
  const { toasts, dismiss } = useToast()

  const b = bem('app-toast')
</script>

<template>
  <div :class="b()" role="status" aria-live="polite">
    <TransitionGroup name="app-toast">
      <div v-for="toast in toasts" :key="toast.id" :class="b('item')">
        <UiSvg :class="b('icon')" name="check" :size="16" />
        <span>{{ toast.text }}</span>
        <button
          :class="b('close')"
          type="button"
          aria-label="Закрыть уведомление"
          @click="dismiss(toast.id)"
        >
          <UiSvg name="close" :size="14" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style lang="scss" scoped>
  .app-toast {
    align-items: center;
    bottom: 24px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    left: 50%;
    pointer-events: none;
    position: fixed;
    transform: translateX(-50%);
    z-index: 200;

    &__item {
      align-items: center;
      background: $color-bg-inverse;
      border-radius: $radius-pill;
      box-shadow: $shadow-modal;
      color: $color-text-inverse;
      display: flex;
      font-weight: 500;
      gap: 10px;
      padding: 8px 8px 8px 18px;
      pointer-events: auto;
      white-space: nowrap;
    }

    &__icon {
      color: $color-success;
    }

    &__close {
      align-items: center;
      background: none;
      border: 0;
      border-radius: 50%;
      color: $color-text-placeholder;
      cursor: pointer;
      display: flex;
      height: 28px;
      justify-content: center;
      margin-left: 8px;
      padding: 0;
      width: 28px;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: $color-text-inverse;
      }
    }
  }

  .app-toast-enter-active,
  .app-toast-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
  }

  .app-toast-enter-from,
  .app-toast-leave-to {
    opacity: 0;
    transform: translateY(8px);
  }
</style>
