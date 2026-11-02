export default defineNuxtPlugin(() => {
  const store = useNotesStore()

  window.addEventListener('storage', (event) => {
    if (event.key === null || event.key === NOTES_STORAGE_KEY) store.reload()
  })

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') store.flush()
  })
  window.addEventListener('pagehide', () => store.flush())
})
