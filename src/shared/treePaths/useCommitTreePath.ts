import dropRight from 'lodash/dropRight'
import qs from 'qs'
import { useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import { getFilePathParts } from 'shared/utils/url'

function getTreeLocation(
  paths: string | any[] | Array<unknown> | null | undefined,
  location: string,
  index: number
) {
  return dropRight(paths, paths.length - index - 1).join('/')
}

interface URLParams {
  repo: string
  path: string
  commit: string
}

export function useCommitTreePaths() {
  const { repo, path, commit } = useParams<URLParams>()
  const location = useLocation()

  const params = useMemo(() => {
    return qs.parse(location.search, {
      ignoreQueryPrefix: true,
      depth: 1,
    })
  }, [location.search])

  const treePaths = useMemo(() => {
    let queryParams = undefined
    if (Object.keys(params).length > 0) {
      queryParams = params
    }

    const filePaths = getFilePathParts(path)
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
    return [repoPath, ...paths]
  }, [commit, repo, params, path])
  return { treePaths }
}
