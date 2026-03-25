import { useCallback, useEffect, useRef, useState } from 'react'
import { decryptPayload, encryptPayload } from '../utils/encryption'

export const useEncryptedLocalStorage = <T,>(
  key: string,
  defaultValue: T,
) => {
  const [storedValue, setStoredValue] = useState<T>(defaultValue)
  const [hydrated, setHydrated] = useState(false)
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true
    const hydrate = async () => {
      const raw = localStorage.getItem(key)
      if (!raw) {
        setHydrated(true)
        return
      }
      const parsed = await decryptPayload<T>(raw)
      if (parsed !== null && isMounted.current) {
        setStoredValue(parsed)
      }
      if (isMounted.current) {
        setHydrated(true)
      }
    }
    hydrate()
    return () => {
      isMounted.current = false
    }
  }, [key])

  const setValue: React.Dispatch<React.SetStateAction<T>> = useCallback(
    (value) => {
      setStoredValue((prev) =>
        typeof value === 'function' ? (value as (val: T) => T)(prev) : value,
      )
    },
    [],
  )

  useEffect(() => {
    if (!hydrated) return
    const persist = async () => {
      try {
        const encrypted = await encryptPayload(storedValue)
        localStorage.setItem(key, encrypted)
      } catch {
        localStorage.setItem(key, btoa(JSON.stringify(storedValue)))
      }
    }
    persist()
  }, [key, storedValue, hydrated])

  return [storedValue, setValue, hydrated] as const
}
