export interface Toast {
  id: number
  text: string
}

const TOAST_DURATION = 3000

const toasts = ref<Toast[]>([])
let lastId = 0

export function useToast() {
  function dismiss(id: number): void {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  function show(text: string): void {
    const id = ++lastId
    toasts.value.push({ id, text })
    setTimeout(() => dismiss(id), TOAST_DURATION)
  }

  return { toasts: readonly(toasts), show, dismiss }
}
