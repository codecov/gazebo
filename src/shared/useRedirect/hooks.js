import { useCallback } from 'react'

export function useRedirect({ href }) {
  return {
    hardRedirect: useCallback(() => {
      window.location.replace(href)
    }, [href]),
  }
}
