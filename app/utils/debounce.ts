export interface Debounced<A extends unknown[]> {
  (...args: A): void
  flush(): void
  cancel(): void
}

export function debounce<A extends unknown[]>(fn: (...args: A) => void, wait: number): Debounced<A> {
  let timer: ReturnType<typeof setTimeout> | undefined
  let pendingArgs: A | undefined

  const debounced = (...args: A) => {
    pendingArgs = args
    clearTimeout(timer)
    timer = setTimeout(debounced.flush, wait)
  }

  debounced.flush = () => {
    clearTimeout(timer)
    if (!pendingArgs) return
    const args = pendingArgs
    pendingArgs = undefined
    fn(...args)
  }

  debounced.cancel = () => {
    clearTimeout(timer)
    pendingArgs = undefined
  }

  return debounced
}
