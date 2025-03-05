import { useCallback } from 'react'

export function useRedirect({ href }: { href: string }) {
  return {
    hardRedirect: useCallback(() => {
      window.location.replace(href)
    }, [href]),
  }
}
