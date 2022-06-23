import dropRight from 'lodash/dropRight'
import indexOf from 'lodash/indexOf'
import { useParams } from 'react-router-dom'

function getTreeLocation(paths, location) {
  return dropRight(paths, paths.length - indexOf(paths, location) - 1).join('/')
}

export function useTreePaths() {
  const { branch, path, repo } = useParams()
  const filePaths = path?.split('/') ?? []

  const paths =
    filePaths &&
    filePaths.map((location) => ({
      pageName: 'treeView',
      text: location,
      options: { tree: getTreeLocation(filePaths, location), ref: branch },
    }))

  const repoPath = {
    pageName: 'treeView',
    text: repo,
    options: { ref: branch },
  }
  const treePaths = [repoPath, ...paths]
  return { treePaths }
}
