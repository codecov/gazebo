import { useQuery } from '@tanstack/react-query'

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

export function useImage({ src }) {
  const { data, isLoading, error } = useQuery(
    ['ImageUrl', src],
    async () => imagePromiseFactory({ src }),
    {
      suspense: false,
    }
  )

  return {
    src: data,
    isLoading,
    error,
  }
}
