import { useEffect, useReducer } from 'react'

function imagePromiseFactory({ src }) {
  return new Promise((resolve, reject) => {
    return new Promise((resolve, reject) => {
      const i = new Image()
      i.src = src
      i.onload = () => i.decode().then(resolve).catch(reject)
      i.onerror = reject
    })
      .then(() => {
        resolve(src)
      })
      .catch(() => {
        reject(true)
      })
  })
}

function imageReducer(state, action) {
  switch (action.type) {
    case 'pending': {
      return { status: 'pending', src: undefined, error: null }
    }
    case 'resolved': {
      return { status: 'resolved', src: action.src, error: null }
    }
    case 'rejected': {
      return { status: 'rejected', src: undefined, error: action.error }
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

  useEffect(() => {
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
