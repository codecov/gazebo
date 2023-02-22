import dropRight from 'lodash/dropRight'
import { useParams } from 'react-router-dom'

import { getFilePathParts } from 'shared/utils/url'

function getTreeLocation(paths, index) {
  return dropRight(paths, paths.length - index - 1).join('/')
}

export function usePullTreePaths() {
  const { repo, path } = useParams()
  const filePaths = getFilePathParts(path)

  const paths =
    filePaths &&
    filePaths.map((location, index) => ({
      pageName: 'pullTreeView',
      text: location,
      options: {
        tree: getTreeLocation(filePaths, index),
      },
    }))

  const repoPath = {
    pageName: 'pullTreeView',
    text: repo,
  }
  const treePaths = [repoPath, ...paths]
  return { treePaths }
}
