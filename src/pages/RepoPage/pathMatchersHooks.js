import { useLocation, useParams } from 'react-router-dom'

/* Related path utils */
export const formatPath = (pathname) =>
  pathname.charAt(pathname.length - 1) === '/'
    ? pathname.slice(0, pathname.length - 1)
    : pathname

export const blobsString = ({ owner, repo }) => `${owner}/${repo}/blobs`
export const treeString = ({ owner, repo }) => `${owner}/${repo}/tree`

/* true/false matchers for the coverage tab "active" state */
export const useMatchBlobsPath = () => {
  const location = useLocation()
  const { provider, owner, repo } = useParams()
  return formatPath(location.pathname).includes(
    `/${provider}/${blobsString({ owner, repo })}`
  )
}

export const useMatchTreePath = () => {
  const location = useLocation()
  const { provider, owner, repo } = useParams()
  return formatPath(location.pathname).includes(
    `/${provider}/${treeString({ owner, repo })}`
  )
}
