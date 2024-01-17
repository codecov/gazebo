import { useLocation, useParams, useRouteMatch } from 'react-router-dom'

import { fileviewString, treeviewString } from '../utils'

interface URLParams {
  provider: string
  owner: string
  repo: string
}

/* true/false matchers for the coverage tab "active" state */
export const useMatchBlobsPath = () => {
  const location = useLocation()
  const { provider, owner, repo } = useParams<URLParams>()
  return location.pathname.includes(
    `/${provider}/${fileviewString({ owner, repo })}`
  )
}

export const useMatchTreePath = () => {
  const location = useLocation()
  const { provider, owner, repo } = useParams<URLParams>()
  return location.pathname.includes(
    `/${provider}/${treeviewString({ owner, repo })}`
  )
}

export const useMatchCoverageOnboardingPath = () => {
  const path = '/:provider/:owner/:repo'
  const newRouteMatch = useRouteMatch(`${path}/new`)
  const circleCIRouteMatch = useRouteMatch(`${path}/new/circle-ci`)
  const otherCIRouteMatch = useRouteMatch(`${path}/new/other-ci`)

  return Boolean(newRouteMatch || circleCIRouteMatch || otherCIRouteMatch)
}
