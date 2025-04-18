import isArray from 'lodash/isArray'
import isString from 'lodash/isString'
import qs, { ParsedQs } from 'qs'
import { useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import {
  PathContentsFilters,
  toPathContentsFilterParameter,
} from 'services/pathContents/constants'
import {
  PathContentDir,
  PathContentFile,
  useRepoPullContents,
} from 'services/pathContents/pull/dir'
import { displayTypeParameter } from 'shared/ContentsTable/constants'
import PullDirEntry from 'shared/ContentsTable/TableEntries/PullEntries/PullDirEntry'
import PullFileEntry from 'shared/ContentsTable/TableEntries/PullEntries/PullFileEntry'
import { useTableDefaultSort } from 'shared/ContentsTable/useTableDefaultSort'
import { adjustListIfUpDir } from 'shared/ContentsTable/utils'
import { usePullTreePaths } from 'shared/treePaths'
import { determineProgressColor } from 'shared/utils/determineProgressColor'
import CoverageProgress from 'ui/CoverageProgress'

import { FileExplorerColumn } from './FileExplorerTable'

interface URLParams {
  provider: string
  owner: string
  repo: string
  path: string
  pullId: string
}

function useFileExplorerTableData() {
  const {
    provider,
    owner,
    repo,
    path: urlPath,
    pullId,
  } = useParams<URLParams>()
  const location = useLocation()
  const { treePaths } = usePullTreePaths()
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

  const { data: pullData, isLoading } = useRepoPullContents({
    provider,
    owner,
    repo,
    pullId,
    path: urlPath || '',
    filters,
    opts: {
      suspense: false,
    },
  })

  const data = useMemo(() => {
    const tableData = pullData?.results

    if (!tableData?.length) {
      return []
    }

    const rawTableRows: FileExplorerColumn[] = tableData.map(
      (file: PathContentFile | PathContentDir) => ({
        name:
          file.__typename === 'PathContentDir' ? (
            <PullDirEntry
              name={file.name}
              pullId={pullId}
              urlPath={urlPath}
              filters={filters}
            />
          ) : (
            <PullFileEntry
              commitSha={pullData?.commitid || ''}
              name={file.name}
              urlPath={urlPath}
              path={file.path || ''}
              displayType={
                filters?.displayType === displayTypeParameter.list ||
                filters?.searchValue
                  ? displayTypeParameter.list
                  : displayTypeParameter.tree
              }
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
              ...(pullData?.indicationRange || {
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
  }, [pullData, filters, treePaths, pullId, urlPath])

  return {
    data,
    pathContentsType: pullData?.pathContentsType,
    isLoading,
    isSearching: !!search,
    hasComponentsSelected: !!components && components.length > 0,
    hasFlagsSelected: !!flags && flags.length > 0,
    sortBy,
    setSortBy,
  }
}

export default useFileExplorerTableData
