import { useState } from 'react'

export const UNKNOWN = 'unknown'
export const UP = 'up'
export const DOWN = 'down'
export const WARNING = 'warning'

// TODO Setup API
const status = UP

export function useServerStatus() {
  const [privateStatus, setPrivateStatus] = useState(status)

  // Throws warning if invalid status attempted
  function updateUser(newStatus) {
    if (![UNKNOWN, UP, DOWN, WARNING].includes(newStatus)) {
      console.warn(
        `Error updating status service: ${newStatus} is not a valid server status`
      )
      setPrivateStatus(UNKNOWN)
      return
    }

    setPrivateStatus(newStatus)
  }

  return [privateStatus, updateUser]
}
