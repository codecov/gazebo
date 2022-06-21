import dropRight from 'lodash/dropRight'
import indexOf from 'lodash/indexOf'
import { useParams } from 'react-router-dom'

function getTreeLocation(paths, location) {
  return dropRight(paths, paths.length - indexOf(paths, location) - 1).join('/')
}

export function useTreePaths() {
  const urlParams = useParams()
  const branch = urlParams?.branch
  const filePaths = urlParams?.path?.split('/') ?? []

  const paths =
    filePaths &&
    filePaths.map((location) => ({
      pageName: 'treeView',
      text: location,
      options: { tree: getTreeLocation(filePaths, location), ref: branch },
    }))

  const repoPath = {
    pageName: 'treeView',
    text: urlParams?.repo,
    options: { ref: branch },
  }
  const treePaths = [repoPath, ...paths]
  return { treePaths }
}
