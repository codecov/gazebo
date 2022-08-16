import dropRight from 'lodash/dropRight'
import indexOf from 'lodash/indexOf'
import { useParams } from 'react-router-dom'

import { getFilePathParts } from 'shared/utils/url'

function getTreeLocation(paths, location) {
  return dropRight(paths, paths.length - indexOf(paths, location) - 1).join('/')
}

export function useTreePaths() {
  const { branch, path, repo, ref } = useParams()
  const filePaths = getFilePathParts(path)

  const paths =
    filePaths &&
    filePaths.map((location) => ({
      pageName: 'treeView',
      text: location,
      options: {
        tree: getTreeLocation(filePaths, location),
        ref: branch ?? ref,
      },
    }))

  const repoPath = {
    pageName: 'treeView',
    text: repo,
    options: { ref: branch ?? ref },
  }
  const treePaths = [repoPath, ...paths]
  return { treePaths }
}
