import dropRight from 'lodash/dropRight'
import qs, { ParsedQs } from 'qs'
import { useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import { useRepoOverview } from 'services/repo'
import { getFilePathParts } from 'shared/utils/url'

function getTreeLocation(paths: string[], index: number) {
  return dropRight(paths, paths.length - index - 1).join('/')
}

export function useTreePaths(passedPath?: string) {
  const location = useLocation()

  const params: ParsedQs = useMemo(() => {
    return qs.parse(location.search, {
      ignoreQueryPrefix: true,
      depth: 1,
    })
  }, [location.search])

  interface URLParams {
    provider: string
    owner: string
    branch: string
    path: string
    repo: string
    ref: string
  }

  const {
    provider,
    owner,
    branch: urlBranch,
    path: urlPath,
    repo,
    ref: urlRef,
  } = useParams<URLParams>()

  const { data: repoOverview } = useRepoOverview({
    provider,
    repo,
    owner,
  })

  const treePaths = useMemo(() => {
    const branch = urlBranch && decodeURIComponent(urlBranch)
    const ref = urlRef && decodeURIComponent(urlRef)
    const path = urlPath && decodeURIComponent(urlPath)
    const filePaths = getFilePathParts(passedPath || path)
    const defaultBranch = repoOverview?.defaultBranch

    let queryParams: ParsedQs | undefined = undefined
    if (Object.keys(params).length > 0) {
      queryParams = params
    }

    const paths = filePaths?.map((location, index) => ({
      pageName: 'treeView',
      text: location,
      options: {
        tree: getTreeLocation(filePaths, index),
        ref: branch ?? ref ?? defaultBranch,
        queryParams,
      },
    }))

    const repoPath = {
      pageName: 'treeView',
      text: repo,
      options: {
        ref: branch ?? ref ?? defaultBranch,
        queryParams,
      },
    }

    return [repoPath, ...paths]
  }, [urlBranch, urlRef, urlPath, passedPath, repoOverview, params, repo])

  return { treePaths }
}
