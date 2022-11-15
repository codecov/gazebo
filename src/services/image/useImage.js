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
  const { data, isLoading, isError } = useQuery(
    ['ImageUrl', src],
    async () => imagePromiseFactory({ src }),
    {
      suspense: false,
      retry: false,
    }
  )

  return {
    src: data,
    isLoading,
    isError,
  }
}
