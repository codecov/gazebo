import { useState } from 'react'

export function imagePromiseFactory({ src }) {
  return new Promise((resolveSource, rejectSource) => {
    return new Promise((resolveImage, rejectImage) => {
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

export function useImage({ src }) {
  const [, setIsLoading] = useState(true)

  let imageCache = imageExtCache ? imageExtCache : new Map()

  if (!imageCache.get(src)) {
    imageCache.set(src, {
      promise: imagePromiseFactory({ src }),
      cache: 'pending',
      error: null,
    })
  }

  imageCache
    .get(src)
    .promise.then((src) => {
      imageCache.set(src, { ...imageCache.get(src), cache: 'resolved', src })
      setIsLoading(false)
    })
    .catch((error) => {
      imageCache.set(src, { ...imageCache.get(src), cache: 'rejected', error })
      setIsLoading(false)
    })

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
