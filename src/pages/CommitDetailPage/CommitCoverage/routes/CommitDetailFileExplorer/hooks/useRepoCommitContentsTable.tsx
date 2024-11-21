import isArray from 'lodash/isArray'
import isString from 'lodash/isString'
import qs, { ParsedQs } from 'qs'
import { useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import { useRepoCommitContents } from 'services/pathContents/commit/dir'
import {
  PathContentsFilters,
  toPathContentsFilterParameter,
} from 'services/pathContents/constants'
import { PathContentDir, PathContentFile } from 'services/pathContents/pull/dir'
import { displayTypeParameter } from 'shared/ContentsTable/constants'
import CommitDirEntry from 'shared/ContentsTable/TableEntries/CommitEntries/CommitDirEntry'
import CommitFileEntry from 'shared/ContentsTable/TableEntries/CommitEntries/CommitFileEntry'
import { useTableDefaultSort } from 'shared/ContentsTable/useTableDefaultSort'
import { adjustListIfUpDir } from 'shared/ContentsTable/utils'
import { useCommitTreePaths } from 'shared/treePaths'
import { determineProgressColor } from 'shared/utils/determineProgressColor'
import CoverageProgress from 'ui/CoverageProgress'

interface URLParams {
  provider: string
  owner: string
  repo: string
  path: string
  commit: string
}

export function useRepoCommitContentsTable() {
  const {
    provider,
    owner,
    repo,
    path: urlPath,
    commit,
  } = useParams<URLParams>()
  const location = useLocation()
  const [sortBy, setSortBy] = useTableDefaultSort()

  const { components, flags, search, displayType } = useMemo(() => {
    const queryParams = qs.parse(location.search, {
      ignoreQueryPrefix: true,
      depth: 1,
    })

    let components: string[] | ParsedQs[] | undefined
    if (isArray(queryParams?.components) && queryParams?.components?.length) {
      components = queryParams.components
    }
    let flags: string[] | ParsedQs[] | undefined
    if (isArray(queryParams?.flags) && queryParams?.flags?.length) {
      flags = queryParams.flags
    }
    let search: string = ''
    if (isString(queryParams?.search)) {
      search = queryParams.search
    }
    let displayType: 'tree' | 'list' | undefined
    if (
      isString(queryParams?.displayType) &&
      (queryParams.displayType === 'tree' || queryParams.displayType === 'list')
    ) {
      displayType = queryParams.displayType
    }

    return {
      components,
      flags,
      search,
      displayType,
    }
  }, [location.search])

  const filters = useMemo<PathContentsFilters>(
    () => ({
      searchValue: search,
      displayType: displayType
        ? displayTypeParameter[displayType]
        : displayTypeParameter.tree,
      ordering:
        sortBy.length && sortBy[0]?.id
          ? {
              direction: sortBy[0]?.desc ? 'DESC' : 'ASC',
              parameter: toPathContentsFilterParameter(sortBy[0].id),
            }
          : undefined,
      components,
      flags,
    }),
    [sortBy, components, flags, search, displayType]
  )

  const { data: commitData, isLoading: commitIsLoading } =
    useRepoCommitContents({
      provider,
      owner,
      repo,
      commit,
      path: urlPath || '',
      filters,
      opts: {
        suspense: false,
      },
    })

  const { treePaths } = useCommitTreePaths()

  const data = useMemo(() => {
    const tableData = commitData?.results

    if (!tableData?.length) {
      return []
    }

    const rawTableRows = tableData?.map(
      (file: PathContentFile | PathContentDir) => ({
        name:
          file.__typename === 'PathContentDir' ? (
            <CommitDirEntry
              name={file.name}
              commitSha={commit}
              urlPath={urlPath}
              filters={filters}
            />
          ) : (
            <CommitFileEntry
              name={file.name}
              urlPath={urlPath}
              commitSha={commit}
              path={file.path || ''}
              displayType={
                filters?.displayType === displayTypeParameter.list ||
                filters?.searchValue
                  ? displayTypeParameter.list
                  : displayTypeParameter.tree
              }
              isCriticalFile={file.isCriticalFile}
              filters={filters}
            />
          ),
        lines: file.lines.toString(),
        hits: file.hits.toString(),
        partials: file.partials.toString(),
        misses: file.misses.toString(),
        coverage: (
          <CoverageProgress
            amount={file.percentCovered}
            color={determineProgressColor({
              coverage: file.percentCovered,
              ...(commitData?.indicationRange || {
                upperRange: 0,
                lowerRange: 100,
              }),
            })}
          />
        ),
      })
    )

    return adjustListIfUpDir({
      treePaths,
      displayType: filters?.displayType || displayTypeParameter.tree,
      rawTableRows,
    })
  }, [commitData, filters, treePaths, commit, urlPath])

  return {
    data,
    pathContentsType: commitData?.pathContentsType,
    isLoading: commitIsLoading,
    isSearching: !!search,
    sortBy,
    setSortBy,
    hasComponentsSelected: !!components && components.length > 0,
    hasFlagsSelected: !!flags && flags.length > 0,
  }
}
