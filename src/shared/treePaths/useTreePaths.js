import dropRight from 'lodash/dropRight'
import { useParams } from 'react-router-dom'

import { useRepoOverview } from 'services/repo'
import { getFilePathParts } from 'shared/utils/url'

function getTreeLocation(paths, location, index) {
  return dropRight(paths, paths.length - index - 1).join('/')
}

export function useTreePaths(passedPath) {
  const {
    provider,
    owner,
    branch: urlBranch,
    path: urlPath,
    repo,
    ref: urlRef,
  } = useParams()
  const branch = urlBranch && decodeURIComponent(urlBranch)
  const ref = urlRef && decodeURIComponent(urlRef)
  const path = urlPath && decodeURIComponent(urlPath)

  const filePaths = getFilePathParts(passedPath || path)
  const { data: repoOverview } = useRepoOverview(
    {
      provider,
      repo,
      owner,
    },
    { suspense: false }
  )
  const defaultBranch = repoOverview?.defaultBranch

  const paths = filePaths?.map((location, index) => ({
    pageName: 'treeView',
    text: location,
    options: {
      tree: getTreeLocation(filePaths, location, index),
      ref: branch ?? ref ?? defaultBranch,
    },
  }))

  const repoPath = {
    pageName: 'treeView',
    text: repo,
    options: { ref: branch ?? ref ?? defaultBranch },
  }
  const treePaths = [repoPath, ...paths]
  return { treePaths }
}
