import { useEffect, useMemo, useState } from 'react'

export function imagePromiseFactory({ src }: { src: string }) {
  return new Promise((resolveSource, rejectSource) => {
    return new Promise<void>((resolveImage, rejectImage) => {
      const image = new Image()
      image.src = src
      image.onload = () =>
        image
          .decode()
          .then(() => resolveImage())
          .catch(() => rejectImage())
      image.onerror = rejectImage
    })
      .then(() => resolveSource(src))
      .catch(() => rejectSource('Unable to load image'))
  })
}

const imageExtCache = new Map()

export function useImage({ src }: { src: string }) {
  const [, setIsLoading] = useState(true)

  const imageCache = useMemo(
    () => (imageExtCache ? imageExtCache : new Map()),
    []
  )

  if (!imageCache.get(src)) {
    imageCache.set(src, {
      promise: imagePromiseFactory({ src }),
      cache: 'pending',
      error: null,
    })
  }

  useEffect(() => {
    let unMounted = false
    imageCache
      .get(src)
      .promise.then((src: string) => {
        if (unMounted) return
        imageCache.set(src, { ...imageCache.get(src), cache: 'resolved', src })
        setIsLoading(false)
      })
      .catch((error: Error) => {
        if (unMounted) return
        imageCache.set(src, {
          ...imageCache.get(src),
          cache: 'rejected',
          error,
        })
        setIsLoading(false)
      })
    return () => {
      unMounted = true
    }
  }, [imageCache, src])

  if (imageCache.get(src).cache === 'resolved') {
    return { src: imageCache.get(src).src, isLoading: false, error: null }
  }

  if (imageCache.get(src).cache === 'rejected') {
    return {
      isLoading: false,
      error: imageCache.get(src).error,
      src: undefined,
    }
  }

  return { isLoading: true, src: undefined, error: null }
}
