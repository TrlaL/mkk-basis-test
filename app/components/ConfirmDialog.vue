<script setup lang="ts">
  const { request, answer } = useConfirmRequest()

  const shown = shallowRef(request.value)
  watch(request, (value) => {
    if (value) shown.value = value
  })

  const b = bem('confirm-dialog')
</script>

<template>
  <UiModal :open="!!request" :title="shown?.title ?? ''" @close="answer(false)">
    <template v-if="shown?.icon" #icon>
      <span :class="b('icon', { danger: shown.danger })">
        <UiSvg :name="shown.icon" :size="18" />
      </span>
    </template>

    <p v-if="shown?.message">{{ shown.message }}</p>

    <template #actions>
      <UiButton
        variant="secondary"
        :data-autofocus="shown?.danger ? '' : undefined"
        @click="answer(false)"
      >
        {{ shown?.cancelText ?? 'Отмена' }}
      </UiButton>
      <UiButton
        :variant="shown?.danger ? 'danger' : 'primary'"
        :data-autofocus="shown?.danger ? undefined : ''"
        @click="answer(true)"
      >
        {{ shown?.confirmText ?? 'Подтвердить' }}
      </UiButton>
    </template>
  </UiModal>
</template>

<style lang="scss" scoped>
  .confirm-dialog {
    &__icon {
      align-items: center;
      background: $color-bg-hover;
      border-radius: 50%;
      color: $color-text-muted;
      display: flex;
      height: 44px;
      justify-content: center;
      width: 44px;

      &--danger {
        background: $color-danger-subtle;
        color: $color-danger;
      }
    }
  }
</style>
