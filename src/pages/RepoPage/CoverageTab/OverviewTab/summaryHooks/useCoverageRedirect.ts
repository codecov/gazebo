import { useCallback, useLayoutEffect, useReducer } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import { formatPathPrefix } from 'shared/utils/url'

import { createPath } from '../Summary/utils/paths'

interface Action {
  type: 'redirect' | 'init'
  payload?: {
    path: string
    owner: string
    repo: string
    ref: string
    branch: string
    name?: string
  }
}

export interface UseCoverageRedirectState {
  newPath?: string | null
  isRedirectionEnabled: boolean
}

const initState: UseCoverageRedirectState = {
  newPath: undefined,
  isRedirectionEnabled: false,
}

const reducer = (state: UseCoverageRedirectState, action: Action) => {
  if (!action.payload || action.type === 'init') {
    return initState
  }

  const { path, ...payload } = action.payload
  const pathname = formatPathPrefix(path)
  const newPath = createPath({ pathname, ...payload })

  const newState: UseCoverageRedirectState = {
    isRedirectionEnabled: !!newPath,
    newPath,
  }

  return newState
}

interface URLParams {
  repo: string
  branch: string
  ref: string
  owner: string
}

export function useCoverageRedirect() {
  const location = useLocation()
  const { repo, branch, ref, owner } = useParams<URLParams>()
  const [state, dispatch] = useReducer(reducer, initState)

  const setNewPath = useCallback(
    (newBranch: string) => {
      dispatch({
        type: 'redirect',
        payload: {
          path: location.pathname,
          owner,
          repo,
          ref,
          branch,
          name: newBranch ? encodeURIComponent(newBranch) : undefined,
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
