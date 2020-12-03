import { useState } from 'react'

// TODO hook up with api
const status = 'up'

export function useServerStatus() {
  return useState(status)
}
