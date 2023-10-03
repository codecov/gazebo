import dropRight from 'lodash/dropRight'
import { useParams } from 'react-router-dom'

import { useLocationParams } from 'services/navigation'
import { getFilePathParts } from 'shared/utils/url'

function getTreeLocation(paths, location, index) {
  return dropRight(paths, paths.length - index - 1).join('/')
}

export function useCommitTreePaths() {
  const { params } = useLocationParams()
  const { repo, path, commit } = useParams()
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
