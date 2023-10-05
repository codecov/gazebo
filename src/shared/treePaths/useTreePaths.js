import dropRight from 'lodash/dropRight'
import qs from 'qs'
import { useLocation, useParams } from 'react-router-dom'

import { useRepoOverview } from 'services/repo'
import { getFilePathParts } from 'shared/utils/url'

function getTreeLocation(paths, location, index) {
  return dropRight(paths, paths.length - index - 1).join('/')
}

export function useTreePaths(passedPath) {
  const location = useLocation()
  const params = qs.parse(location.search, {
    ignoreQueryPrefix: true,
    depth: 1,
  })

  const {
    provider,
    owner,
    branch: urlBranch,
    path: urlPath,
    repo,
    ref: urlRef,
  } = useParams()

  const { data: repoOverview } = useRepoOverview(
    {
      provider,
      repo,
      owner,
    },
    { suspense: false }
  )

  const branch = urlBranch && decodeURIComponent(urlBranch)
  const ref = urlRef && decodeURIComponent(urlRef)
  const path = urlPath && decodeURIComponent(urlPath)
  const filePaths = getFilePathParts(passedPath || path)
  const defaultBranch = repoOverview?.defaultBranch

  let queryParams = undefined
  if (Object.keys(params).length > 0) {
    queryParams = params
  }

  const paths = filePaths?.map((location, index) => ({
    pageName: 'treeView',
    text: location,
    options: {
      tree: getTreeLocation(filePaths, location, index),
      ref: branch ?? ref ?? defaultBranch,
      queryParams,
    },
  }))

  const repoPath = {
    pageName: 'treeView',
    text: repo,
    options: {
      ref: branch ?? ref ?? defaultBranch,
      queryParams,
    },
  }

  const treePaths = [repoPath, ...paths]

  return { treePaths }
}
