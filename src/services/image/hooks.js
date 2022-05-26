import { useLayoutEffect, useReducer } from 'react'

function imagePromiseFactory({ src }) {
  return new Promise((resolveSource, rejectSource) => {
    return new Promise((resolveImage, rejectImage) => {
      const image = new Image()
      image.src = src
      image.onload = () => image.decode().then(resolveImage).catch(rejectImage)
      image.onerror = rejectImage
    })
      .then(() => {
        resolveSource(src)
      })
      .catch(() => {
        rejectSource(true)
      })
  })
}

export function imageReducer(state, action) {
  switch (action.type) {
    case 'pending': {
      return { status: action.type, src: undefined, error: null }
    }
    case 'resolved': {
      return { status: action.type, src: action.src, error: null }
    }
    case 'rejected': {
      return { status: action.type, src: undefined, error: action.error }
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

export function useImage({ src }) {
  const [state, dispatch] = useReducer(imageReducer, {
    status: 'pending',
    src: undefined,
    error: null,
  })

  useLayoutEffect(() => {
    dispatch({ type: 'pending' })

    imagePromiseFactory({ decode: true, src })
      .then((src) => {
        dispatch({ type: 'resolved', src })
      })
      .catch((error) => {
        dispatch({ type: 'rejected', error })
      })
  }, [src, dispatch])

  if (state.status === 'resolved') {
    return { src: state.src, isLoading: false, error: null }
  }

  if (state.status === 'rejected') {
    return { src: undefined, isLoading: false, error: state.error }
  }

  return {
    src: undefined,
    isLoading: true,
    error: null,
  }
}
