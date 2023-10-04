import dropRight from 'lodash/dropRight'
import QueryString from 'qs'
import { useLocation, useParams } from 'react-router-dom'

import { getFilePathParts } from 'shared/utils/url'

function getTreeLocation(paths, location, index) {
  return dropRight(paths, paths.length - index - 1).join('/')
}

export function useCommitTreePaths() {
  const { repo, path, commit } = useParams()
  const location = useLocation()
  const params = QueryString.parse(location.search, {
    ignoreQueryPrefix: true,
    depth: 1,
  })

  const filePaths = getFilePathParts(path)

  let queryParams = undefined
  if (Object.keys(params).length > 0) {
    queryParams = params
  }

  const paths = filePaths?.map((location, index) => ({
    pageName: 'commitTreeView',
    text: location,
    options: {
      tree: getTreeLocation(filePaths, location, index),
      commit,
      queryParams,
    },
  }))

  const repoPath = {
    pageName: 'commitTreeView',
    text: repo,
    options: { commit, queryParams },
  }
  const treePaths = [repoPath, ...paths]
  return { treePaths }
}
