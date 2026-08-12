import { useState, useEffect, useCallback, useRef } from 'react'

// A tiny persistent-state hook. Behaves like useState but mirrors the value to
// localStorage under `key`, and keeps multiple tabs / hook instances in sync
// via the `storage` event plus a same-tab custom event.
export function useLocalStorage(key, initialValue) {
  const readValue = useCallback(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (err) {
      console.warn(`useLocalStorage: failed to read "${key}"`, err)
      return initialValue
    }
  }, [key, initialValue])

  const [stored, setStored] = useState(readValue)

  // Keep a ref of the latest value so the functional-updater form works even if
  // called rapidly.
  const storedRef = useRef(stored)
  storedRef.current = stored

  const setValue = useCallback(
    (value) => {
      try {
        const next = value instanceof Function ? value(storedRef.current) : value
        storedRef.current = next
        setStored(next)
        window.localStorage.setItem(key, JSON.stringify(next))
        // Notify other hook instances in the SAME tab.
        window.dispatchEvent(
          new CustomEvent('local-storage', { detail: { key } })
        )
      } catch (err) {
        console.warn(`useLocalStorage: failed to write "${key}"`, err)
      }
    },
    [key]
  )

  useEffect(() => {
    const handler = (e) => {
      if (e.key && e.key !== key) return
      if (e.detail && e.detail.key !== key) return
      setStored(readValue())
    }
    window.addEventListener('storage', handler)
    window.addEventListener('local-storage', handler)
    return () => {
      window.removeEventListener('storage', handler)
      window.removeEventListener('local-storage', handler)
    }
  }, [key, readValue])

  return [stored, setValue]
}
