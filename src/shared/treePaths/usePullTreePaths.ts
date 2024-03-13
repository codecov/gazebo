import dropRight from 'lodash/dropRight'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { getFilePathParts } from 'shared/utils/url'

function getTreeLocation(paths: string[], index: number) {
  return dropRight(paths, paths.length - index - 1).join('/')
}

interface URLParams {
  repo: string
  path: string
}

export function usePullTreePaths() {
  const { repo, path } = useParams<URLParams>()
  const treePaths = useMemo(() => {
    const filePaths = getFilePathParts(path)
    const paths = filePaths?.map((location: string, index: number) => ({
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

    return [repoPath, ...paths]
  }, [repo, path])

  return { treePaths }
}
