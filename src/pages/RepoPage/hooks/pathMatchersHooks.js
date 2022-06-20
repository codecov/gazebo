import { useLocation, useParams } from 'react-router-dom'

import { newFileviewString, treeviewString } from '../utils'

/* true/false matchers for the coverage tab "active" state */
export const useMatchBlobsPath = () => {
  const location = useLocation()
  const { provider, owner, repo } = useParams()
  return location.pathname.includes(
    `/${provider}/${newFileviewString({ owner, repo })}`
  )
}

export const useMatchTreePath = () => {
  const location = useLocation()
  const { provider, owner, repo } = useParams()
  return location.pathname.includes(
    `/${provider}/${treeviewString({ owner, repo })}`
  )
}
