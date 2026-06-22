import { useEffect, useState, useCallback } from 'react'
import { getHandle, setHandle, clearHandle } from '../lib/handle'

export function useHandle() {
  const [handle, setHandleState] = useState(() => getHandle())
  const [needsHandle, setNeedsHandle] = useState(() => !getHandle())

  useEffect(() => {
    const h = getHandle()
    if (!h) setNeedsHandle(true)
  }, [])

  const save = useCallback((raw) => {
    const clean = setHandle(raw)
    setHandleState(clean)
    setNeedsHandle(false)
    return clean
  }, [])

  const reset = useCallback(() => {
    clearHandle()
    setHandleState(null)
    setNeedsHandle(true)
  }, [])

  return { handle, needsHandle, save, reset, setNeedsHandle }
}