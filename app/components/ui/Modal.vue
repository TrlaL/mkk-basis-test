<script setup lang="ts">
  const { open, title } = defineProps<{
    open: boolean
    title: string
  }>()

  const emit = defineEmits<{ close: [] }>()

  const b = bem('ui-modal')
  const titleId = useId()
  const dialog = useTemplateRef<HTMLElement>('dialog')

  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

  let returnFocusTo: HTMLElement | null = null

  function getFocusable(): HTMLElement[] {
    return Array.from(dialog.value?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
  }

  async function onOpen(): Promise<void> {
    returnFocusTo = document.activeElement instanceof HTMLElement ? document.activeElement : null
    document.body.style.overflow = 'hidden'
    await nextTick()
    const target = dialog.value?.querySelector<HTMLElement>('[data-autofocus]') ?? getFocusable()[0] ?? dialog.value
    target?.focus()
  }

  function onClose(): void {
    document.body.style.overflow = ''
    if (returnFocusTo?.isConnected) returnFocusTo.focus()
    returnFocusTo = null
  }

  watch(() => open, (isOpen) => (isOpen ? onOpen() : onClose()), { immediate: true })
  onBeforeUnmount(() => {
    if (open) onClose()
  })

  function onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.stopPropagation()
      emit('close')
      return
    }

    if (event.key !== 'Tab') return

    const items = getFocusable()
    const first = items[0]
    const last = items.at(-1)
    if (!first || !last) {
      event.preventDefault()
      return
    }

    const active = document.activeElement
    if (event.shiftKey && (active === first || !items.includes(active as HTMLElement))) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && (active === last || !items.includes(active as HTMLElement))) {
      event.preventDefault()
      first.focus()
    }
  }
</script>

<template>
  <Teleport to="body">
    <Transition name="ui-modal">
      <div v-if="open" :class="b()" @mousedown.self="emit('close')">
        <div
          ref="dialog"
          :class="b('dialog')"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          tabindex="-1"
          @keydown="onKeydown"
        >
          <div v-if="$slots.icon" :class="b('icon')">
            <slot name="icon" />
          </div>

          <h2 :id="titleId" :class="b('title')">{{ title }}</h2>

          <div :class="b('body')">
            <slot />
          </div>

          <div v-if="$slots.actions" :class="b('actions')">
            <slot name="actions" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
  .ui-modal {
    align-items: center;
    background: $color-overlay;
    display: flex;
    inset: 0;
    justify-content: center;
    padding: $container-padding-sm;
    position: fixed;
    z-index: 100;

    &__dialog {
      background: $color-bg-surface;
      border-radius: $radius-lg;
      box-shadow: $shadow-modal;
      max-width: 420px;
      padding: 28px;
      width: 100%;

      &:focus {
        outline: none;
      }
    }

    &__icon {
      margin-bottom: 14px;
    }

    &__title {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.01em;
      line-height: 1.3;
    }

    &__body {
      color: $color-text-muted;
      margin-top: 8px;
    }

    &__actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: flex-end;
      margin-top: 24px;

      @include mobile {
        flex-direction: column-reverse;

        > * {
          width: 100%;
        }
      }
    }
  }

  .ui-modal-enter-active,
  .ui-modal-leave-active {
    transition: opacity 0.15s ease;

    .ui-modal__dialog {
      transition: transform 0.15s ease;
    }
  }

  .ui-modal-enter-from,
  .ui-modal-leave-to {
    opacity: 0;

    .ui-modal__dialog {
      transform: scale(0.96);
    }
  }
</style>
