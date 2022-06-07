import dropRight from 'lodash/dropRight'
import indexOf from 'lodash/indexOf'
import { useParams } from 'react-router-dom'

function getTreeLocation(paths, location) {
  return dropRight(paths, paths.length - indexOf(paths, location) - 1).join('/')
}

export function useTreePaths() {
  const urlParams = useParams()

  const path = urlParams?.path?.split('/') ?? []

  const paths = [urlParams.repo, ...path]

  const treePaths =
    paths &&
    paths.map((location) => ({
      pageName: 'treeView',
      text: location,
      options: { tree: getTreeLocation(paths, location) },
    }))
  return { treePaths }
}
