import { useState } from 'react'

// TODO Setup API
const status = 'up'

export function useServerStatus() {
  return useState(status)
}
