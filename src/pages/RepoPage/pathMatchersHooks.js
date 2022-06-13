import { useLocation, useParams } from 'react-router-dom'

import { formatPathPrefix } from 'shared/utils/url'

/* 
  Related path utils
  TODO: These function names are confusing but we're not sure whats better
  */
export const blobsString = ({ owner, repo }) => `${owner}/${repo}/blobs`
export const treeString = ({ owner, repo }) => `${owner}/${repo}/tree`

/* true/false matchers for the coverage tab "active" state */
export const useMatchBlobsPath = () => {
  const location = useLocation()
  const { provider, owner, repo } = useParams()
  return formatPathPrefix(location.pathname).includes(
    `/${provider}/${blobsString({ owner, repo })}`
  )
}

export const useMatchTreePath = () => {
  const location = useLocation()
  const { provider, owner, repo } = useParams()
  return formatPathPrefix(location.pathname).includes(
    `/${provider}/${treeString({ owner, repo })}`
  )
}
