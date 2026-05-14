import { useState, useCallback } from 'react'
import { httpsCallable } from 'firebase/functions'
import { functions } from '../config/firebase'

export function useProcessScheduled() {
  const [processing, setProcessing] = useState(false)

  const process = useCallback(async () => {
    setProcessing(true)
    try {
      const fn = httpsCallable(functions, 'processScheduledMessages')
      const result = await fn()
      return result.data as { processed: number }
    } catch {
      return { processed: 0 }
    } finally {
      setProcessing(false)
    }
  }, [])

  return { process, processing }
}
