export function useUndoHotkeys(undo: () => void, redo: () => void) {
  function onKeydown(event: KeyboardEvent): void {
    if (!(event.ctrlKey || event.metaKey) || event.code !== 'KeyZ') return
    if (event.target instanceof Element && event.target.closest('[role="dialog"]')) return

    event.preventDefault()
    if (event.shiftKey) redo()
    else undo()
  }

  onMounted(() => window.addEventListener('keydown', onKeydown))
  onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
}
