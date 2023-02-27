import dropRight from 'lodash/dropRight'
import { useParams } from 'react-router-dom'

import { getFilePathParts } from 'shared/utils/url'

function getTreeLocation(paths, location, index) {
  return dropRight(paths, paths.length - index - 1).join('/')
}

export function useCommitTreePaths() {
  const { repo, path, commit } = useParams()
  const filePaths = getFilePathParts(path)

  const paths = filePaths?.map((location, index) => ({
    pageName: 'commitTreeView',
    text: location,
    options: {
      tree: getTreeLocation(filePaths, location, index),
      commit,
    },
  }))

  const repoPath = {
    pageName: 'commitTreeView',
    text: repo,
    options: { commit },
  }
  const treePaths = [repoPath, ...paths]
  return { treePaths }
}
