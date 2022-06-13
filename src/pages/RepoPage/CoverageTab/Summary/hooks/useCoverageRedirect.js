import { useCallback, useLayoutEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'

const formatPath = (pathname) =>
  pathname.charAt(pathname.length - 1) === '/'
    ? pathname.slice(0, pathname.length - 1)
    : pathname

const handleBlobs = ({ pathname, owner, repo, ref, name }) => {
  if (owner && repo && pathname.includes('blobs') && ref) {
    return pathname.replace(
      `${owner}/${repo}/blobs/${ref}`,
      `${owner}/${repo}/blobs/${name}`
    )
  }
  return
}

const handleTree = ({ pathname, owner, repo, branch, name }) => {
  if (owner && repo && pathname.includes('tree') && branch) {
    return pathname.replace(
      `${owner}/${repo}/tree/${branch}`,
      `${owner}/${repo}/tree/${name}`
    )
  }
  return
}

const handleRootLocation = ({ pathname, owner, repo, name }) => {
  if (pathname.includes(`${owner}/${repo}`) && name) {
    return `${pathname}/tree/${name}`
  }
  return
}

function createPath({ pathname, owner, repo, ref, branch, name }) {
  let newPath
  newPath = handleBlobs({ pathname, owner, repo, ref, name })
  if (!newPath) {
    newPath = handleTree({ pathname, owner, repo, branch, name })
  }
  if (!newPath) {
    newPath = handleRootLocation({ pathname, owner, repo, name })
  }
  return newPath
}

export function useCoverageRedirect() {
  const location = useLocation()
  const { repo, branch, ref, owner } = useParams()

  const [newPath, setNewPath] = useState()
  const [isRedirectionEnabled, setisRedirectionEnabled] = useState(false)

  /**
   *
   * @param {{name: String}} selection
   */
  const setNewPathHandler = (selection) => {
    setNewPath(createPathCb(selection))
  }

  const createPathCb = useCallback(
    ({ name }) => {
      const pathname = formatPath(location.pathname)
      return createPath({ pathname, owner, repo, ref, branch, name })
    },
    [location.pathname, branch, ref, repo, owner]
  )

  useLayoutEffect(() => {
    if (newPath) {
      setisRedirectionEnabled(true)
    }
  }, [newPath])

  return {
    setNewPath: setNewPathHandler,
    newPath,
    isRedirectionEnabled,
  }
}
