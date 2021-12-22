import { useEffect, useState } from 'react'

export function useOnboardingLocation() {
  const [url, setUrl] = useState('')
  const [path, setPath] = useState('')

  useEffect(() => {
    setUrl(window.location.href)
    setPath(window.location.pathname)
  }, [url, path])

  return { url, path }
}
