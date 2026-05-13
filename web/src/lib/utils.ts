import { Timestamp, type DocumentData } from 'firebase/firestore'

export function convertTimestamps<T>(data: DocumentData): T {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Timestamp) {
      result[key] = value.toDate()
    } else {
      result[key] = value
    }
  }
  return result as T
}
