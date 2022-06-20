import { useCallback, useLayoutEffect, useReducer } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import { formatPathPrefix } from 'shared/utils/url'

import { createPath } from '../utils/paths'

const initState = {
  newPath: undefined,
  isRedirectionEnabled: false,
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'redirect':
      const { path, ...payload } = action.payload
      const pathname = formatPathPrefix(path)
      const newPath = createPath({ pathname, ...payload })

      return {
        isRedirectionEnabled: !!newPath,
        newPath,
      }
    default:
      return initState
  }
}

export function useCoverageRedirect() {
  const location = useLocation()
  const { repo, branch, ref, owner } = useParams()
  const [state, dispatch] = useReducer(reducer, initState)

  const setNewPath = useCallback(
    (newBranch) => {
      dispatch({
        type: 'redirect',
        payload: {
          path: location.pathname,
          owner,
          repo,
          ref,
          branch,
          name: newBranch,
        },
      })
    },
    [location.pathname, owner, repo, ref, branch]
  )

  // On route change reset
  useLayoutEffect(() => {
    dispatch({
      type: 'init',
    })
  }, [location.pathname])

  return {
    setNewPath,
    redirectState: state,
  }
}
