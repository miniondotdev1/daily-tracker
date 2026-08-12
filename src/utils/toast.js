// A dead-simple, dependency-free toast bus. Any component can call `toast(...)`
// and the <Toaster /> mounted at the app root will render it. Decouples the
// "show a motivational message" concern from where the action happens.

export function toast(message, opts = {}) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent('dt-toast', {
      detail: {
        message,
        emoji: opts.emoji || '',
        tone: opts.tone || 'default', // 'default' | 'success' | 'project'
        duration: opts.duration ?? 3200,
      },
    })
  )
}
