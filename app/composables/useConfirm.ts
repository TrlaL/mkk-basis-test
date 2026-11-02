export interface ConfirmOptions {
  title: string
  message?: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
  icon?: string
}

interface ConfirmRequest extends ConfirmOptions {
  resolve: (confirmed: boolean) => void
}

const request = shallowRef<ConfirmRequest | null>(null)

export function useConfirm() {
  return (options: ConfirmOptions) =>
    new Promise<boolean>((resolve) => {
      request.value?.resolve(false)
      request.value = { ...options, resolve }
    })
}

export function useConfirmRequest() {
  function answer(confirmed: boolean): void {
    request.value?.resolve(confirmed)
    request.value = null
  }

  return { request: readonly(request), answer }
}
