import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import { blobsString, treeString } from 'pages/RepoPage/pathMatchersHooks'
import { formatPathPrefix } from 'shared/utils/url'

const handleBlobs = ({ pathname, owner, repo, ref, newRef }) => {
  if (owner && repo && pathname.includes('blobs') && ref) {
    return pathname.replace(
      `${blobsString({ owner, repo })}/${ref}`,
      `${blobsString({ owner, repo })}/${newRef}`
    )
  }
  return
}

const handleTree = ({ pathname, owner, repo, branch, newBranch }) => {
  if (owner && repo && pathname.includes('tree') && branch) {
    return pathname.replace(
      `${treeString({ owner, repo })}/${branch}`,
      `${treeString({ owner, repo })}/${newBranch}`
    )
  }
  return
}

const handleRootLocation = ({ pathname, owner, repo, newBranch }) => {
  if (pathname.includes(`${owner}/${repo}`) && newBranch) {
    return pathname.replace(
      `${owner}/${repo}`,
      `${treeString({ owner, repo })}/${newBranch}`
    )
  }
  return
}

function createPath({ pathname, owner, repo, ref, branch, name }) {
  let newPath
  newPath = handleBlobs({ pathname, owner, repo, ref, newRef: name })
  if (!newPath) {
    newPath = handleTree({ pathname, owner, repo, branch, newBranch: name })
  }
  if (!newPath) {
    newPath = handleRootLocation({ pathname, owner, repo, newBranch: name })
  }
  return newPath
}

export function useCoverageRedirect() {
  const location = useLocation()
  const { repo, branch, ref, owner } = useParams()

  const [newPath, setNewPath] = useState()
  const [isRedirectionEnabled, setIsRedirectionEnabled] = useState(false)

  /**
   *
   * @param {{name: String}} selection
   */
  const setNewPathHandler = (selection) => {
    setNewPath(createPathCb(selection))
  }

  const createPathCb = useCallback(
    ({ name }) => {
      const pathname = formatPathPrefix(location.pathname)
      return createPath({ pathname, owner, repo, ref, branch, name })
    },
    [location.pathname, branch, ref, repo, owner]
  )

  useLayoutEffect(() => {
    if (newPath) {
      setIsRedirectionEnabled(true)
    }
  }, [newPath])

  // reset on path change
  useEffect(() => {
    setIsRedirectionEnabled(false)
    setNewPath()
  }, [location.pathname])

  return {
    setNewPath: setNewPathHandler,
    newPath,
    isRedirectionEnabled,
  }
}
